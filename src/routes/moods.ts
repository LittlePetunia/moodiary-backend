import { Router } from 'express';
import { z } from 'zod';
import { serviceClient } from '../lib/supabase.js';
import type { MoodValue } from '../types/mood.js';

const router = Router();

const MoodBody = z.object({
  date_iso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mood: z.enum(['sad','neutral','happy'] as [MoodValue, MoodValue, MoodValue]),
  note: z.string().max(500).optional().nullable(),
  tags: z.array(z.string().max(24)).max(10).optional().nullable(),
});

const DEMO_USER_ID = process.env.DEMO_USER_ID || '00000000-0000-0000-0000-000000000000';

router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    let query = serviceClient.from('mood_entries').select('*').eq('user_id', DEMO_USER_ID).order('date_iso');
    if (from) query = query.gte('date_iso', from);
    if (to) query = query.lte('date_iso', to);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ items: data });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to fetch moods' });
  }
});

router.post('/', async (req, res) => {
  try {
    const parsed = MoodBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const payload = { ...parsed.data, user_id: DEMO_USER_ID };
    const { data, error } = await serviceClient.from('mood_entries').insert(payload).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ item: data });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to create mood' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const parsed = MoodBody.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { data: existing, error: findErr } = await serviceClient
      .from('mood_entries').select('*').eq('id', id).single();
    if (findErr || !existing) return res.status(404).json({ error: 'Not found' });

    const { data, error } = await serviceClient
      .from('mood_entries')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ item: data });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to update mood' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { data: existing, error: findErr } = await serviceClient
      .from('mood_entries').select('id').eq('id', id).single();
    if (findErr || !existing) return res.status(404).json({ error: 'Not found' });

    const { error } = await serviceClient.from('mood_entries').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to delete mood' });
  }
});

export default router;
