'use client';

import { BlockData } from '@/types';
import { BLOCK_DEFINITIONS } from '@/types/blocks';
import TextBlockEditor from './TextBlockEditor';
import HeadingBlockEditor from './HeadingBlockEditor';
import DetailsBlockEditor from './DetailsBlockEditor';
import StatsBlockEditor from './StatsBlockEditor';
import TimelineBlockEditor from './TimelineBlockEditor';
import ListBlockEditor from './ListBlockEditor';
import ImageBlockEditor from './ImageBlockEditor';
import GalleryBlockEditor from './GalleryBlockEditor';
import VideoBlockEditor from './VideoBlockEditor';
import EmbedBlockEditor from './EmbedBlockEditor';
import ButtonsBlockEditor from './ButtonsBlockEditor';
import LinksBlockEditor from './LinksBlockEditor';
import QuoteBlockEditor from './QuoteBlockEditor';
import CalloutBlockEditor from './CalloutBlockEditor';
import SocialBlockEditor from './SocialBlockEditor';
import CaseStudyBlockEditor from './CaseStudyBlockEditor';
import TestimonialBlockEditor from './TestimonialBlockEditor';
import ProductBlockEditor from './ProductBlockEditor';
import LogosBlockEditor from './LogosBlockEditor';
import DividerBlockEditor from './DividerBlockEditor';
import DownloadBlockEditor from './DownloadBlockEditor';

interface BlockEditorProps {
  block: BlockData;
  onChange: (data: Record<string, unknown>) => void;
  onUpload: (file: File) => Promise<string>;
}

export default function BlockEditor({ block, onChange, onUpload }: BlockEditorProps) {
  const definition = BLOCK_DEFINITIONS.find(d => d.type === block.type);

  const renderEditor = () => {
    switch (block.type) {
      case 'text':
        return <TextBlockEditor data={block.data} onChange={onChange} />;
      case 'heading':
        return <HeadingBlockEditor data={block.data} onChange={onChange} />;
      case 'divider':
        return <DividerBlockEditor data={block.data} onChange={onChange} />;
      case 'quote':
        return <QuoteBlockEditor data={block.data} onChange={onChange} />;
      case 'callout':
        return <CalloutBlockEditor data={block.data} onChange={onChange} />;
      case 'details':
        return <DetailsBlockEditor data={block.data} onChange={onChange} />;
      case 'stats':
        return <StatsBlockEditor data={block.data} onChange={onChange} />;
      case 'timeline':
        return <TimelineBlockEditor data={block.data} onChange={onChange} />;
      case 'list':
        return <ListBlockEditor data={block.data} onChange={onChange} />;
      case 'image':
        return <ImageBlockEditor data={block.data} onChange={onChange} onUpload={onUpload} />;
      case 'gallery':
        return <GalleryBlockEditor data={block.data} onChange={onChange} onUpload={onUpload} />;
      case 'video':
        return <VideoBlockEditor data={block.data} onChange={onChange} />;
      case 'embed':
        return <EmbedBlockEditor data={block.data} onChange={onChange} />;
      case 'buttons':
        return <ButtonsBlockEditor data={block.data} onChange={onChange} />;
      case 'links':
        return <LinksBlockEditor data={block.data} onChange={onChange} />;
      case 'download':
        return <DownloadBlockEditor data={block.data} onChange={onChange} onUpload={onUpload} />;
      case 'social':
        return <SocialBlockEditor data={block.data} onChange={onChange} />;
      case 'case-study':
        return <CaseStudyBlockEditor data={block.data} onChange={onChange} />;
      case 'testimonial':
        return <TestimonialBlockEditor data={block.data} onChange={onChange} onUpload={onUpload} />;
      case 'product':
        return <ProductBlockEditor data={block.data} onChange={onChange} onUpload={onUpload} />;
      case 'logos':
        return <LogosBlockEditor data={block.data} onChange={onChange} onUpload={onUpload} />;
      default:
        return (
          <div className="p-4 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            Editor not available for this block type
          </div>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <span className="w-6 h-6 flex items-center justify-center rounded text-[12px]"
          style={{ background: 'var(--bg-glass)' }}>
          {definition?.icon || '?'}
        </span>
        <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
          {definition?.label || block.type}
        </span>
      </div>
      {renderEditor()}
    </div>
  );
}
