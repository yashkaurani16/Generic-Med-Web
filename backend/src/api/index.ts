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
import pharmaciesRouter from './pharmacies';
import analyticsRouter from './analytics';
import interactionsRouter from './interactions';
import emailsRouter from './emails';
import medicalHistoryRouter from './medical-history';
import bulkUploadRouter from './bulk-upload';
import settlementsRouter from './settlements';
import logisticsRouter from './logistics';
import complianceRouter from './compliance';
import { generalLimiter } from './middleware/rateLimit';
import { gatewayMiddleware } from './middleware/gateway';

const router = Router();

// Apply API Gateway telemetry, timing, and caching headers
router.use(gatewayMiddleware);

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
router.use('/pharmacies', pharmaciesRouter);
router.use('/analytics', analyticsRouter);
router.use('/interactions', interactionsRouter);
router.use('/emails', emailsRouter);
router.use('/medical-history', medicalHistoryRouter);
router.use('/bulk-upload', bulkUploadRouter);
router.use('/settlements', settlementsRouter);
router.use('/logistics', logisticsRouter);
router.use('/compliance', complianceRouter);

export default router;
