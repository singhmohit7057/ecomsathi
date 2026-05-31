import { Router, Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/validate';

const router = Router();

interface GSTVerifyRequest {
  gstin: string;
}

interface GSTINDetails {
  gstin: string;
  legalName: string;
  tradeName: string;
  status: string;
  registrationDate: string;
  taxpayerType: string;
  stateCode: string;
  stateJurisdiction: string;
  centreJurisdiction: string;
  constitutionOfBusiness: string;
  principalPlaceOfBusiness: string;
  additionalPlacesOfBusiness: string[];
  cancellationDate?: string;
  raw?: Record<string, unknown>;
}

/**
 * Normalizes the Cashfree GST API response to a consistent GSTINDetails object.
 */
function normalizeGSTResponse(data: Record<string, unknown>): GSTINDetails {
  const d = (data as Record<string, Record<string, unknown>>);
  const gstDetails = (d.data || d) as Record<string, unknown>;

  return {
    gstin: (gstDetails.gstin || gstDetails.GSTIN || '') as string,
    legalName: (gstDetails.legalNameOfBusiness || gstDetails.legal_name || gstDetails.lgnm || '') as string,
    tradeName: (gstDetails.tradeName || gstDetails.trade_name || gstDetails.tradeNam || '') as string,
    status: (gstDetails.gstinStatus || gstDetails.status || gstDetails.sts || 'UNKNOWN') as string,
    registrationDate: (gstDetails.dateOfRegistration || gstDetails.registration_date || gstDetails.rgdt || '') as string,
    taxpayerType: (gstDetails.taxpayerType || gstDetails.taxpayer_type || gstDetails.dty || '') as string,
    stateCode: (gstDetails.stateCode || gstDetails.state_code || gstDetails.stj_cd || '') as string,
    stateJurisdiction: (gstDetails.stateJurisdiction || gstDetails.state_jurisdiction || gstDetails.stj || '') as string,
    centreJurisdiction: (gstDetails.centreJurisdiction || gstDetails.centre_jurisdiction || gstDetails.ctj || '') as string,
    constitutionOfBusiness: (gstDetails.constitutionOfBusiness || gstDetails.constitution || gstDetails.ctb || '') as string,
    principalPlaceOfBusiness: (gstDetails.principalPlaceOfBusiness || gstDetails.principal_place || gstDetails.pradr || '') as string,
    additionalPlacesOfBusiness: (Array.isArray(gstDetails.additionalPlacesOfBusiness)
      ? gstDetails.additionalPlacesOfBusiness
      : gstDetails.adadr
      ? [gstDetails.adadr]
      : []) as string[],
    cancellationDate: (gstDetails.dateOfCancellation || gstDetails.cancellation_date || gstDetails.cxdt) as string | undefined,
    raw: gstDetails as Record<string, unknown>,
  };
}

// ---------------------------------------------------------------------------
// POST /api/gst/verify
// Verifies a GSTIN using the Cashfree GST verification API
// ---------------------------------------------------------------------------
router.post(
  '/verify',
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { gstin } = req.body as GSTVerifyRequest;

    if (!gstin) {
      res.status(400).json({ error: 'gstin is required' });
      return;
    }

    // Basic GSTIN format validation (15-character alphanumeric)
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(gstin.toUpperCase())) {
      res.status(400).json({
        error: 'Invalid GSTIN format. Expected format: 22AAAAA0000A1Z5',
      });
      return;
    }

    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      res.status(503).json({
        error: 'Live verification not configured',
        message: 'GST verification service is not available. Please configure Cashfree credentials.',
      });
      return;
    }

    try {
      const response = await fetch('https://api.cashfree.com/verification/gst', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': clientId,
          'x-client-secret': clientSecret,
        },
        body: JSON.stringify({ gstin: gstin.toUpperCase() }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const errorMsg = (errorBody as { message?: string }).message || `API returned status ${response.status}`;

        if (response.status === 404) {
          res.status(404).json({
            error: 'GSTIN not found',
            message: `No records found for GSTIN: ${gstin}`,
          });
          return;
        }

        if (response.status === 401 || response.status === 403) {
          res.status(503).json({
            error: 'Authentication failed',
            message: 'GST verification service credentials are invalid',
          });
          return;
        }

        res.status(response.status).json({ error: errorMsg });
        return;
      }

      const data = (await response.json()) as Record<string, unknown>;
      const normalized = normalizeGSTResponse(data);

      res.json({
        success: true,
        gstin: gstin.toUpperCase(),
        details: normalized,
      });
    } catch (err) {
      console.error('[GST Verify] Error calling Cashfree API:', err);
      res.status(502).json({
        error: 'Failed to connect to GST verification service',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  })
);

// ---------------------------------------------------------------------------
// GET /api/gst/validate/:gstin
// Quick offline GSTIN format validation (no API call)
// ---------------------------------------------------------------------------
router.get(
  '/validate/:gstin',
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { gstin } = req.params;
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const isValid = gstinRegex.test(gstin.toUpperCase());

    const stateCode = gstin.substring(0, 2);
    const stateCodes: Record<string, string> = {
      '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
      '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
      '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
      '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
      '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
      '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
      '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
      '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
      '26': 'Dadra and Nagar Haveli and Daman and Diu',
      '27': 'Maharashtra', '28': 'Andhra Pradesh', '29': 'Karnataka',
      '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala',
      '33': 'Tamil Nadu', '34': 'Puducherry', '35': 'Andaman and Nicobar Islands',
      '36': 'Telangana', '37': 'Andhra Pradesh (New)',
    };

    res.json({
      gstin: gstin.toUpperCase(),
      isValid,
      stateCode,
      state: stateCodes[stateCode] || 'Unknown',
      panNumber: isValid ? gstin.substring(2, 12) : null,
      entityType: isValid ? gstin.charAt(5) : null,
    });
  })
);

export default router;
