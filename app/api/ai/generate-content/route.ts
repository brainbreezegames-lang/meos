import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  CONTENT_GENERATOR_SYSTEM_PROMPT,
  buildContentGeneratorPrompt,
} from '@/lib/ai/prompts';
import { generateFallbackContent } from '@/lib/ai/templates';
import type { ParsedIntent, GeneratedContent } from '@/lib/ai/types';

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
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://meos-delta.vercel.app',
      'X-Title': 'goOS Onboarding',
    },
    body: JSON.stringify({
      model,
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

    // Check if AI is configured
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn('OPENROUTER_API_KEY not configured, using fallback content');
      content = generateFallbackContent(intent as ParsedIntent);
    } else {
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
