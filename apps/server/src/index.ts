import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import { middleware as openApiMiddleware } from 'express-openapi-validator';
import { env } from './env';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import tasksRouter from './routes/tasks';
import swaggerUi from 'swagger-ui-express';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

const openapiPath = path.join(__dirname, '../openapi.yaml');
const openapiDoc = YAML.parse(fs.readFileSync(openapiPath, 'utf-8'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));

app.use(
  openApiMiddleware({
    apiSpec: openapiPath,
    validateRequests: true,
    validateResponses: false,
  })
);

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/tasks', tasksRouter);
app.get('/health', (_req, res) => res.json({ ok: true }));

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: 'INTERNAL_ERROR' });
});

app.listen(env.PORT, () => {
  console.log(`API http://localhost:${env.PORT} | Docs http://localhost:${env.PORT}/docs`);
});
