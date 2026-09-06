import { NextRequest, NextResponse } from 'next/server';
import { auditAmazonSPAPIPolicy, auditFlipkartSellerPolicy } from '@/lib/policyAuditor';

export async function POST(req: NextRequest) {
  try {
    const { amazonCredentials, flipkartCredentials } = await req.json();

    const amazonAudit = auditAmazonSPAPIPolicy(amazonCredentials || {});
    const flipkartAudit = auditFlipkartSellerPolicy(flipkartCredentials || {});

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      amazonAudit,
      flipkartAudit,
      overallCompliance: amazonAudit.overallStatus === 'COMPLIANT' && flipkartAudit.overallStatus === 'COMPLIANT' ? 'COMPLIANT' : 'NEEDS_ATTENTION',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Audit failed' }, { status: 500 });
  }
}
