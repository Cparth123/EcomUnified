import { NextRequest, NextResponse } from 'next/server';
import { GeminiProvider } from '@/lib/providers/ai/GeminiProvider';
import { MockGeminiProvider } from '@/lib/providers/ai/MockGeminiProvider';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, productName } = await req.json();

    if (!imageBase64 && !productName) {
      return NextResponse.json(
        { success: false, error: 'Image base64 or product name is required for analysis.' },
        { status: 400 }
      );
    }

    const useMock = process.env.USE_MOCK_GEMINI === 'true' || !process.env.GEMINI_API_KEY;
    const aiProvider = useMock ? new MockGeminiProvider() : new GeminiProvider();

    const analysis = await aiProvider.analyzeProduct({
      imageBase64,
      mimeType: mimeType || 'image/jpeg',
      productName,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('[API /api/search/image] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Image analysis failed.' },
      { status: 500 }
    );
  }
}
