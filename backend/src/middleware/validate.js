import { z } from 'zod';

export function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      const messages = err.errors?.map(e => `${e.path.join('.')}: ${e.message}`) || ['Validation failed'];
      return res.status(400).json({ error: 'Validation failed', details: messages });
    }
  };
}

export const schemas = {
  login: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password required'),
  }),

  createUser: z.object({
    name: z.string().min(1, 'Name required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'planner', 'viewer']).default('planner'),
  }),

  updateUser: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: z.enum(['admin', 'planner', 'viewer']).optional(),
  }),

  createClient: z.object({
    name: z.string().min(1, 'Name required'),
    company: z.string().optional().default(''),
    email: z.string().email().optional().or(z.literal('')).default(''),
    phone: z.string().optional().default(''),
    address: z.string().optional().default(''),
    notes: z.string().optional().default(''),
  }),

  updateClient: z.object({
    name: z.string().min(1).optional(),
    company: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
  }),

  createSite: z.object({
    name: z.string().min(1, 'Name required'),
    location: z.string().optional().default(''),
    road_name: z.string().optional().default(''),
    suburb: z.string().optional().default(''),
    state: z.string().optional().default(''),
    postcode: z.string().optional().default(''),
    description: z.string().optional().default(''),
  }),

  createProject: z.object({
    name: z.string().min(1, 'Name required'),
    description: z.string().optional().default(''),
    client_id: z.string().uuid().optional().or(z.literal('')),
    status: z.enum(['active', 'completed', 'cancelled']).default('active'),
    start_date: z.string().optional().default(''),
    end_date: z.string().optional().default(''),
  }),

  createTMP: z.object({
    title: z.string().min(1, 'Title required'),
    project_id: z.string().uuid('Invalid project'),
    site_id: z.string().uuid().optional().or(z.literal('')),
    plan_type: z.enum(['temporary', 'permanent', 'event', 'emergency']).default('temporary'),
    description: z.string().optional().default(''),
    start_date: z.string().optional().default(''),
    end_date: z.string().optional().default(''),
    traffic_notes: z.string().optional().default(''),
  }),

  updateTMP: z.object({
    title: z.string().min(1).optional(),
    site_id: z.string().uuid().optional().nullable(),
    status: z.enum(['draft', 'submitted', 'review', 'approved', 'active', 'completed', 'cancelled']).optional(),
    plan_type: z.enum(['temporary', 'permanent', 'event', 'emergency']).optional(),
    description: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    traffic_notes: z.string().optional(),
  }),
};
