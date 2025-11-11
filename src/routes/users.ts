import { Router } from 'express';
import { z } from 'zod';
import { serviceClient } from '../lib/supabase.js';

const router = Router();

const CreateUser = z.object({
  email: z.string().email().optional(),
  display_name: z.string().min(1).max(64).optional(),
});

router.post('/', async (req, res) => {
  try {
    const parsed = CreateUser.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { data, error } = await serviceClient
      .from('users')
      .insert(parsed.data)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ user: data });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to create user' });
  }
});

router.get('/', async (_req, res) => {
  const { data, error } = await serviceClient.from('users').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ users: data });
});

export default router;
