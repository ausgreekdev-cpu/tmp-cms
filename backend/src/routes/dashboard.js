import { Router } from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const stats = {
    total_plans: db.prepare('SELECT COUNT(*) as c FROM traffic_management_plans').get().c,
    active_plans: db.prepare("SELECT COUNT(*) as c FROM traffic_management_plans WHERE status IN ('approved','active')").get().c,
    draft_plans: db.prepare("SELECT COUNT(*) as c FROM traffic_management_plans WHERE status = 'draft'").get().c,
    total_projects: db.prepare('SELECT COUNT(*) as c FROM tmp_projects').get().c,
    active_projects: db.prepare("SELECT COUNT(*) as c FROM tmp_projects WHERE status = 'active'").get().c,
    total_clients: db.prepare('SELECT COUNT(*) as c FROM clients').get().c,
    total_sites: db.prepare('SELECT COUNT(*) as c FROM sites').get().c,
  };

  const plans_by_status = db.prepare('SELECT status, COUNT(*) as count FROM traffic_management_plans GROUP BY status').all();
  const recent_plans = db.prepare(`
    SELECT t.id, t.title, t.reference, t.status, t.created_at,
      s.name as site_name, p.name as project_name
    FROM traffic_management_plans t
    LEFT JOIN sites s ON t.site_id = s.id
    LEFT JOIN tmp_projects p ON t.project_id = p.id
    ORDER BY t.created_at DESC LIMIT 5
  `).all();
  const recent_activity = db.prepare(`
    SELECT a.*, u.name as user_name, t.title as tmp_title
    FROM plan_activities a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN traffic_management_plans t ON a.tmp_id = t.id
    ORDER BY a.created_at DESC LIMIT 10
  `).all();

  res.json({ stats, plans_by_status, recent_plans, recent_activity });
});

export default router;
