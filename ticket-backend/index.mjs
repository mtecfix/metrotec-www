// MetroTec ticket submission Lambda
// Runtime: Node.js 20.x (ESM). Uses AWS SDK v3 (bundled in the Lambda runtime).
//
// Flow: API Gateway (POST /tickets) -> this handler -> validate input
//   -> write ticket to DynamoDB -> send notification email via SES.
//
// Security notes:
//  - Validates and length-caps all fields.
//  - Honeypot field "company_website" must be empty (bots fill it) -> silently
//    accepted but dropped (returns success without storing) to not tip off bots.
//  - CORS restricted to the known site origins.

import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  QueryCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { CognitoIdentityProviderClient, AdminCreateUserCommand } from "@aws-sdk/client-cognito-identity-provider";

const TABLE = process.env.TICKET_TABLE || "metrotec-tickets";
const TOPIC_ARN = process.env.TOPIC_ARN || "arn:aws:sns:us-east-1:663877906756:metrotec-ticket-notifications";
const AI_MODEL = process.env.AI_MODEL || "us.anthropic.claude-haiku-4-5-20251001-v1:0";
const CUSTOMER_POOL_ID = process.env.CUSTOMER_POOL_ID || "us-east-1_Qntxlc9eP";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sns = new SNSClient({});
const bedrock = new BedrockRuntimeClient({});
const cognito = new CognitoIdentityProviderClient({});

// Allowed origins for CORS. Adjust as the site's real domains are finalized.
const ALLOWED_ORIGINS = [
  "https://metrotec-www.s3-website-us-east-1.amazonaws.com",
  "http://metrotec.s3-website.us-east-2.amazonaws.com",
  "https://metrotec.biz",
  "https://metrotec.com",
  "http://localhost:8080",
];

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

function clean(v, max) {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_PRIORITIES = new Set(["low", "normal", "high", "urgent"]);
const VALID_STATUSES = new Set(["new", "open", "pending", "resolved", "closed"]);

export const handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || "";
  const headers = corsHeaders(origin);
  const method = event.requestContext?.http?.method;
  const routeKey = event.routeKey || `${method} ${event.rawPath || ""}`;
  const rawPath = event.rawPath || "";

  // CORS preflight
  if (method === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  try {
    // Customer (self-service) routes — identity comes from JWT claims
    if (method === "GET" && rawPath === "/my-tickets") return await handleMyTickets(event, headers);
    if (method === "POST" && rawPath.startsWith("/my-tickets/")) return await handleMyComment(event, headers);

    // Staff + public routes
    if (method === "POST" && rawPath === "/customers") return await handleCreateCustomer(event, headers);
    if (method === "POST" && rawPath.endsWith("/ai-draft")) return await handleAiDraft(event, headers);
    if (method === "POST" && rawPath.startsWith("/tickets/") && rawPath.endsWith("/reply")) return await handleStaffReply(event, headers);
    if (method === "POST") return await handleCreate(event, headers);
    if (method === "GET") return await handleList(event, headers);
    if (method === "PATCH") return await handleUpdate(event, headers);
  } catch (err) {
    console.error("Unhandled error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
  return { statusCode: 404, headers, body: JSON.stringify({ error: "Not found", routeKey }) };
};

// Extract the authenticated user's email from the JWT authorizer claims.
function claimEmail(event) {
  const claims = event.requestContext?.authorizer?.jwt?.claims || {};
  return (claims.email || "").toLowerCase();
}

// Publish a notification to the team SNS topic. Never throws (best-effort).
async function notify(subject, message) {
  try {
    await sns.send(new PublishCommand({
      TopicArn: TOPIC_ARN,
      Subject: subject.slice(0, 100),
      Message: message,
    }));
  } catch (err) {
    console.error("SNS notify error (non-fatal):", err);
  }
}

// Generate a temporary password that satisfies the Cognito policy
// (>=12 chars, upper/lower/number/symbol).
function tempPassword() {
  const U = "ABCDEFGHJKLMNPQRSTUVWXYZ", L = "abcdefghijkmnpqrstuvwxyz";
  const N = "23456789", S = "!@#$%^&*";
  const all = U + L + N + S;
  const pick = (set) => set[Math.floor(Math.random() * set.length)];
  let p = pick(U) + pick(L) + pick(N) + pick(S);
  for (let i = 0; i < 10; i++) p += pick(all);
  return p;
}

// ── Staff: create a customer portal account (staff-JWT protected) ──
async function handleCreateCustomer(event, headers) {
  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const email = clean(body.email, 200).toLowerCase();
  const name = clean(body.name, 120);
  if (!EMAIL_RE.test(email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "A valid email is required" }) };
  }

  const temp = tempPassword();
  const attrs = [
    { Name: "email", Value: email },
    { Name: "email_verified", Value: "true" },
  ];
  if (name) attrs.push({ Name: "name", Value: name });

  try {
    await cognito.send(new AdminCreateUserCommand({
      UserPoolId: CUSTOMER_POOL_ID,
      Username: email,
      TemporaryPassword: temp,
      MessageAction: "SUPPRESS", // we relay credentials ourselves
      UserAttributes: attrs,
    }));
  } catch (err) {
    if (err.name === "UsernameExistsException") {
      return { statusCode: 409, headers, body: JSON.stringify({ error: "A customer with that email already exists" }) };
    }
    console.error("Cognito create error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Could not create customer" }) };
  }

  await notify(
    `New client portal account created: ${email}`,
    `A staff member created a client portal account.\n\nEmail: ${email}\nName: ${name || "(none)"}\n\nProvide the temporary password to the client; they will set their own on first login.`
  );

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, email, tempPassword: temp }) };
}

// ── Customer: list only the caller's own tickets (by JWT email) ──
async function handleMyTickets(event, headers) {
  const email = claimEmail(event);
  if (!email) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "No identity" }) };
  }
  const res = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: "email-index",
    KeyConditionExpression: "email = :e",
    ExpressionAttributeValues: { ":e": email },
  }));
  const items = (res.Items || []).sort((a, b) =>
    (b.createdAt || "").localeCompare(a.createdAt || "")
  );
  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, tickets: items }) };
}

// ── Customer: add a comment to one of the caller's own tickets ──
async function handleMyComment(event, headers) {
  const email = claimEmail(event);
  if (!email) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "No identity" }) };
  }
  const parts = (event.rawPath || "").split("/"); // ["","my-tickets","{id}","comment"]
  const ticketId = parts[2] ? decodeURIComponent(parts[2]) : "";
  if (!ticketId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing ticketId" }) };
  }
  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const text = clean(body.comment, 5000);
  if (!text) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "comment is required" }) };
  }

  const comment = { author: email, role: "customer", text, at: new Date().toISOString() };

  try {
    const res = await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: { ticketId },
      // Only allow the comment if this ticket belongs to the caller.
      ConditionExpression: "attribute_exists(ticketId) AND email = :e",
      UpdateExpression: "SET #c = list_append(if_not_exists(#c, :empty), :cmt)",
      ExpressionAttributeNames: { "#c": "comments" },
      ExpressionAttributeValues: { ":e": email, ":empty": [], ":cmt": [comment] },
      ReturnValues: "ALL_NEW",
    }));
    await notify(
      `[Ticket ${ticketId}] Customer replied`,
      `The customer replied on ticket ${ticketId}.\n\nFrom: ${email}\nSubject: ${res.Attributes?.subject || ""}\n\nReply:\n${text}\n\nOpen the staff dashboard to respond.`
    );
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ticket: res.Attributes }) };
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return { statusCode: 403, headers, body: JSON.stringify({ error: "Not your ticket" }) };
    }
    throw err;
  }
}

// ── Public: create a ticket ──
async function handleCreate(event, headers) {
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  // Honeypot: if filled, pretend success but do nothing.
  if (clean(body.company_website, 100)) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ticketId: "n/a" }) };
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const subject = clean(body.subject, 200);
  const message = clean(body.message, 5000);
  let priority = clean(body.priority, 10).toLowerCase();
  if (!VALID_PRIORITIES.has(priority)) priority = "normal";

  const errors = [];
  if (!name) errors.push("name is required");
  if (!EMAIL_RE.test(email)) errors.push("a valid email is required");
  if (!subject) errors.push("subject is required");
  if (!message) errors.push("message is required");
  if (errors.length) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: errors.join("; ") }) };
  }

  const ticketId = "MT-" + Date.now().toString(36).toUpperCase() + "-" +
    randomUUID().slice(0, 4).toUpperCase();
  const createdAt = new Date().toISOString();

  const item = {
    ticketId,
    name,
    email,
    subject,
    message,
    priority,
    status: "new",
    createdAt,
    sourceIp: event.requestContext?.http?.sourceIp || "unknown",
  };

  try {
    await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  } catch (err) {
    console.error("DynamoDB error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Could not save ticket" }) };
  }

  // Notify the team via SNS (email subscription on the topic).
  try {
    await sns.send(new PublishCommand({
      TopicArn: TOPIC_ARN,
      Subject: `[Ticket ${ticketId}] ${subject} (${priority})`.slice(0, 100),
      Message:
        `New support ticket\n\n` +
        `Ticket: ${ticketId}\n` +
        `From: ${name} <${email}>\n` +
        `Priority: ${priority}\n` +
        `Created: ${createdAt}\n` +
        `Source IP: ${item.sourceIp}\n\n` +
        `Message:\n${message}\n`,
    }));
  } catch (err) {
    // Ticket is already saved; notification failure shouldn't fail the request.
    console.error("SNS error (ticket still saved):", err);
  }

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ticketId }) };
}

// ── Staff: list all tickets (protected by Cognito JWT authorizer) ──
async function handleList(event, headers) {
  const res = await ddb.send(new ScanCommand({ TableName: TABLE }));
  const items = (res.Items || []).sort((a, b) =>
    (b.createdAt || "").localeCompare(a.createdAt || "")
  );
  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, tickets: items }) };
}

// ── Staff: update a ticket's status/priority (protected) ──
async function handleUpdate(event, headers) {
  const ticketId =
    event.pathParameters?.ticketId ||
    (event.rawPath || "").split("/").pop();
  if (!ticketId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing ticketId" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const sets = [];
  const names = {};
  const values = {};

  if (body.status !== undefined) {
    const status = String(body.status).toLowerCase();
    if (!VALID_STATUSES.has(status)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid status" }) };
    }
    sets.push("#s = :s");
    names["#s"] = "status";
    values[":s"] = status;
  }
  if (body.priority !== undefined) {
    const priority = String(body.priority).toLowerCase();
    if (!VALID_PRIORITIES.has(priority)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid priority" }) };
    }
    sets.push("#p = :p");
    names["#p"] = "priority";
    values[":p"] = priority;
  }
  if (!sets.length) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Nothing to update" }) };
  }

  sets.push("#u = :u");
  names["#u"] = "updatedAt";
  values[":u"] = new Date().toISOString();

  const res = await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { ticketId },
    UpdateExpression: "SET " + sets.join(", "),
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ConditionExpression: "attribute_exists(ticketId)",
    ReturnValues: "ALL_NEW",
  }));

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ticket: res.Attributes }) };
}

// ── Staff: post a reply into the ticket thread (visible to the customer) ──
async function handleStaffReply(event, headers) {
  const staffEmail = claimEmail(event) || "staff";
  const parts = (event.rawPath || "").split("/"); // ["","tickets","{id}","reply"]
  const ticketId = parts[2] ? decodeURIComponent(parts[2]) : "";
  if (!ticketId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing ticketId" }) };
  }
  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const text = clean(body.reply, 5000);
  if (!text) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "reply is required" }) };
  }
  const comment = { author: staffEmail, role: "staff", text, at: new Date().toISOString() };

  const res = await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { ticketId },
    ConditionExpression: "attribute_exists(ticketId)",
    UpdateExpression: "SET #c = list_append(if_not_exists(#c, :empty), :cmt)",
    ExpressionAttributeNames: { "#c": "comments" },
    ExpressionAttributeValues: { ":empty": [], ":cmt": [comment] },
    ReturnValues: "ALL_NEW",
  }));
  const custEmail = res.Attributes?.email || "unknown";
  // NOTE: To email the customer directly requires SES production access.
  // Until then, we log an audit notification to the team SNS topic. Once SES
  // prod access is granted, add an ses:SendEmail here to `custEmail`.
  await notify(
    `[Ticket ${ticketId}] Staff replied (customer: ${custEmail})`,
    `A staff reply was posted on ticket ${ticketId} for customer ${custEmail}.\n\nReply:\n${text}\n\nThe customer can view it in the client portal. (Direct customer email pending SES production access.)`
  );
  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ticket: res.Attributes }) };
}

// ── Staff: AI-assisted draft reply + summary (human reviews before sending) ──
async function handleAiDraft(event, headers) {
  const parts = (event.rawPath || "").split("/"); // ["","tickets","{id}","ai-draft"]
  const ticketId = parts[2] ? decodeURIComponent(parts[2]) : "";
  if (!ticketId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing ticketId" }) };
  }

  // Load the ticket + thread.
  const got = await ddb.send(new GetCommand({
    TableName: TABLE, Key: { ticketId },
  }));
  const t = got.Item;
  if (!t) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: "Ticket not found" }) };
  }

  const thread = (t.comments || [])
    .map((c) => `${c.role === "staff" ? "MetroTec" : "Customer"}: ${c.text}`)
    .join("\n");

  const prompt =
    `You are a support assistant for MetroTec, a Metro Detroit managed IT services provider. ` +
    `Draft a professional, concise, friendly reply a support agent could send to the customer. ` +
    `Do NOT invent specific facts, prices, timelines, or promises. If information is missing, ask a clarifying question. ` +
    `Do not give risky security instructions; recommend a technician when appropriate.\n\n` +
    `TICKET SUBJECT: ${t.subject}\n` +
    `PRIORITY: ${t.priority}\n` +
    `ORIGINAL MESSAGE: ${t.message}\n` +
    (thread ? `CONVERSATION SO FAR:\n${thread}\n` : "") +
    `\nRespond with:\n1) A one-sentence internal summary of the issue.\n2) A suggested reply to the customer.\nLabel them "SUMMARY:" and "DRAFT REPLY:".`;

  try {
    const out = await bedrock.send(new ConverseCommand({
      modelId: AI_MODEL,
      messages: [{ role: "user", content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens: 600, temperature: 0.3 },
    }));
    const textOut = (out.output?.message?.content || [])
      .map((c) => c.text || "").join("\n").trim();
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ai: textOut }) };
  } catch (err) {
    console.error("Bedrock error:", err);
    return { statusCode: 502, headers, body: JSON.stringify({ error: "AI draft unavailable: " + (err.name || "error") }) };
  }
}
