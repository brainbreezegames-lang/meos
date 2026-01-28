'use client';

import { useState, useCallback } from 'react';

interface OnboardingState {
  phase: 'idle' | 'prompt' | 'building' | 'complete';
  prompt: string | null;
  error: string | null;
}

export interface StreamingBuildItem {
  id: string;
  type: 'widget' | 'file';
  fileType?: string;
  widgetType?: string;
  title: string;
  content?: string;
  purpose?: string;
  config?: Record<string, unknown>;
}

export function useAIOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    phase: 'idle',
    prompt: null,
    error: null,
  });

  const startOnboarding = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'prompt', error: null }));
  }, []);

  const cancelOnboarding = useCallback(() => {
    setState({
      phase: 'idle',
      prompt: null,
      error: null,
    });
  }, []);

  const submitPrompt = useCallback((prompt: string) => {
    setState({
      phase: 'building',
      prompt,
      error: null,
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setState({
      phase: 'complete',
      prompt: null,
      error: null,
    });
  }, []);

  const resetOnboarding = useCallback(() => {
    setState({
      phase: 'idle',
      prompt: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    isPromptOpen: state.phase === 'prompt',
    isBuilding: state.phase === 'building',
    isComplete: state.phase === 'complete',
    startOnboarding,
    cancelOnboarding,
    submitPrompt,
    completeOnboarding,
    resetOnboarding,
  };
}
