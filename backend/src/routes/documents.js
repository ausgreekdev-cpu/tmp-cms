import 'dotenv/config';
import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads'));
fs.mkdirSync(uploadsDir, { recursive: true });

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'text/plain', 'text/csv',
  'application/zip',
];

const MAX_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE || '20', 10) * 1024 * 1024;

function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type '${file.mimetype}' not allowed. Accepted: PDF, DOC, DOCX, XLS, XLSX, images, TXT, CSV, ZIP`));
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${uuid()}${path.extname(file.originalname)}`)
});

const upload = multer({ storage, limits: { fileSize: MAX_SIZE }, fileFilter });

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const docs = db.prepare(`
    SELECT d.*, u.name as uploaded_by_name
    FROM documents d LEFT JOIN users u ON d.uploaded_by = u.id
    ORDER BY d.created_at DESC
  `).all();
  res.json(docs);
});

router.post('/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: `File too large. Max size: ${MAX_SIZE / 1024 / 1024}MB` });
      return res.status(400).json({ error: err.message });
    }
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { tmp_id, project_id, name, description } = req.body;
    const id = uuid();
    db.prepare('INSERT INTO documents (id, tmp_id, project_id, name, file_path, file_type, file_size, description, uploaded_by) VALUES (?,?,?,?,?,?,?,?,?)').run(id, tmp_id||null, project_id||null, name||req.file.originalname, req.file.path, req.file.mimetype, req.file.size, description||'', req.user.id);
    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
    res.status(201).json(doc);
  });
});

router.delete('/:id', (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  if (doc.file_path && fs.existsSync(doc.file_path)) fs.unlinkSync(doc.file_path);
  db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
