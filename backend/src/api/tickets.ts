import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { requireAuth, requireRole } from './middleware/auth';
import { validateBody } from './middleware/validate';
import { asyncHandler } from './middleware/errorHandler';
import { INITIAL_TICKETS } from '../data/mockData';
import { SupportTicket } from '../types';

const router = Router();
const mockTickets: SupportTicket[] = [...INITIAL_TICKETS];

const createTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  category: z.enum(['PrescriptionIssue', 'PriceMismatch', 'DeliveryDelay', 'RefundRequest', 'CatalogInquiry']),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
  orderId: z.string().optional(),
  message: z.string().min(10, 'Please provide more detail in your message'),
});

const addMessageSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty'),
});

const updateStatusSchema = z.object({
  status: z.enum(['Open', 'InProgress', 'Resolved', 'Closed']),
});

/**
 * GET /api/tickets
 * Patient: their own. Admin/Pharmacy: all.
 */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    try {
      const tickets = await db.supportTicket.findMany({
        where: req.session.userRole === 'patient' ? { userId: req.session.userId } : {},
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          messages: { orderBy: { timestamp: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ tickets, total: tickets.length });
      return;
    } catch {
      let filtered = [...mockTickets];
      if (req.session.userRole === 'patient') {
        filtered = filtered.filter((t) => t.userId === req.session.userId || t.userId === 'usr-patient-1');
      }
      res.json({ tickets: filtered, total: filtered.length });
    }
  })
);

/**
 * POST /api/tickets
 * Create a new support ticket.
 */
router.post(
  '/',
  requireAuth,
  validateBody(createTicketSchema),
  asyncHandler(async (req, res) => {
    const { subject, category, priority, orderId, message } = req.body;

    const ticketNumber = `CASE-${Math.floor(10000 + Math.random() * 90000)}`;

    const ticket = await db.supportTicket.create({
      data: {
        ticketNumber,
        userId: req.session.userId!,
        subject,
        category,
        priority,
        orderId,
        messages: {
          create: {
            sender: req.session.userName,
            senderRole: req.session.userRole,
            text: message,
          },
        },
      },
      include: { messages: true },
    });

    res.status(201).json({ ticket, message: `Support ticket ${ticketNumber} created.` });
  })
);

/**
 * POST /api/tickets/:id/messages
 * Add a reply to a ticket.
 */
router.post(
  '/:id/messages',
  requireAuth,
  validateBody(addMessageSchema),
  asyncHandler(async (req, res) => {
    const { text } = req.body;

    const ticket = await db.supportTicket.findUnique({ where: { id: req.params.id } });
    if (!ticket) {
      res.status(404).json({ error: 'Not Found', message: 'Ticket not found.' });
      return;
    }

    if (req.session.userRole === 'patient' && ticket.userId !== req.session.userId) {
      res.status(403).json({ error: 'Forbidden', message: 'Access denied.' });
      return;
    }

    const ticketMsg = await db.ticketMessage.create({
      data: {
        ticketId: req.params.id,
        sender: req.session.userName,
        senderRole: req.session.userRole,
        text,
      },
    });

    // Auto-set to InProgress when staff replies
    if (['admin', 'pharmacy'].includes(req.session.userRole as string) && ticket.status === 'Open') {
      await db.supportTicket.update({ where: { id: req.params.id }, data: { status: 'InProgress' } });
    }

    res.status(201).json({ message: ticketMsg });
  })
);

/**
 * PUT /api/tickets/:id/status
 * Update ticket status. Admin/Pharmacy only.
 */
router.put(
  '/:id/status',
  requireAuth,
  requireRole('admin', 'pharmacy'),
  validateBody(updateStatusSchema),
  asyncHandler(async (req, res) => {
    const { status } = req.body;

    const ticket = await db.supportTicket.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json({ ticket, message: `Ticket status updated to ${status}.` });
  })
);

export default router;
