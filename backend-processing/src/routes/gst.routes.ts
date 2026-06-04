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

function normalizeGSTResponse(data: Record<string, unknown>): GSTINDetails {
  const d = (data as Record<string, Record<string, unknown>>);
  const gstDetails = (d.data || d) as Record<string, unknown>;

  const pradr = gstDetails.pradr as Record<string, unknown> | undefined;
  const principalAddress = pradr
    ? (pradr.adr || pradr.addr || '') as string
    : (gstDetails.principalPlaceOfBusiness || gstDetails.principal_place || '') as string;

  const adadr = gstDetails.adadr;
  const additionalAddresses: string[] = Array.isArray(adadr)
    ? (adadr as Record<string, unknown>[]).map(a => (a.adr || a.addr || JSON.stringify(a)) as string)
    : [];

  return {
    gstin: (gstDetails.gstin || gstDetails.GSTIN || '') as string,
    legalName: (gstDetails.lgnm || gstDetails.legalNameOfBusiness || gstDetails.legal_name || '') as string,
    tradeName: (gstDetails.tradeNam || gstDetails.tradeName || gstDetails.trade_name || '') as string,
    status: (gstDetails.sts || gstDetails.gstinStatus || gstDetails.status || 'UNKNOWN') as string,
    registrationDate: (gstDetails.rgdt || gstDetails.dateOfRegistration || gstDetails.registration_date || '') as string,
    taxpayerType: (gstDetails.dty || gstDetails.taxpayerType || gstDetails.taxpayer_type || '') as string,
    stateCode: (gstDetails.stj_cd || gstDetails.stateCode || gstDetails.state_code || '') as string,
    stateJurisdiction: (gstDetails.stj || gstDetails.stateJurisdiction || gstDetails.state_jurisdiction || '') as string,
    centreJurisdiction: (gstDetails.ctj || gstDetails.centreJurisdiction || gstDetails.centre_jurisdiction || '') as string,
    constitutionOfBusiness: (gstDetails.ctb || gstDetails.constitutionOfBusiness || gstDetails.constitution || '') as string,
    principalPlaceOfBusiness: principalAddress,
    additionalPlacesOfBusiness: additionalAddresses,
    cancellationDate: (gstDetails.cxdt || gstDetails.dateOfCancellation || gstDetails.cancellation_date) as string | undefined,
    raw: gstDetails as Record<string, unknown>,
  };
}

// ---------------------------------------------------------------------------
// GET /api/gst/verify?gstin=XXX  (also accepts POST with body)
// Verifies a GSTIN using the GSTN public search API (free, no key required)
// ---------------------------------------------------------------------------
router.all(
  '/verify',
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { gstin } = (req.method === 'GET' ? req.query : req.body) as GSTVerifyRequest;

    if (!gstin) {
      res.status(400).json({ error: 'gstin is required' });
      return;
    }

    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(gstin.toUpperCase())) {
      res.status(400).json({
        error: 'Invalid GSTIN format. Expected format: 22AAAAA0000A1Z5',
      });
      return;
    }

    try {
      const url = `https://services.gst.gov.in/services/api/search/taxpayerDetails?gstin=${gstin.toUpperCase()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://services.gst.gov.in/services/searchtp',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Origin': 'https://services.gst.gov.in',
        },
      });

      if (response.status === 404 || response.status === 400) {
        res.status(404).json({
          error: 'GSTIN not found',
          message: `No records found for GSTIN: ${gstin.toUpperCase()}`,
        });
        return;
      }

      if (!response.ok) {
        res.status(502).json({
          error: 'GSTN portal returned an error',
          message: `Status ${response.status}`,
        });
        return;
      }

      const data = (await response.json()) as Record<string, unknown>;

      // GSTN returns { errorCode: "SWEB_9035" } when GSTIN not found
      if (data.errorCode || data.error) {
        res.status(404).json({
          error: 'GSTIN not found',
          message: `No records found for GSTIN: ${gstin.toUpperCase()}`,
        });
        return;
      }

      const normalized = normalizeGSTResponse(data);

      // Spread details flat so frontend can read legalName, status etc directly
      res.json({
        success: true,
        ...normalized,
      });
    } catch (err) {
      console.error('[GST Verify] Error calling GSTN portal:', err);
      res.status(502).json({
        error: 'Failed to connect to GSTN portal',
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
