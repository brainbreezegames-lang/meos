'use client';

import { useState, useCallback } from 'react';
import type { ParsedIntent, GeneratedContent, BuildItem, BuildSequence } from '@/lib/ai/types';

interface OnboardingState {
  phase: 'idle' | 'prompt' | 'parsing' | 'generating' | 'building' | 'complete';
  error: string | null;
  intent: ParsedIntent | null;
  content: GeneratedContent | null;
  buildSequence: BuildSequence | null;
}

// Grid positions for items (percentage-based)
const GRID_POSITIONS = {
  widgets: [
    { x: 82, y: 15 },  // Top right
    { x: 82, y: 35 },  // Right side
    { x: 82, y: 55 },  // Right side lower
  ],
  folders: [
    { x: 5, y: 25 },   // Left side
    { x: 18, y: 25 },  // Left side
  ],
  notes: [
    { x: 5, y: 45 },   // Below folders
    { x: 18, y: 45 },
    { x: 31, y: 45 },
    { x: 5, y: 65 },
    { x: 18, y: 65 },
    { x: 31, y: 65 },
  ],
};

function generateBuildSequence(intent: ParsedIntent, content: GeneratedContent): BuildSequence {
  const items: BuildItem[] = [];
  let delay = 0;
  const BASE_DELAY = 250;

  // Add widgets first
  intent.widgets.forEach((widgetType, index) => {
    const pos = GRID_POSITIONS.widgets[index] || { x: 82, y: 15 + index * 20 };
    items.push({
      id: `widget-${widgetType}-${Date.now()}-${index}`,
      type: 'widget',
      widgetType: widgetType,
      title: widgetType.charAt(0).toUpperCase() + widgetType.slice(1),
      position: pos,
      config: widgetType === 'status' ? { text: intent.statusText } : {},
      delay: BASE_DELAY,
    });
    delay += BASE_DELAY;
  });

  // Add folders
  intent.folders.forEach((folderName, index) => {
    const pos = GRID_POSITIONS.folders[index] || { x: 5 + index * 13, y: 25 };
    items.push({
      id: `folder-${folderName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`,
      type: 'file',
      fileType: 'folder',
      title: folderName,
      position: pos,
      delay: BASE_DELAY,
    });
    delay += BASE_DELAY;
  });

  // Add notes/files
  intent.notes.forEach((note, index) => {
    const pos = GRID_POSITIONS.notes[index] || { x: 5 + (index % 3) * 13, y: 45 + Math.floor(index / 3) * 20 };
    items.push({
      id: `file-${note.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`,
      type: 'file',
      fileType: note.type as BuildItem['fileType'],
      title: note.title,
      content: content[note.title] || '',
      position: pos,
      delay: BASE_DELAY,
    });
    delay += BASE_DELAY;
  });

  return {
    items,
    totalDuration: delay + 1000, // Extra buffer for completion
  };
}

export function useAIOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    phase: 'idle',
    error: null,
    intent: null,
    content: null,
    buildSequence: null,
  });

  const startOnboarding = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'prompt', error: null }));
  }, []);

  const cancelOnboarding = useCallback(() => {
    setState({
      phase: 'idle',
      error: null,
      intent: null,
      content: null,
      buildSequence: null,
    });
  }, []);

  const submitPrompt = useCallback(async (prompt: string) => {
    setState(prev => ({ ...prev, phase: 'parsing', error: null }));

    try {
      // Step 1: Parse intent
      const intentResponse = await fetch('/api/ai/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!intentResponse.ok) {
        throw new Error('Failed to parse intent');
      }

      const intentData = await intentResponse.json();
      if (!intentData.success) {
        throw new Error(intentData.error?.message || 'Failed to parse intent');
      }

      const intent = intentData.data as ParsedIntent;
      setState(prev => ({ ...prev, intent, phase: 'generating' }));

      // Step 2: Generate content
      const contentResponse = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent, userPrompt: prompt }),
      });

      if (!contentResponse.ok) {
        throw new Error('Failed to generate content');
      }

      const contentData = await contentResponse.json();
      if (!contentData.success) {
        throw new Error(contentData.error?.message || 'Failed to generate content');
      }

      const content = contentData.data as GeneratedContent;

      // Step 3: Generate build sequence
      const buildSequence = generateBuildSequence(intent, content);

      setState(prev => ({
        ...prev,
        content,
        buildSequence,
        phase: 'building',
      }));
    } catch (error) {
      console.error('Onboarding error:', error);
      setState(prev => ({
        ...prev,
        phase: 'prompt',
        error: error instanceof Error ? error.message : 'Something went wrong',
      }));
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'complete' }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setState({
      phase: 'idle',
      error: null,
      intent: null,
      content: null,
      buildSequence: null,
    });
  }, []);

  return {
    ...state,
    isPromptOpen: state.phase === 'prompt',
    isLoading: state.phase === 'parsing' || state.phase === 'generating',
    isBuilding: state.phase === 'building',
    isComplete: state.phase === 'complete',
    startOnboarding,
    cancelOnboarding,
    submitPrompt,
    completeOnboarding,
    resetOnboarding,
  };
}
