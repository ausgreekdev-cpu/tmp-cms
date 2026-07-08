import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getConfig, saveConfig, sendTMPEmail, sendEmail } from '../services/email.js';

const router = Router();
router.use(authenticate);

router.get('/config', (req, res) => {
  const config = db.prepare('SELECT * FROM email_config LIMIT 1').get();
  if (config) delete config.password;
  res.json(config || {});
});

router.put('/config', requireRole('admin'), (req, res) => {
  const { provider, host, port, username, password, sender_name, sender_email, secure, enabled } = req.body;
  const cfg = saveConfig({ provider, host, port: port ? parseInt(port) : undefined, username, password, sender_name, sender_email, secure: secure !== undefined ? (secure ? 1 : 0) : undefined, enabled: enabled !== undefined ? (enabled ? 1 : 0) : undefined });
  if (cfg) delete cfg.password;
  res.json(cfg || {});
});

router.post('/test', requireRole('admin'), async (req, res) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ error: 'Recipient email required' });
  const result = await sendEmail({ to, subject: 'TMP CMS — Test Email', html: '<h1>Test Email</h1><p>Your email configuration is working.</p>' });
  res.json(result);
});

router.post('/send-tmp', async (req, res) => {
  const { tmp_id, recipient, note } = req.body;
  if (!tmp_id || !recipient) return res.status(400).json({ error: 'TMP ID and recipient required' });
  const result = await sendTMPEmail(tmp_id, recipient, note);
  res.json(result);
});

router.get('/log', (req, res) => {
  const logs = db.prepare(`
    SELECT l.*, t.reference as tmp_reference, t.title as tmp_title
    FROM email_log l
    LEFT JOIN traffic_management_plans t ON l.tmp_id = t.id
    ORDER BY l.sent_at DESC LIMIT 50
  `).all();
  res.json(logs);
});

export default router;
