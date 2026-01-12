'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, Send, ChevronDown } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  likes: number;
  ownerReply?: string;
}

interface CommentSectionProps {
  itemId: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

// Simple local storage for demo - in production this would be an API
const getStoredComments = (itemId: string): Comment[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`comments-${itemId}`);
  if (stored) {
    try {
      return JSON.parse(stored).map((c: Comment) => ({
        ...c,
        createdAt: new Date(c.createdAt)
      }));
    } catch {
      return [];
    }
  }
  return [];
};

const storeComments = (itemId: string, comments: Comment[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`comments-${itemId}`, JSON.stringify(comments));
};

const getLikedComments = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  const stored = localStorage.getItem('liked-comments');
  if (stored) {
    try {
      return new Set(JSON.parse(stored));
    } catch {
      return new Set();
    }
  }
  return new Set();
};

const storeLikedComments = (liked: Set<string>) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('liked-comments', JSON.stringify([...liked]));
};

export function CommentSection({ itemId, isOpen = false, onToggle }: CommentSectionProps) {
  const [expanded, setExpanded] = useState(isOpen);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  // Load comments and liked state
  useEffect(() => {
    setComments(getStoredComments(itemId));
    setLikedComments(getLikedComments());
  }, [itemId]);

  const handleToggle = () => {
    setExpanded(!expanded);
    onToggle?.();
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    // Simulate brief delay for realism
    await new Promise(resolve => setTimeout(resolve, 200));

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      content: newComment.trim(),
      createdAt: new Date(),
      likes: 0,
    };

    const updatedComments = [comment, ...comments];
    setComments(updatedComments);
    storeComments(itemId, updatedComments);
    setNewComment('');
    setIsSubmitting(false);
  };

  const handleLike = (commentId: string) => {
    const newLiked = new Set(likedComments);
    const updatedComments = comments.map(c => {
      if (c.id === commentId) {
        if (newLiked.has(commentId)) {
          newLiked.delete(commentId);
          return { ...c, likes: Math.max(0, c.likes - 1) };
        } else {
          newLiked.add(commentId);
          return { ...c, likes: c.likes + 1 };
        }
      }
      return c;
    });

    setLikedComments(newLiked);
    setComments(updatedComments);
    storeLikedComments(newLiked);
    storeComments(itemId, updatedComments);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const totalLikes = comments.reduce((sum, c) => sum + c.likes, 0);

  return (
    <div
      style={{
        borderTop: '1px solid var(--border-light, rgba(0,0,0,0.06))',
        background: 'var(--bg-secondary, #fafafa)',
      }}
    >
      {/* Header - Always visible */}
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 flex items-center justify-between transition-colors"
        style={{
          background: expanded ? 'var(--bg-elevated, white)' : 'transparent',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <MessageCircle size={14} style={{ color: 'var(--text-tertiary, #888)' }} />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-secondary, #666)',
                fontFamily: 'var(--font-body, system-ui)',
              }}
            >
              {comments.length === 0 ? 'Leave feedback' : `${comments.length} ${comments.length === 1 ? 'comment' : 'comments'}`}
            </span>
          </div>
          {totalLikes > 0 && (
            <div className="flex items-center gap-1">
              <Heart size={12} fill="var(--accent-primary, #ec4899)" style={{ color: 'var(--accent-primary, #ec4899)' }} />
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--text-tertiary, #888)',
                  fontFamily: 'var(--font-body, system-ui)',
                }}
              >
                {totalLikes}
              </span>
            </div>
          )}
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} style={{ color: 'var(--text-tertiary, #888)' }} />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="px-4 pb-4"
              style={{
                background: 'var(--bg-elevated, white)',
                borderTop: '1px solid var(--border-light, rgba(0,0,0,0.04))',
              }}
            >
              {/* Comment Input - Always visible, no auth required */}
              <div className="pt-3 pb-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Share your thoughts..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitComment();
                        }
                      }}
                      className="w-full pl-3 pr-10 py-2 rounded-full text-[13px] outline-none transition-all"
                      style={{
                        background: 'var(--bg-secondary, #f5f5f5)',
                        border: '1px solid var(--border-light, rgba(0,0,0,0.06))',
                        color: 'var(--text-primary, #1a1a1a)',
                        fontFamily: 'var(--font-body, system-ui)',
                      }}
                    />
                    <button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmitting}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all disabled:opacity-30"
                      style={{
                        background: newComment.trim() ? 'var(--accent-primary, #3b82f6)' : 'transparent',
                        color: newComment.trim() ? 'white' : 'var(--text-tertiary, #888)',
                      }}
                    >
                      <Send size={12} />
                    </button>
                  </div>
                </div>
                <p
                  className="mt-2 text-center"
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-tertiary, #aaa)',
                    fontFamily: 'var(--font-body, system-ui)',
                  }}
                >
                  Anonymous • Be kind
                </p>
              </div>

              {/* Comments List */}
              {comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group"
                    >
                      <div
                        className="p-3 rounded-xl"
                        style={{
                          background: 'var(--bg-secondary, #f8f8f8)',
                        }}
                      >
                        {/* Comment content */}
                        <p
                          style={{
                            fontSize: '13px',
                            color: 'var(--text-primary, #1a1a1a)',
                            fontFamily: 'var(--font-body, system-ui)',
                            lineHeight: 1.5,
                            marginBottom: '8px',
                          }}
                        >
                          {comment.content}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--text-tertiary, #999)',
                              fontFamily: 'var(--font-body, system-ui)',
                            }}
                          >
                            {formatDate(comment.createdAt)}
                          </span>

                          {/* Like button */}
                          <button
                            onClick={() => handleLike(comment.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-full transition-all"
                            style={{
                              background: likedComments.has(comment.id)
                                ? 'rgba(236,72,153,0.1)'
                                : 'transparent',
                            }}
                          >
                            <Heart
                              size={13}
                              fill={likedComments.has(comment.id) ? '#ec4899' : 'none'}
                              style={{
                                color: likedComments.has(comment.id) ? '#ec4899' : 'var(--text-tertiary, #999)',
                                transition: 'all 0.15s ease',
                              }}
                            />
                            {comment.likes > 0 && (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  color: likedComments.has(comment.id) ? '#ec4899' : 'var(--text-tertiary, #999)',
                                  fontFamily: 'var(--font-body, system-ui)',
                                }}
                              >
                                {comment.likes}
                              </span>
                            )}
                          </button>
                        </div>

                        {/* Owner Reply */}
                        {comment.ownerReply && (
                          <div
                            className="mt-3 pt-3"
                            style={{
                              borderTop: '1px solid var(--border-light, rgba(0,0,0,0.06))',
                            }}
                          >
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <div
                                className="w-4 h-4 rounded-full flex items-center justify-center"
                                style={{
                                  background: 'var(--accent-primary, #3b82f6)',
                                  fontSize: '8px',
                                  color: 'white',
                                }}
                              >
                                ✓
                              </div>
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  color: 'var(--accent-primary, #3b82f6)',
                                  fontFamily: 'var(--font-body, system-ui)',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.03em',
                                }}
                              >
                                Owner
                              </span>
                            </div>
                            <p
                              style={{
                                fontSize: '12px',
                                color: 'var(--text-secondary, #666)',
                                fontFamily: 'var(--font-body, system-ui)',
                                lineHeight: 1.5,
                              }}
                            >
                              {comment.ownerReply}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-tertiary, #999)',
                      fontFamily: 'var(--font-body, system-ui)',
                    }}
                  >
                    No feedback yet. Be the first!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
