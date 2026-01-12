'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Comment, Commenter, CommentCategory } from '@/types';

interface CommentSession {
  commenterId: string;
  email: string;
  displayName: string | null;
  verifiedAt: Date;
}

interface CommentContextType {
  // Session
  session: CommentSession | null;
  isVerifying: boolean;
  verificationError: string | null;

  // Comments cache by itemId
  comments: Record<string, Comment[]>;
  loadingItems: Set<string>;

  // Actions
  initiateVerification: (email: string, itemId: string) => Promise<boolean>;
  verifyToken: (token: string) => Promise<boolean>;
  clearSession: () => void;

  // Comment operations
  loadComments: (itemId: string) => Promise<void>;
  addComment: (itemId: string, content: string, category: CommentCategory) => Promise<Comment | null>;
  deleteComment: (commentId: string) => Promise<boolean>;

  // Owner operations
  replyToComment: (commentId: string, reply: string) => Promise<boolean>;
}

const CommentContext = createContext<CommentContextType | null>(null);

export function useCommentContext() {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error('useCommentContext must be used within CommentProvider');
  }
  return context;
}

export function useCommentContextSafe() {
  return useContext(CommentContext);
}

const SESSION_KEY = 'meos_commenter_session';

export function CommentProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<CommentSession | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if session is still valid (not older than 30 days)
        const verifiedAt = new Date(parsed.verifiedAt);
        const daysSinceVerification = (Date.now() - verifiedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceVerification < 30) {
          setSession(parsed);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  // Save session to localStorage
  const saveSession = useCallback((newSession: CommentSession) => {
    setSession(newSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  }, []);

  // Clear session
  const clearSession = useCallback(() => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  // Initiate email verification
  const initiateVerification = useCallback(async (email: string, itemId: string): Promise<boolean> => {
    setIsVerifying(true);
    setVerificationError(null);

    try {
      const response = await fetch('/api/comments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, itemId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setVerificationError(data.error?.message || 'Failed to send verification email');
        return false;
      }

      return true;
    } catch {
      setVerificationError('Failed to send verification email');
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  // Verify token from email link
  const verifyToken = useCallback(async (token: string): Promise<boolean> => {
    setIsVerifying(true);
    setVerificationError(null);

    try {
      const response = await fetch(`/api/comments/verify/${token}`);
      const data = await response.json();

      if (!response.ok) {
        setVerificationError(data.error?.message || 'Invalid or expired verification link');
        return false;
      }

      // Save session
      saveSession({
        commenterId: data.data.commenterId,
        email: data.data.email,
        displayName: data.data.displayName,
        verifiedAt: new Date(),
      });

      return true;
    } catch {
      setVerificationError('Verification failed');
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [saveSession]);

  // Load comments for an item
  const loadComments = useCallback(async (itemId: string) => {
    if (loadingItems.has(itemId)) return;

    setLoadingItems(prev => new Set(prev).add(itemId));

    try {
      const response = await fetch(`/api/items/${itemId}/comments`);
      const data = await response.json();

      if (response.ok && data.data) {
        setComments(prev => ({
          ...prev,
          [itemId]: data.data,
        }));
      }
    } catch {
      console.error('Failed to load comments');
    } finally {
      setLoadingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }, [loadingItems]);

  // Add a comment
  const addComment = useCallback(async (
    itemId: string,
    content: string,
    category: CommentCategory
  ): Promise<Comment | null> => {
    if (!session) return null;

    try {
      const response = await fetch(`/api/items/${itemId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          category,
          commenterId: session.commenterId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to add comment');
      }

      // Update local cache
      setComments(prev => ({
        ...prev,
        [itemId]: [data.data, ...(prev[itemId] || [])],
      }));

      return data.data;
    } catch (error) {
      console.error('Failed to add comment:', error);
      return null;
    }
  }, [session]);

  // Delete a comment
  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) return false;

      // Update local cache
      setComments(prev => {
        const updated = { ...prev };
        for (const itemId in updated) {
          updated[itemId] = updated[itemId].filter(c => c.id !== commentId);
        }
        return updated;
      });

      return true;
    } catch {
      return false;
    }
  }, []);

  // Reply to a comment (owner only)
  const replyToComment = useCallback(async (commentId: string, reply: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/comments/${commentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply }),
      });

      if (!response.ok) return false;

      const data = await response.json();

      // Update local cache
      setComments(prev => {
        const updated = { ...prev };
        for (const itemId in updated) {
          updated[itemId] = updated[itemId].map(c =>
            c.id === commentId
              ? { ...c, ownerReply: reply, ownerRepliedAt: new Date() }
              : c
          );
        }
        return updated;
      });

      return true;
    } catch {
      return false;
    }
  }, []);

  const value: CommentContextType = {
    session,
    isVerifying,
    verificationError,
    comments,
    loadingItems,
    initiateVerification,
    verifyToken,
    clearSession,
    loadComments,
    addComment,
    deleteComment,
    replyToComment,
  };

  return (
    <CommentContext.Provider value={value}>
      {children}
    </CommentContext.Provider>
  );
}
