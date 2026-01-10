'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GuestbookEntry {
  id: string;
  author: string;
  message: string;
  timestamp: Date;
  isOwner?: boolean;
}

interface GuestbookMessagesProps {
  entries: GuestbookEntry[];
  ownerName: string;
  ownerImage?: string;
  isVisible: boolean;
  onClose: () => void;
  onSubmit?: (message: string, author: string) => void;
  canSubmit?: boolean;
}

export function GuestbookMessages({
  entries,
  ownerName,
  ownerImage,
  isVisible,
  onClose,
  onSubmit,
  canSubmit = true,
}: GuestbookMessagesProps) {
  const [message, setMessage] = useState('');
  const [author, setAuthor] = useState('');
  const [showAuthorInput, setShowAuthorInput] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && isVisible) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, isVisible]);

  const handleSubmit = () => {
    if (!message.trim()) return;

    if (!author.trim() && !showAuthorInput) {
      setShowAuthorInput(true);
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    onSubmit?.(message.trim(), author.trim() || 'Anonymous');
    setMessage('');
    setAuthor('');
    setShowAuthorInput(false);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Group entries by date
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = formatDate(entry.timestamp);
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, GuestbookEntry[]>);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[500] flex flex-col"
          style={{
            background: 'linear-gradient(180deg, rgba(20, 20, 25, 1) 0%, rgba(30, 30, 35, 1) 100%)',
          }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 40,
          }}
        >
          {/* Safe area top */}
          <div style={{ height: 'env(safe-area-inset-top, 44px)' }} />

          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10">
            <motion.button
              onClick={onClose}
              className="text-blue-400 font-normal"
              style={{
                fontSize: 17,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              }}
              whileTap={{ opacity: 0.7 }}
            >
              Close
            </motion.button>

            <div className="flex items-center gap-2">
              {ownerImage && (
                <img src={ownerImage} alt={ownerName} className="w-8 h-8 rounded-full object-cover" />
              )}
              <div className="text-center">
                <p
                  className="font-semibold text-white"
                  style={{
                    fontSize: 16,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  }}
                >
                  {ownerName}
                </p>
                <p
                  className="text-xs text-white/50"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                >
                  Guestbook
                </p>
              </div>
            </div>

            <div className="w-12" /> {/* Spacer for centering */}
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto overscroll-contain px-4 py-4"
          >
            {Object.entries(groupedEntries).map(([date, dateEntries]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex justify-center my-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs text-white/40"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                    }}
                  >
                    {date}
                  </span>
                </div>

                {/* Messages for this date */}
                {dateEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    className={`flex mb-2 ${entry.isOwner ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div className={`max-w-[75%] ${entry.isOwner ? 'items-end' : 'items-start'} flex flex-col`}>
                      {/* Author name (for non-owner messages) */}
                      {!entry.isOwner && (
                        <span
                          className="text-xs text-white/40 mb-1 px-3"
                          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                        >
                          {entry.author}
                        </span>
                      )}

                      {/* Message bubble */}
                      <div
                        className="px-4 py-2.5 rounded-[20px]"
                        style={{
                          background: entry.isOwner
                            ? 'linear-gradient(135deg, #007AFF 0%, #0056D6 100%)'
                            : 'rgba(255, 255, 255, 0.1)',
                          borderBottomRightRadius: entry.isOwner ? 4 : 20,
                          borderBottomLeftRadius: entry.isOwner ? 20 : 4,
                        }}
                      >
                        <p
                          className="text-white leading-relaxed"
                          style={{
                            fontSize: 16,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                          }}
                        >
                          {entry.message}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <span
                        className="text-xs text-white/30 mt-1 px-3"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                      >
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}

            {/* Empty state */}
            {entries.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <span className="text-4xl mb-3">💬</span>
                <p
                  className="text-white/50 text-center"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                >
                  No messages yet.<br />Be the first to leave a note!
                </p>
              </div>
            )}
          </div>

          {/* Input area */}
          {canSubmit && (
            <div className="flex-shrink-0 border-t border-white/10">
              {/* Author input (conditional) */}
              <AnimatePresence>
                {showAuthorInput && (
                  <motion.div
                    className="px-4 py-2 border-b border-white/10"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-2 rounded-xl text-white placeholder-white/30 outline-none"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        fontSize: 16,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message input */}
              <div className="flex items-end gap-2 px-4 py-3">
                <div
                  className="flex-1 rounded-[20px] px-4 py-2"
                  style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Leave a message..."
                    className="w-full text-white placeholder-white/30 outline-none bg-transparent"
                    style={{
                      fontSize: 16,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                </div>

                {/* Send button */}
                <motion.button
                  onClick={handleSubmit}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: message.trim() ? '#007AFF' : 'rgba(255, 255, 255, 0.1)',
                  }}
                  whileTap={{ scale: 0.9 }}
                  disabled={!message.trim()}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={message.trim() ? 'white' : 'rgba(255, 255, 255, 0.3)'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                </motion.button>
              </div>

              {/* Safe area bottom */}
              <div style={{ height: 'env(safe-area-inset-bottom, 8px)' }} />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
