import { Router } from 'express';
import { z } from 'zod';
import { serviceClient } from '../lib/supabase.js';

const router = Router();

const RegisterBody = z.object({
  email: z.string().email(),
  display_name: z.string().min(1).max(100),
  password: z.string().min(1)
});

const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post('/register', async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, display_name, password } = parsed.data;

  // ensure email unique
  const { data: existing, error: findErr } = await serviceClient
    .from('users').select('id').eq('email', email).maybeSingle();
  if (findErr) return res.status(500).json({ error: findErr.message });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const { data, error } = await serviceClient
    .from('users')
    .insert({ email, display_name, password })
    .select('id, email, display_name, created_at')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ user: data });
});

router.post('/login', async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;

  const { data, error } = await serviceClient
    .from('users')
    .select('id, email, display_name, password')
    .eq('email', email)
    .single();

  if (error) return res.status(401).json({ error: 'Invalid email or password' });

  if (data.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // don’t return password
  const { password: _omit, ...safe } = data;
  res.json({ user: safe });
});

router.get('/', async (_req, res) => {
  const { data, error } = await serviceClient.from('users').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ users: data });
});

export default router;
