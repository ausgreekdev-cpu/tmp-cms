import { Router } from 'express';
import PDFDocument from 'pdfkit';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/tmps/:id/pdf', (req, res) => {
  const tmp = db.prepare(`
    SELECT t.*, s.name as site_name, s.road_name, s.suburb, s.state,
      p.name as project_name, c.name as client_name, u.name as created_by_name
    FROM traffic_management_plans t
    LEFT JOIN sites s ON t.site_id = s.id
    LEFT JOIN tmp_projects p ON t.project_id = p.id
    LEFT JOIN clients c ON p.client_id = c.id
    LEFT JOIN users u ON t.created_by = u.id
    WHERE t.id = ?
  `).get(req.params.id);

  if (!tmp) return res.status(404).json({ error: 'Not found' });

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${tmp.reference || 'tmp'}.pdf"`);
  doc.pipe(res);

  doc.fontSize(22).font('Helvetica-Bold').text('Traffic Management Plan', { align: 'center' });
  doc.fontSize(12).font('Helvetica').text(tmp.reference || '', { align: 'center' });
  doc.moveDown(1.5);

  doc.fontSize(10).font('Helvetica-Bold').text('Status: ', { continued: true }).font('Helvetica').text(tmp.status.toUpperCase());
  doc.moveDown(0.5);

  const fields = [
    ['Title', tmp.title],
    ['Project', tmp.project_name],
    ['Client', tmp.client_name],
    ['Site', tmp.site_name],
    ['Road', tmp.road_name],
    ['Location', `${tmp.suburb || ''} ${tmp.state || ''}`.trim()],
    ['Plan Type', tmp.plan_type],
    ['Description', tmp.description],
    ['Start Date', tmp.start_date],
    ['End Date', tmp.end_date],
    ['Created By', tmp.created_by_name],
    ['Created', tmp.created_at?.slice(0,10)],
  ];

  doc.moveDown(0.5);
  fields.forEach(([label, value]) => {
    if (value) {
      doc.fontSize(10).font('Helvetica-Bold').text(`  ${label}: `, { continued: true }).font('Helvetica').text(String(value));
    }
  });

  if (tmp.traffic_notes) {
    doc.moveDown(1);
    doc.fontSize(11).font('Helvetica-Bold').text('Traffic Notes');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').text(tmp.traffic_notes);
  }

  doc.moveDown(1);
  doc.fontSize(8).font('Helvetica').fillColor('#999').text(`Generated on ${new Date().toISOString().slice(0,10)}`, { align: 'center' });

  doc.end();
});

export default router;
