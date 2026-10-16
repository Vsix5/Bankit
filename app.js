import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import sessionMiddleware from './src/config/session.js';
import authRoutes from './src/modules/auth/auth.routes.js';
import notFound from './src/middleware/notFound.js';
import errorHandler from './src/middleware/errorHandler.js';
const app = express();

app.use(express.json());

app.use(cors({
  credentials: true,
  origin: ['http://127.0.0.1:5500', 'http://localhost:5173']
}));

app.use(sessionMiddleware);
app.use(authRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;