import express from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import eventsRoutes from './events';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventsRoutes);

export default router;
