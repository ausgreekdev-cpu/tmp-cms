import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const sites = db.prepare('SELECT * FROM sites ORDER BY created_at DESC').all();
  res.json(sites);
});

router.get('/:id', (req, res) => {
  const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(req.params.id);
  if (!site) return res.status(404).json({ error: 'Not found' });
  site.plans = db.prepare('SELECT id, title, reference, status FROM traffic_management_plans WHERE site_id = ?').all(req.params.id);
  res.json(site);
});

router.post('/', validate(schemas.createSite), (req, res) => {
  const { name, location, road_name, suburb, state, postcode, description } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO sites (id, name, location, road_name, suburb, state, postcode, description) VALUES (?,?,?,?,?,?,?,?)').run(id, name, location, road_name, suburb, state, postcode, description);
  const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(id);
  res.status(201).json(site);
});

router.put('/:id', (req, res) => {
  const allowed = ['name','location','road_name','suburb','state','postcode','description'];
  const fields = []; const vals = [];
  allowed.forEach(f => {
    if (req.body[f] !== undefined) { fields.push(`${f}=?`); vals.push(req.body[f]); }
  });
  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
  fields.push("updated_at=datetime('now')");
  vals.push(req.params.id);
  db.prepare(`UPDATE sites SET ${fields.join(',')} WHERE id=?`).run(...vals);
  const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(req.params.id);
  site ? res.json(site) : res.status(404).json({ error: 'Not found' });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM sites WHERE id = ?').run(req.params.id);
  result.changes ? res.json({ success: true }) : res.status(404).json({ error: 'Not found' });
});

export default router;
