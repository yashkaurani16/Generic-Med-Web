import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from './middleware/auth';
import { asyncHandler } from './middleware/errorHandler';
import { ComplianceService } from '../services/complianceService';
import { z } from 'zod';
import { validateBody } from './middleware/validate';

const router = Router();

const verifyLicenseSchema = z.object({
  licenseNumber: z.string().min(5),
});

/**
 * GET /api/compliance/audit-report
 * Generate automated DISHA/HIPAA compliance audit report
 */
router.get(
  '/audit-report',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (_req: Request, res: Response) => {
    const report = ComplianceService.generateComplianceAuditReport();
    res.json(report);
  })
);

/**
 * GET /api/compliance/anonymized-data
 * Fetch de-identified healthcare cohort data for clinical research compliance
 */
router.get(
  '/anonymized-data',
  requireAuth,
  requireRole('admin', 'doctor'),
  asyncHandler(async (_req: Request, res: Response) => {
    const dataset = ComplianceService.getAnonymizedResearchDataset();
    res.json(dataset);
  })
);

/**
 * POST /api/compliance/verify-license
 * CDSCO drug regulatory license format and status checker
 */
router.post(
  '/verify-license',
  validateBody(verifyLicenseSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { licenseNumber } = req.body;
    const result = ComplianceService.verifyCDSCOPharmacyLicense(licenseNumber);
    res.json(result);
  })
);

/**
 * DELETE /api/compliance/patient-data/:patientId
 * Patient right-to-erasure / right-to-be-forgotten (GDPR / DISHA)
 */
router.delete(
  '/patient-data/:patientId',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params;

    // Allow patient to delete their own data, or admin
    if (req.session.userRole !== 'admin' && req.session.userId !== patientId) {
      res.status(403).json({ error: 'You are not authorized to erase this patient account' });
      return;
    }

    const result = ComplianceService.processPatientDataErasure(patientId);
    res.json({
      success: true,
      message: 'Patient data erased and anonymized per DISHA/GDPR standard',
      ...result,
    });
  })
);

export default router;
