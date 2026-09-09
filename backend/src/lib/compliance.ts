export interface ComplianceAuditReport {
  generatedAt: string;
  frameworks: ('DISHA' | 'HIPAA' | 'CDSCO' | 'GDPR')[];
  status: 'COMPLIANT' | 'NEEDS_REVIEW' | 'NON_COMPLIANT';
  overallScore: number; // 0 - 100
  controls: {
    id: string;
    name: string;
    framework: string;
    status: 'PASS' | 'WARNING' | 'FAIL';
    details: string;
  }[];
  encryptionStandard: 'AES-256-GCM / TLS 1.3';
  dataRetentionPolicyDays: number;
  anonymizationAlgorithm: 'k-Anonymity (k=5) + Pseudonymization';
}

export interface CDSCOVerificationResult {
  licenseNumber: string;
  isValidFormat: boolean;
  stateCode: string;
  category: 'Retail' | 'Wholesale' | 'Manufacturing';
  cdscoRegistryStatus: 'Active & Verified' | 'Expired' | 'Pending Verification';
  verifiedAt: string;
}
