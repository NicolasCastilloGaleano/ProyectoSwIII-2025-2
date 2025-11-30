import express from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import eventsRoutes from './events';
import reportsRoutes from './reports';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventsRoutes);
router.use('/reports', reportsRoutes);

export default router;
