// MetroTec newsletter subscribe Lambda
// Runtime: Node.js 20.x (ESM). SDK v3 clients are in the Lambda runtime.
//
// POST /subscribe  { email, source, company_website(honeypot) }
//   -> validate -> store subscriber in DynamoDB (idempotent) -> 200
//
// Single opt-in for now (stores immediately). A double opt-in confirmation
// email can be added once SES production access is granted; the schema
// already carries a "status" field for that upgrade.

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const TABLE = process.env.SUBSCRIBER_TABLE || "metrotec-subscribers";
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const ALLOWED_ORIGINS = [
  "https://metrotec-www.s3-website-us-east-1.amazonaws.com",
  "http://metrotec-www.s3-website-us-east-1.amazonaws.com",
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || "";
  const headers = corsHeaders(origin);

  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  // Honeypot: pretend success, store nothing.
  if ((body.company_website || "").trim()) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  const email = String(body.email || "").trim().toLowerCase().slice(0, 200);
  const source = String(body.source || "site").trim().slice(0, 120);
  if (!EMAIL_RE.test(email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Please enter a valid email address." }) };
  }

  const now = new Date().toISOString();
  try {
    await ddb.send(new PutCommand({
      TableName: TABLE,
      Item: {
        email,
        status: "subscribed",      // becomes "confirmed" once double opt-in is added
        source,
        subscribedAt: now,
        ip: event.requestContext?.http?.sourceIp || "unknown",
      },
      // Don't overwrite an existing subscriber's original signup date.
      ConditionExpression: "attribute_not_exists(email)",
    }));
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      // Already subscribed — treat as success (idempotent, no leak).
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, already: true }) };
    }
    console.error("DynamoDB error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Could not subscribe. Please try again." }) };
  }

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
};
