// MetroTec Admin Portal - JavaScript
(function() {
  'use strict';

  // ── Config ──
  const REGION = 'us-east-1';
  const CLIENT_ID = '6a0ot47m7o1hsupjc5l593l5db';
  const API_URL = 'https://sebm7k9d9c.execute-api.us-east-1.amazonaws.com';
  const COGNITO = `https://cognito-idp.${REGION}.amazonaws.com/`;

  let idToken = sessionStorage.getItem('mt_id_token') || null;
  let session = null, pendingEmail = null;
  let allTickets = [];

  // ── DOM Refs ──
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  // ── Cognito Helper ──
  function cognito(target, body) {
    return fetch(COGNITO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-amz-json-1.1', 'X-Amz-Target': `AWSCognitoIdentityProviderService.${target}` },
      body: JSON.stringify(body)
    }).then(r => r.json().then(d => ({ ok: r.ok, d })));
  }

  // ── API Helper ──
  function api(method, path, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` }
    };
    if (body) opts.body = JSON.stringify(body);
    return fetch(API_URL + path, opts).then(r => r.json());
  }

  // ── Navigation ──
  function navigate(section) {
    $$('.section').forEach(s => s.classList.add('hidden'));
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    const target = $(`#${section}Section`);
    if (target) target.classList.remove('hidden');
    const navItem = $(`.nav-item[data-section="${section}"]`);
    if (navItem) navItem.classList.add('active');
    $('#pageTitle').textContent = section.charAt(0).toUpperCase() + section.slice(1);
  }

  // ── Init Nav Listeners ──
  $$('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      navigate(section);
      if (section === 'tickets') renderTickets();
      if (section === 'dashboard') renderDashboard();
      // Close mobile sidebar
      $('#sidebar').classList.remove('open');
    });
  });

  // Mobile menu toggle
  $('#menuToggle').addEventListener('click', () => {
    $('#sidebar').classList.toggle('open');
  });

  // ── Login ──
  $('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#loginEmail').value.trim();
    const pass = $('#loginPass').value;
    const btn = $('#loginBtn');
    const msg = $('#loginMsg');
    btn.disabled = true; btn.textContent = 'Signing in…';

    cognito('InitiateAuth', { AuthFlow: 'USER_PASSWORD_AUTH', ClientId: CLIENT_ID, AuthParameters: { USERNAME: email, PASSWORD: pass } })
    .then(res => {
      if (res.ok && res.d.AuthenticationResult) {
        idToken = res.d.AuthenticationResult.IdToken;
        sessionStorage.setItem('mt_id_token', idToken);
        enterDashboard(email);
      } else if (res.d.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
        session = res.d.Session; pendingEmail = email;
        $('#newPassBlock').classList.remove('hidden');
        showAlert(msg, 'Set a new password to continue.', 'ok');
      } else {
        showAlert(msg, res.d.message || 'Login failed.', 'err');
      }
    })
    .catch(() => showAlert(msg, 'Network error.', 'err'))
    .finally(() => { btn.disabled = false; btn.textContent = 'Sign In'; });
  });

  // New password challenge
  $('#newPassBtn').addEventListener('click', () => {
    const np = $('#newPass').value;
    if (np.length < 12) { showAlert($('#loginMsg'), 'Password must be at least 12 characters.', 'err'); return; }
    cognito('RespondToAuthChallenge', {
      ClientId: CLIENT_ID, ChallengeName: 'NEW_PASSWORD_REQUIRED', Session: session,
      ChallengeResponses: { USERNAME: pendingEmail, NEW_PASSWORD: np }
    }).then(res => {
      if (res.ok && res.d.AuthenticationResult) {
        idToken = res.d.AuthenticationResult.IdToken;
        sessionStorage.setItem('mt_id_token', idToken);
        enterDashboard(pendingEmail);
      } else {
        showAlert($('#loginMsg'), res.d.message || 'Failed.', 'err');
      }
    });
  });

  // ── Logout ──
  $('#logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('mt_id_token');
    idToken = null;
    location.reload();
  });

  // ── Refresh ──
  $('#refreshBtn').addEventListener('click', () => loadTickets());

  // ── Enter Dashboard ──
  function enterDashboard(email) {
    $('#loginSection').classList.add('hidden');
    $('#dashboardSection').classList.remove('hidden');
    if (email) $('#userBadge').textContent = email;
    else {
      try {
        const payload = JSON.parse(atob(idToken.split('.')[1]));
        $('#userBadge').textContent = payload.email || 'Staff';
      } catch(e) { $('#userBadge').textContent = 'Staff'; }
    }
    loadTickets();
  }

  // ── Load Tickets ──
  function loadTickets() {
    api('GET', '/tickets').then(data => {
      if (data.ok) {
        allTickets = data.tickets || [];
        renderDashboard();
        renderTickets();
      }
    }).catch(() => {
      // Token might be expired
      sessionStorage.removeItem('mt_id_token');
      location.reload();
    });
  }

  // ── Render Dashboard Stats ──
  function renderDashboard() {
    const total = allTickets.length;
    const open = allTickets.filter(t => t.status === 'new' || t.status === 'open').length;
    const resolved = allTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    const urgent = allTickets.filter(t => t.priority === 'urgent' || t.priority === 'high').length;

    $('#statTotal').textContent = total;
    $('#statOpen').textContent = open;
    $('#statResolved').textContent = resolved;
    $('#statUrgent').textContent = urgent;

    // Recent tickets (last 5)
    const recent = allTickets.slice(0, 5);
    const html = recent.map(t => `
      <div class="ticket-item" data-id="${t.ticketId}" style="cursor:pointer;">
        <span class="pill pill-${t.priority}">${t.priority}</span>
        <div class="ticket-meta">
          <h4>${esc(t.subject)}</h4>
          <span>${esc(t.name)} · ${timeAgo(t.createdAt)}</span>
        </div>
        <span class="pill pill-${t.status}">${t.status}</span>
      </div>
    `).join('');
    $('#recentTickets').innerHTML = html || '<p class="text-muted">No tickets yet.</p>';

    // Click to open ticket
    $$('#recentTickets .ticket-item').forEach(el => {
      el.addEventListener('click', () => openTicketModal(el.dataset.id));
    });
  }

  // ── Render Tickets Table ──
  function renderTickets() {
    const statusFilter = $('#filterStatus').value;
    const priorityFilter = $('#filterPriority').value;

    let filtered = allTickets;
    if (statusFilter) filtered = filtered.filter(t => t.status === statusFilter);
    if (priorityFilter) filtered = filtered.filter(t => t.priority === priorityFilter);

    $('#ticketCount').textContent = `${filtered.length} ticket${filtered.length !== 1 ? 's' : ''}`;

    const rows = filtered.map(t => `
      <tr>
        <td><strong>${esc(t.ticketId)}</strong></td>
        <td>${esc(t.name)}<br><span class="text-muted">${esc(t.email)}</span></td>
        <td class="msg-text">${esc(t.subject)}</td>
        <td><span class="pill pill-${t.priority}">${t.priority}</span></td>
        <td>
          <select class="input-sm status-select" data-id="${t.ticketId}">
            ${['new','open','pending','resolved','closed'].map(s => `<option value="${s}" ${s===t.status?'selected':''}>${s}</option>`).join('')}
          </select>
        </td>
        <td class="text-muted">${formatDate(t.createdAt)}</td>
        <td><button class="btn btn-sm" data-view="${t.ticketId}">View</button></td>
      </tr>
    `).join('');

    $('#ticketTableBody').innerHTML = rows || '<tr><td colspan="7" class="text-muted">No tickets match filters.</td></tr>';

    // Status change listeners
    $$('.status-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        const status = e.target.value;
        api('PATCH', `/tickets/${encodeURIComponent(id)}`, { status }).then(data => {
          if (data.ok) {
            const idx = allTickets.findIndex(t => t.ticketId === id);
            if (idx >= 0) allTickets[idx].status = status;
            renderDashboard();
          }
        });
      });
    });

    // View button listeners
    $$('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => openTicketModal(btn.dataset.view));
    });
  }

  // Filter listeners
  $('#filterStatus').addEventListener('change', renderTickets);
  $('#filterPriority').addEventListener('change', renderTickets);

  // ── Ticket Modal ──
  function openTicketModal(ticketId) {
    const t = allTickets.find(x => x.ticketId === ticketId);
    if (!t) return;

    $('#modalTitle').textContent = `${t.ticketId} — ${t.subject}`;
    const comments = (t.comments || []).map(c => `
      <div style="margin-bottom:.75rem;padding:.75rem;background:${c.role==='staff'?'#e0f2fe':'#f1f5f9'};border-radius:8px;">
        <strong>${esc(c.author)}</strong> <span class="text-muted">(${c.role}) · ${formatDate(c.at)}</span>
        <p style="margin-top:.35rem;font-size:.88rem;">${esc(c.text)}</p>
      </div>
    `).join('');

    $('#modalBody').innerHTML = `
      <table class="table" style="margin-bottom:1rem;">
        <tr><td><strong>From</strong></td><td>${esc(t.name)} &lt;${esc(t.email)}&gt;</td></tr>
        <tr><td><strong>Priority</strong></td><td><span class="pill pill-${t.priority}">${t.priority}</span></td></tr>
        <tr><td><strong>Status</strong></td><td><span class="pill pill-${t.status}">${t.status}</span></td></tr>
        <tr><td><strong>Created</strong></td><td>${formatDate(t.createdAt)}</td></tr>
        <tr><td><strong>Source IP</strong></td><td>${t.sourceIp || '—'}</td></tr>
      </table>
      <div style="background:var(--gray-50);padding:1rem;border-radius:8px;margin-bottom:1rem;">
        <strong>Message:</strong>
        <p style="margin-top:.5rem;white-space:pre-wrap;">${esc(t.message)}</p>
      </div>
      ${comments ? `<h4 style="margin-bottom:.5rem;">Thread (${t.comments?.length || 0})</h4>${comments}` : ''}
      <div style="margin-top:1rem;">
        <textarea id="replyText" class="input" rows="3" placeholder="Type a reply..."></textarea>
        <button class="btn btn-primary btn-sm" style="margin-top:.5rem;" id="sendReplyBtn">Send Reply</button>
      </div>
    `;

    $('#ticketModal').classList.remove('hidden');

    // Reply handler
    $('#sendReplyBtn').addEventListener('click', () => {
      const text = $('#replyText').value.trim();
      if (!text) return;
      api('POST', `/tickets/${encodeURIComponent(ticketId)}/reply`, { reply: text }).then(data => {
        if (data.ok) {
          // Update local ticket
          const idx = allTickets.findIndex(x => x.ticketId === ticketId);
          if (idx >= 0) allTickets[idx] = data.ticket;
          openTicketModal(ticketId); // Re-render
        }
      });
    });
  }

  // Close modal
  $('#modalClose').addEventListener('click', () => $('#ticketModal').classList.add('hidden'));
  $('#modalBackdrop').addEventListener('click', () => $('#ticketModal').classList.add('hidden'));

  // ── Create Customer ──
  $('#createCustForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#custEmail').value.trim();
    const name = $('#custName').value.trim();
    const msg = $('#custMsg');

    api('POST', '/customers', { email, name }).then(data => {
      if (data.ok) {
        showAlert(msg, `Account created! Temp password: ${data.tempPassword}`, 'ok');
        $('#custEmail').value = ''; $('#custName').value = '';
      } else {
        showAlert(msg, data.error || 'Failed to create account.', 'err');
      }
    }).catch(() => showAlert(msg, 'Network error.', 'err'));
  });

  // ── Helpers ──
  function showAlert(el, text, type) {
    el.className = `alert alert-${type}`;
    el.textContent = text;
    el.classList.remove('hidden');
  }

  function esc(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  function timeAgo(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  // ── Auto-login if token exists ──
  if (idToken) {
    enterDashboard();
  }

})();
