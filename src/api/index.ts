import { Router } from 'express';
import authRouter from './auth';
import medicinesRouter from './medicines';
import offersRouter from './offers';
import prescriptionsRouter from './prescriptions';
import ordersRouter from './orders';
import usersRouter from './users';
import auditRouter from './audit';
import ticketsRouter from './tickets';
import paymentsRouter from './payments';
import { generalLimiter } from './middleware/rateLimit';

const router = Router();

// Apply general rate limiter to all API routes
router.use(generalLimiter);

// Mount route modules
router.use('/auth', authRouter);
router.use('/medicines', medicinesRouter);
router.use('/offers', offersRouter);
router.use('/prescriptions', prescriptionsRouter);
router.use('/orders', ordersRouter);
router.use('/users', usersRouter);
router.use('/audit', auditRouter);
router.use('/tickets', ticketsRouter);
router.use('/payments', paymentsRouter);

export default router;
