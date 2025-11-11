import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import moodsRouter from './routes/moods.js';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

const corsOrigins = (process.env.CORS_ORIGINS || '*').split(',');
app.use(cors({ origin: corsOrigins, credentials: true }));

app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/api/v1/moods', moodsRouter);

app.use((_, res) => res.status(404).json({ error: 'Not found' }));

app.listen(port, () => {
  console.log(`Moodiary Backend listening on http://localhost:${port}`);
});
