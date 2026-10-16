import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { signup, signin, dashboard, logout } from './auth.controller.js';
import validate from '../../middleware/validate.js';
import { signupSchema, signinSchema } from './auth.schemas.js';
import requireAuth from '../../middleware/requireAuth.js';

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'test' ? 100 : 5,
    message: { error: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: 'draft-8',
    legacyHeaders: false
})

router.post('/signup', validate(signupSchema), signup);

router.post('/signin', validate(signinSchema), authLimiter, signin);

router.get('/dashboard', requireAuth, dashboard);

router.post('/logout', requireAuth, logout);

export default router;