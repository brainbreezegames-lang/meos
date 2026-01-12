'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ChevronDown, ChevronUp, Send, Mail, Loader2 } from 'lucide-react';
import { useCommentContextSafe } from '@/contexts/CommentContext';
import { useEditContextSafe } from '@/contexts/EditContext';
import type { Comment, CommentCategory } from '@/types';

interface CommentSectionProps {
  itemId: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

const CATEGORY_LABELS: Record<CommentCategory, { label: string; color: string }> = {
  general: { label: 'General', color: '#6B7280' },
  feedback: { label: 'Feedback', color: '#3B82F6' },
  question: { label: 'Question', color: '#F59E0B' },
  appreciation: { label: 'Appreciation', color: '#10B981' },
};

export function CommentSection({ itemId, isOpen = false, onToggle }: CommentSectionProps) {
  const commentContext = useCommentContextSafe();
  const editContext = useEditContextSafe();
  const [expanded, setExpanded] = useState(isOpen);
  const [showVerification, setShowVerification] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CommentCategory>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const isOwner = editContext?.isOwner ?? false;
  const comments = commentContext?.comments[itemId] || [];
  const isLoading = commentContext?.loadingItems.has(itemId);
  const session = commentContext?.session;

  // Load comments when expanded
  useEffect(() => {
    if (expanded && commentContext && !comments.length && !isLoading) {
      commentContext.loadComments(itemId);
    }
  }, [expanded, itemId, commentContext, comments.length, isLoading]);

  const handleToggle = () => {
    setExpanded(!expanded);
    onToggle?.();
  };

  const handleSendVerification = async () => {
    if (!commentContext || !email.trim()) return;

    const success = await commentContext.initiateVerification(email.trim(), itemId);
    if (success) {
      setVerificationSent(true);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentContext || !session || !newComment.trim()) return;

    setIsSubmitting(true);
    const result = await commentContext.addComment(itemId, newComment.trim(), selectedCategory);

    if (result) {
      setNewComment('');
      setSelectedCategory('general');
    }
    setIsSubmitting(false);
  };

  const handleOwnerReply = async (commentId: string) => {
    if (!commentContext || !replyContent.trim()) return;

    setIsSubmitting(true);
    const success = await commentContext.replyToComment(commentId, replyContent.trim());

    if (success) {
      setReplyContent('');
      setReplyingTo(null);
    }
    setIsSubmitting(false);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!commentContext) {
    return null;
  }

  return (
    <div
      className="border-t"
      style={{ borderColor: 'var(--border-light)' }}
    >
      {/* Header - Always visible */}
      <button
        onClick={handleToggle}
        className="w-full px-5 py-3 flex items-center justify-between transition-colors hover:bg-black/5 dark:hover:bg-white/5"
      >
        <div className="flex items-center gap-2">
          <MessageCircle size={16} style={{ color: 'var(--text-tertiary)' }} />
          <span
            className="text-[13px] font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            Feedback
          </span>
          {comments.length > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full text-[11px] font-medium"
              style={{
                background: 'var(--accent-primary)',
                color: 'white',
              }}
            >
              {comments.length}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={16} style={{ color: 'var(--text-tertiary)' }} />
        ) : (
          <ChevronDown size={16} style={{ color: 'var(--text-tertiary)' }} />
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="px-5 pb-5"
              style={{ borderTop: '1px solid var(--border-light)' }}
            >
              {/* Comment Form */}
              {!session && !showVerification && !verificationSent && (
                <div className="py-4">
                  <p
                    className="text-[13px] mb-3"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Leave feedback, ask questions, or share appreciation.
                  </p>
                  <button
                    onClick={() => setShowVerification(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
                    style={{
                      background: 'var(--accent-primary)',
                      color: 'white',
                    }}
                  >
                    <Mail size={14} />
                    Add Comment
                  </button>
                </div>
              )}

              {/* Email Verification Form */}
              {showVerification && !session && !verificationSent && (
                <div className="py-4">
                  <p
                    className="text-[13px] mb-3"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Enter your email to verify and comment.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-lg text-[13px] outline-none"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <button
                      onClick={handleSendVerification}
                      disabled={!email.trim() || commentContext.isVerifying}
                      className="px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors disabled:opacity-50"
                      style={{
                        background: 'var(--accent-primary)',
                        color: 'white',
                      }}
                    >
                      {commentContext.isVerifying ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        'Verify'
                      )}
                    </button>
                  </div>
                  {commentContext.verificationError && (
                    <p className="text-[12px] text-red-500 mt-2">
                      {commentContext.verificationError}
                    </p>
                  )}
                </div>
              )}

              {/* Verification Sent */}
              {verificationSent && !session && (
                <div className="py-4 text-center">
                  <Mail size={32} style={{ color: 'var(--accent-primary)' }} className="mx-auto mb-3" />
                  <h4
                    className="text-[14px] font-medium mb-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Check your email
                  </h4>
                  <p
                    className="text-[12px]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    We sent a verification link to {email}
                  </p>
                </div>
              )}

              {/* Logged In Comment Form */}
              {session && (
                <div className="py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[12px]"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      Commenting as {session.email}
                    </span>
                    <button
                      onClick={() => commentContext.clearSession()}
                      className="text-[11px]"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      Sign out
                    </button>
                  </div>

                  {/* Category Selector */}
                  <div className="flex gap-1.5">
                    {(Object.keys(CATEGORY_LABELS) as CommentCategory[]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                        style={{
                          background: selectedCategory === cat
                            ? CATEGORY_LABELS[cat].color
                            : 'var(--bg-secondary)',
                          color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                        }}
                      >
                        {CATEGORY_LABELS[cat].label}
                      </button>
                    ))}
                  </div>

                  {/* Comment Input */}
                  <div className="flex gap-2">
                    <textarea
                      placeholder="Write your comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                      className="flex-1 px-4 py-2.5 rounded-lg text-[13px] outline-none resize-none"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmitting}
                      className="self-end p-2.5 rounded-lg transition-colors disabled:opacity-50"
                      style={{
                        background: 'var(--accent-primary)',
                        color: 'white',
                      }}
                    >
                      {isSubmitting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Comments List */}
              {isLoading ? (
                <div className="py-8 flex justify-center">
                  <Loader2 size={20} className="animate-spin" style={{ color: 'var(--text-tertiary)' }} />
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4 pt-2">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 rounded-xl"
                      style={{ background: 'var(--bg-secondary)' }}
                    >
                      {/* Comment Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-medium"
                            style={{
                              background: CATEGORY_LABELS[comment.category as CommentCategory].color,
                              color: 'white',
                            }}
                          >
                            {CATEGORY_LABELS[comment.category as CommentCategory].label}
                          </span>
                          <span
                            className="text-[12px]"
                            style={{ color: 'var(--text-tertiary)' }}
                          >
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <span
                          className="text-[11px]"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          {comment.commenter?.email?.split('@')[0] || 'Anonymous'}
                        </span>
                      </div>

                      {/* Comment Content */}
                      <p
                        className="text-[13px] leading-relaxed"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {comment.content}
                      </p>

                      {/* Owner Reply */}
                      {comment.ownerReply && (
                        <div
                          className="mt-3 pt-3 pl-4"
                          style={{ borderTop: '1px solid var(--border-light)', borderLeft: '2px solid var(--accent-primary)' }}
                        >
                          <span
                            className="text-[11px] font-medium"
                            style={{ color: 'var(--accent-primary)' }}
                          >
                            Owner Reply
                          </span>
                          <p
                            className="text-[13px] mt-1"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {comment.ownerReply}
                          </p>
                        </div>
                      )}

                      {/* Owner Reply Form */}
                      {isOwner && !comment.ownerReply && (
                        <>
                          {replyingTo === comment.id ? (
                            <div className="mt-3 flex gap-2">
                              <input
                                type="text"
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg text-[12px] outline-none"
                                style={{
                                  background: 'var(--bg-primary)',
                                  border: '1px solid var(--border-medium)',
                                  color: 'var(--text-primary)',
                                }}
                              />
                              <button
                                onClick={() => handleOwnerReply(comment.id)}
                                disabled={!replyContent.trim() || isSubmitting}
                                className="px-3 py-2 rounded-lg text-[11px] font-medium disabled:opacity-50"
                                style={{
                                  background: 'var(--accent-primary)',
                                  color: 'white',
                                }}
                              >
                                Reply
                              </button>
                              <button
                                onClick={() => { setReplyingTo(null); setReplyContent(''); }}
                                className="px-3 py-2 rounded-lg text-[11px]"
                                style={{ color: 'var(--text-tertiary)' }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReplyingTo(comment.id)}
                              className="mt-2 text-[11px] font-medium"
                              style={{ color: 'var(--accent-primary)' }}
                            >
                              Reply
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p
                    className="text-[13px]"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    No comments yet. Be the first to share your thoughts.
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
