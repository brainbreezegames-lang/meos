import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  INTENT_PARSER_SYSTEM_PROMPT,
  buildIntentParserPrompt,
} from '@/lib/ai/prompts';
import { generateFallbackIntent } from '@/lib/ai/templates';
import type { ParsedIntent } from '@/lib/ai/types';

const requestSchema = z.object({
  prompt: z.string().min(10).max(1000),
});

const intentSchema = z.object({
  userType: z.string(),
  baseTemplate: z.enum(['portfolio', 'business', 'writing', 'creative', 'personal', 'developer', 'agency']),
  understanding: z.string(),
  widgets: z.array(z.object({
    type: z.enum(['status', 'clock', 'contact', 'book', 'tipjar', 'links', 'feedback']),
    reason: z.string(),
  })),
  folders: z.array(z.object({
    name: z.string(),
    reason: z.string(),
  })),
  notes: z.array(z.object({
    title: z.string(),
    type: z.enum(['note', 'case-study', 'folder', 'image', 'link', 'embed', 'download', 'cv']),
    reason: z.string(),
  })),
  statusText: z.string(),
  tone: z.enum(['professional', 'casual', 'creative', 'minimal', 'playful']),
  summary: z.string(),
});

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.AI_MODEL || 'deepseek/deepseek-v3.2';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://meos-delta.vercel.app',
      'X-Title': 'MeOS',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenRouter error:', error);
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function extractJSON(text: string): string {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }

  // Try to find raw JSON object
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return objectMatch[0];
  }

  return text;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = requestSchema.parse(body);

    let intent: ParsedIntent;

    // Check if AI is configured
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn('OPENROUTER_API_KEY not configured, using fallback templates');
      intent = generateFallbackIntent(prompt);
    } else {
      try {
        // Call AI for intent parsing
        const aiResponse = await callAI(
          INTENT_PARSER_SYSTEM_PROMPT,
          buildIntentParserPrompt(prompt)
        );

        // Extract and parse JSON
        const jsonStr = extractJSON(aiResponse);
        const parsed = JSON.parse(jsonStr);

        // Validate the response
        intent = intentSchema.parse(parsed);
      } catch (aiError) {
        console.error('AI parsing failed, using fallback:', aiError);
        // Use fallback template-based approach
        intent = generateFallbackIntent(prompt);
        // Return with fallback indicator
        return NextResponse.json({
          success: true,
          data: intent,
          meta: {
            usedAI: false,
            fallbackReason: 'AI parsing failed',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: intent,
      meta: {
        usedAI: !!process.env.OPENROUTER_API_KEY,
        model: process.env.AI_MODEL || 'deepseek/deepseek-v3.2',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Parse intent error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to parse intent' } },
      { status: 500 }
    );
  }
}
