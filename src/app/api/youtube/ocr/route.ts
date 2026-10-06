// ============================================================
// Creator Nest — YouTube Studio Screenshot OCR API Route
// POST /api/youtube/ocr
// Gemini 2.0 Flash Vision for Earn tab & Dashboard tab screenshots
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-3.8-flash'];

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType = 'image/jpeg', label = 'Studio Screenshot' } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'Missing imageBase64 data.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    // Strip data URL header if present
    const cleanBase64 = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    const prompt = `This is a screenshot from YouTube Studio (${label}, e.g. Earn Tab or Dashboard).
Extract and structure all observable monetization and channel health telemetry into a concise summary:
1. Public Watch Hours (e.g. "X out of 4,000 public watch hours")
2. Subscribers Count (e.g. "X out of 1,000 subscribers")
3. 2-Step Verification status (Turned On / Required)
4. Community Guidelines Strikes status (0 active strikes, or any warning/strikes mentioned)
5. YPP Status / Application State (Apply Now, In Progress, Not Yet Eligible, Monetized)
6. Recent video performance or any warning banners shown on the screen.

Format output as clear bullet points with detected numbers and labels.`;

    let extractedText = '';
    let lastError: any = null;

    for (const model of GEMINI_MODELS) {
      try {
        const res = await fetch(
          `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        mimeType: mimeType,
                        data: cleanBase64
                      }
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 1024,
              }
            }),
          }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(`Gemini Vision error on ${model} (${res.status}): ${JSON.stringify(err)}`);
        }

        const data = await res.json();
        extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        if (extractedText) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[OCR] Error with ${model}, trying fallback:`, err.message);
      }
    }

    if (!extractedText && lastError) {
      return NextResponse.json(
        { success: false, error: lastError.message || 'Vision OCR failed.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      extractedText,
      label
    });
  } catch (error: any) {
    console.error('[/api/youtube/ocr] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process screenshot OCR.' },
      { status: 500 }
    );
  }
}
