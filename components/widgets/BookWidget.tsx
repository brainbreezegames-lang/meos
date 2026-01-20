'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowUpRight } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/types';

interface BookWidgetConfig {
  url: string;
  buttonText: string;
}

interface BookWidgetProps {
  widget: Widget;
  isOwner?: boolean;
  onEdit?: () => void;
  onPositionChange?: (x: number, y: number) => void;
}

const DEFAULT_CONFIG: BookWidgetConfig = {
  url: '',
  buttonText: 'Book a Call',
};

export function BookWidget({ widget, isOwner, onEdit, onPositionChange }: BookWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config: BookWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<BookWidgetConfig>) };

  const handleClick = () => {
    if (config.url) {
      window.open(config.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <WidgetWrapper
      widget={widget}
      isOwner={isOwner}
      onEdit={onEdit}
      onPositionChange={onPositionChange}
    >
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative"
        style={{
          borderRadius: '20px',
          overflow: 'hidden',
          cursor: config.url ? 'pointer' : 'default',
        }}
        whileHover={{
          scale: config.url ? 1.02 : 1,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 20px rgba(139, 92, 246, 0.2)',
        }}
        whileTap={{ scale: config.url ? 0.98 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Gradient background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          }}
        />

        {/* Content */}
        <div
          className="relative flex items-center gap-2"
          style={{
            padding: '10px 16px',
          }}
        >
          <Calendar
            size={16}
            style={{ color: 'rgba(255,255,255,0.9)' }}
          />
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'white',
              fontFamily: 'var(--font-body, system-ui)',
              whiteSpace: 'nowrap',
            }}
          >
            {widget.title || config.buttonText}
          </span>
          <motion.div
            animate={{
              x: isHovered ? 2 : 0,
              opacity: isHovered ? 1 : 0.7,
            }}
            transition={{ duration: 0.15 }}
          >
            <ArrowUpRight
              size={14}
              style={{ color: 'rgba(255,255,255,0.8)' }}
            />
          </motion.div>
        </div>
      </motion.button>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as BOOK_WIDGET_DEFAULT_CONFIG };
