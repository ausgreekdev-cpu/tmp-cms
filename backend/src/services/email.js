import nodemailer from 'nodemailer';
import { v4 as uuid } from 'uuid';
import db from '../db.js';

export function getConfig() {
  return db.prepare('SELECT * FROM email_config WHERE enabled = 1 LIMIT 1').get() || null;
}

export function saveConfig(data) {
  const existing = db.prepare('SELECT id FROM email_config LIMIT 1').get();
  if (existing) {
    const fields = []; const vals = [];
    Object.entries(data).forEach(([k, v]) => { if (v !== undefined) { fields.push(`${k}=?`); vals.push(v); } });
    if (fields.length === 0) return getConfig();
    fields.push("updated_at=datetime('now')");
    vals.push(existing.id);
    db.prepare(`UPDATE email_config SET ${fields.join(',')} WHERE id=?`).run(...vals);
  } else {
    const id = uuid();
    const keys = Object.keys(data);
    const vals = Object.values(data);
    db.prepare(`INSERT INTO email_config (id, ${keys.join(',')}) VALUES (?${',?'.repeat(keys.length)})`).run(id, ...vals);
  }
  return getConfig();
}

export function createTransport() {
  const config = getConfig();
  if (!config) throw new Error('Email not configured');

  if (config.provider === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: config.username, pass: config.password },
    });
  }

  if (config.provider === 'outlook') {
    return nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: { user: config.username, pass: config.password },
    });
  }

  return nodemailer.createTransport({
    host: config.host || 'smtp.gmail.com',
    port: config.port || 587,
    secure: !!config.secure,
    auth: { user: config.username, pass: config.password },
  });
}

export function sendEmail({ to, subject, html, tmp_id, attachments = [] }) {
  const config = getConfig();
  if (!config) return { status: 'failed', error: 'Email not configured' };

  try {
    const transport = createTransport();
    transport.sendMail({
      from: `"${config.sender_name || 'TMP CMS'}" <${config.sender_email || config.username}>`,
      to,
      subject,
      html,
      attachments,
    }).then(info => {
      db.prepare('INSERT INTO email_log (id, tmp_id, recipient, subject, body, status) VALUES (?,?,?,?,?,?)').run(uuid(), tmp_id||null, to, subject, html, 'sent');
    }).catch(err => {
      db.prepare('INSERT INTO email_log (id, tmp_id, recipient, subject, body, status, error) VALUES (?,?,?,?,?,?,?)').run(uuid(), tmp_id||null, to, subject, html, 'failed', err.message);
    });

    return { status: 'queued' };
  } catch (err) {
    db.prepare('INSERT INTO email_log (id, tmp_id, recipient, subject, body, status, error) VALUES (?,?,?,?,?,?,?)').run(uuid(), tmp_id||null, to, subject, html, 'failed', err.message);
    return { status: 'failed', error: err.message };
  }
}

export function sendTMPEmail(tmpId, recipient, note = '') {
  const tmp = db.prepare(`
    SELECT t.*, p.name as project_name, s.name as site_name, u.name as created_by_name
    FROM traffic_management_plans t
    LEFT JOIN tmp_projects p ON t.project_id = p.id
    LEFT JOIN sites s ON t.site_id = s.id
    LEFT JOIN users u ON t.created_by = u.id
    WHERE t.id = ?
  `).get(tmpId);
  if (!tmp) return { status: 'failed', error: 'TMP not found' };

  const statusColors = { draft:'#6b7280', submitted:'#f59e0b', review:'#f97316', approved:'#22c55e', active:'#3b82f6', completed:'#8b5cf6', cancelled:'#ef4444' };

  const rows = [];
  if (tmp.project_name) rows.push(`<tr><td style="color:#6b7280;padding:4px 8px 4px 0">Project</td><td>${tmp.project_name}</td></tr>`);
  if (tmp.site_name) rows.push(`<tr><td style="color:#6b7280;padding:4px 8px 4px 0">Site</td><td>${tmp.site_name}</td></tr>`);
  rows.push(`<tr><td style="color:#6b7280;padding:4px 8px 4px 0">Plan Type</td><td style="text-transform:capitalize">${tmp.plan_type}</td></tr>`);
  if (tmp.start_date) rows.push(`<tr><td style="color:#6b7280;padding:4px 8px 4px 0">Start</td><td>${tmp.start_date}</td></tr>`);
  if (tmp.end_date) rows.push(`<tr><td style="color:#6b7280;padding:4px 8px 4px 0">End</td><td>${tmp.end_date}</td></tr>`);
  if (tmp.description) rows.push(`<tr><td style="color:#6b7280;padding:4px 8px 4px 0;vertical-align:top">Description</td><td>${tmp.description.replace(/\n/g, '<br/>')}</td></tr>`);

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#111827;color:#fff;padding:24px;border-radius:12px 12px 0 0">
        <h1 style="margin:0;font-size:20px">Traffic Management Plan</h1>
        <p style="margin:4px 0 0;color:#9ca3af;font-size:13px">${tmp.reference || ''}</p>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:0;padding:24px;border-radius:0 0 12px 12px">
        <div style="display:inline-block;background:${statusColors[tmp.status]||'#6b7280'};color:#fff;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:600;text-transform:uppercase">${tmp.status}</div>
        <h2 style="margin:12px 0 4px">${tmp.title}</h2>
        ${note ? `<p style="color:#374151;font-size:14px;padding:12px;background:#f3f4f6;border-radius:8px">${note}</p>` : ''}
        <table style="width:100%;margin-top:16px;font-size:13px">${rows.join('')}</table>
        <p style="color:#9ca3af;font-size:11px;margin-top:20px;text-align:center">Generated by TMP CMS — ${new Date().toISOString().slice(0,10)}</p>
      </div>
    </div>
  `;

  return sendEmail({ to: recipient, subject: `TMP ${tmp.reference || tmp.title} — ${tmp.status}`, html, tmp_id: tmpId });
}
