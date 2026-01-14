'use client';


import { BlockData } from '@/types';
import ProductGrid from '@/components/features/ProductGrid';
import SpreadsheetTable from '@/components/features/SpreadsheetTable';
import TextBlockRenderer from './renderers/TextBlock';
import HeadingBlockRenderer from './renderers/HeadingBlock';
import DividerBlockRenderer from './renderers/DividerBlock';
import QuoteBlockRenderer from './renderers/QuoteBlock';
import CalloutBlockRenderer from './renderers/CalloutBlock';
import DetailsBlockRenderer from './renderers/DetailsBlock';
import StatsBlockRenderer from './renderers/StatsBlock';
import TimelineBlockRenderer from './renderers/TimelineBlock';
import ListBlockRenderer from './renderers/ListBlock';
import ImageBlockRenderer from './renderers/ImageBlock';
import GalleryBlockRenderer from './renderers/GalleryBlock';
import VideoBlockRenderer from './renderers/VideoBlock';
import EmbedBlockRenderer from './renderers/EmbedBlock';
import ButtonsBlockRenderer from './renderers/ButtonsBlock';
import LinksBlockRenderer from './renderers/LinksBlock';
import DownloadBlockRenderer from './renderers/DownloadBlock';
import SocialBlockRenderer from './renderers/SocialBlock';
import CaseStudyBlockRenderer from './renderers/CaseStudyBlock';
import BeforeAfterBlockRenderer from './renderers/BeforeAfterBlock';
import LogosBlockRenderer from './renderers/LogosBlock';
import TestimonialBlockRenderer from './renderers/TestimonialBlock';
import ProductBlockRenderer from './renderers/ProductBlock';
import BookBlockRenderer from './renderers/BookBlock';
import AwardBlockRenderer from './renderers/AwardBlock';
import PressBlockRenderer from './renderers/PressBlock';
import TableBlockRenderer from './renderers/TableBlock';
import AudioBlockRenderer from './renderers/AudioBlock';
import CarouselBlockRenderer from './renderers/CarouselBlock';

interface BlockRendererProps {
  block: BlockData;
}

export default function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case 'text':
      return <TextBlockRenderer data={block.data} />;
    case 'heading':
      return <HeadingBlockRenderer data={block.data} />;
    case 'divider':
      return <DividerBlockRenderer data={block.data} />;
    case 'quote':
      return <QuoteBlockRenderer data={block.data} />;
    case 'callout':
      return <CalloutBlockRenderer data={block.data} />;
    case 'details':
      return <DetailsBlockRenderer data={block.data} />;
    case 'stats':
      return <StatsBlockRenderer data={block.data} />;
    case 'timeline':
      return <TimelineBlockRenderer data={block.data} />;
    case 'list':
      return <ListBlockRenderer data={block.data} />;
    case 'image':
      return <ImageBlockRenderer data={block.data} />;
    case 'gallery':
      return <GalleryBlockRenderer data={block.data} />;
    case 'video':
      return <VideoBlockRenderer data={block.data} />;
    case 'embed':
      return <EmbedBlockRenderer data={block.data} />;
    case 'buttons':
      return <ButtonsBlockRenderer data={block.data} />;
    case 'links':
      return <LinksBlockRenderer data={block.data} />;
    case 'download':
      return <DownloadBlockRenderer data={block.data} />;
    case 'social':
      return <SocialBlockRenderer data={block.data} />;
    case 'case-study':
      return <CaseStudyBlockRenderer data={block.data} />;
    case 'before-after':
      return <BeforeAfterBlockRenderer data={block.data} />;
    case 'logos':
      return <LogosBlockRenderer data={block.data} />;
    case 'testimonial':
      return <TestimonialBlockRenderer data={block.data} />;
    case 'product':
      return <ProductBlockRenderer data={block.data} />;
    case 'book':
      return <BookBlockRenderer data={block.data} />;
    case 'award':
      return <AwardBlockRenderer data={block.data} />;
    case 'press':
      return <PressBlockRenderer data={block.data} />;
    case 'table':
      return <TableBlockRenderer data={block.data} />;
    case 'audio':
      return <AudioBlockRenderer data={block.data} />;
    case 'carousel':
      return <CarouselBlockRenderer data={block.data} />;
    case 'product-grid':
      return <ProductGrid />;
    case 'spreadsheet':
      return <SpreadsheetTable />;
    default:
      return (
        <div className="px-5 py-3 text-[13px] text-[var(--text-tertiary)]">
          Unknown block type: {block.type}
        </div>
      );
  }
}
