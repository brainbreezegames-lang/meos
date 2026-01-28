import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  CONTENT_GENERATOR_SYSTEM_PROMPT,
  buildContentGeneratorPrompt,
} from '@/lib/ai/prompts';
import { generateFallbackContent } from '@/lib/ai/templates';
import type { ParsedIntent, GeneratedContent } from '@/lib/ai/types';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const AI_MODEL = process.env.AI_MODEL || 'google/gemini-2.0-flash-001';

const requestSchema = z.object({
  intent: z.object({
    userType: z.string(),
    baseTemplate: z.string(),
    widgets: z.array(z.string()),
    folders: z.array(z.string()),
    notes: z.array(z.object({
      title: z.string(),
      type: z.string(),
    })),
    statusText: z.string(),
    tone: z.string(),
    summary: z.string(),
  }),
  userPrompt: z.string(),
});

async function callOpenRouter(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://meos-delta.vercel.app',
      'X-Title': 'goOS Onboarding',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenRouter error:', error);
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
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
    const { intent, userPrompt } = requestSchema.parse(body);

    let content: GeneratedContent;

    try {
      // Call OpenRouter for content generation
      const aiResponse = await callOpenRouter(
        CONTENT_GENERATOR_SYSTEM_PROMPT,
        buildContentGeneratorPrompt(
          intent.userType,
          intent.tone,
          userPrompt,
          intent.notes
        )
      );

      // Extract and parse JSON
      const jsonStr = extractJSON(aiResponse);
      content = JSON.parse(jsonStr);

      // Ensure all notes have content
      for (const note of intent.notes) {
        if (!content[note.title]) {
          content[note.title] = `<h1>${note.title}</h1><p>Add your content here.</p>`;
        }
      }
    } catch (aiError) {
      console.error('AI content generation failed, using fallback:', aiError);
      // Use fallback template-based content
      content = generateFallbackContent(intent as ParsedIntent);
    }

    return NextResponse.json({
      success: true,
      data: content,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } },
        { status: 400 }
      );
    }

    console.error('Generate content error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to generate content' } },
      { status: 500 }
    );
  }
}
