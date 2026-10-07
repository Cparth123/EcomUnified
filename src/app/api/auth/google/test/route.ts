import { NextRequest, NextResponse } from 'next/server';
import { getGoogleConfig } from '@/lib/googleAuth';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { clientId, clientSecret, geminiApiKey } = body;

    const envConfig = getGoogleConfig();
    const testClientId = clientId || envConfig.clientId;
    const testClientSecret = clientSecret || process.env.GOOGLE_CLIENT_SECRET;
    const testGeminiKey = geminiApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    const diagnostics: {
      googleOAuth: {
        status: 'configured' | 'partial' | 'missing';
        hasClientId: boolean;
        hasClientSecret: boolean;
        redirectUri: string;
        message: string;
      };
      googleGeminiAI: {
        status: 'connected' | 'invalid_key' | 'not_configured';
        modelTested?: string;
        message: string;
      };
    } = {
      googleOAuth: {
        status: 'missing',
        hasClientId: Boolean(testClientId),
        hasClientSecret: Boolean(testClientSecret),
        redirectUri: envConfig.redirectUri,
        message: '',
      },
      googleGeminiAI: {
        status: 'not_configured',
        message: '',
      },
    };

    // 1. Google OAuth Diagnostic
    if (testClientId && testClientSecret) {
      diagnostics.googleOAuth.status = 'configured';
      diagnostics.googleOAuth.message = 'Google OAuth Client ID & Secret configured successfully. Ready for seller login.';
    } else if (testClientId || testClientSecret) {
      diagnostics.googleOAuth.status = 'partial';
      diagnostics.googleOAuth.message = testClientId ? 'Client ID is set, but Client Secret is missing.' : 'Client Secret is set, but Client ID is missing.';
    } else {
      diagnostics.googleOAuth.status = 'missing';
      diagnostics.googleOAuth.message = 'Google OAuth keys not configured yet. Using simulated 1-click Google Demo Login.';
    }

    // 2. Google Gemini AI Key Diagnostic
    if (testGeminiKey && testGeminiKey !== 'your_google_gemini_api_key') {
      try {
        const genAI = new GoogleGenerativeAI(testGeminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Respond with "OK" if connected');
        const text = result.response.text();
        
        diagnostics.googleGeminiAI.status = 'connected';
        diagnostics.googleGeminiAI.modelTested = 'gemini-1.5-flash';
        diagnostics.googleGeminiAI.message = `Successfully verified Google Gemini API connection! Model responded: ${text.trim()}`;
      } catch (aiErr: any) {
        diagnostics.googleGeminiAI.status = 'invalid_key';
        diagnostics.googleGeminiAI.message = `Google Gemini Key check: ${aiErr.message || 'Verification error'}`;
      }
    } else {
      diagnostics.googleGeminiAI.status = 'not_configured';
      diagnostics.googleGeminiAI.message = 'No Gemini API key provided. AI Product Analyst will run in smart heuristic mode.';
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnostics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Diagnostic failed' },
      { status: 500 }
    );
  }
}
