'use client';

import { ImageUpload } from '@/components/ui';

interface ProductItem {
  image: string;
  name: string;
  description: string;
  url: string;
  status?: 'active' | 'acquired' | 'shutdown';
  metrics?: string;
}

interface ProductBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  onUpload: (file: File) => Promise<string>;
}

export default function ProductBlockEditor({ data, onChange, onUpload }: ProductBlockEditorProps) {
  const products = (data.products as ProductItem[]) || [];

  const addProduct = () => {
    onChange({ ...data, products: [...products, { image: '', name: '', description: '', url: '', status: 'active' }] });
  };

  const updateProduct = (index: number, field: keyof ProductItem, value: string) => {
    const newProducts = products.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    onChange({ ...data, products: newProducts });
  };

  const removeProduct = (index: number) => {
    onChange({ ...data, products: products.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      {products.map((product, index) => (
        <div key={index} className="p-3 rounded-lg space-y-2" style={{ background: 'var(--bg-glass)' }}>
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
              Product {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeProduct(index)}
              className="text-[12px]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Remove
            </button>
          </div>
          <div className="flex gap-3">
            <ImageUpload
              value={product.image}
              onChange={(url) => updateProduct(index, 'image', url)}
              onUpload={onUpload}
              aspectRatio="square"
              className="w-16"
            />
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={product.name}
                onChange={(e) => updateProduct(index, 'name', e.target.value)}
                placeholder="Product name"
                className="w-full px-3 py-1.5 rounded text-[13px]"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                }}
              />
              <input
                type="text"
                value={product.description}
                onChange={(e) => updateProduct(index, 'description', e.target.value)}
                placeholder="Short description"
                className="w-full px-3 py-1.5 rounded text-[13px]"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>
          <input
            type="url"
            value={product.url}
            onChange={(e) => updateProduct(index, 'url', e.target.value)}
            placeholder="Product URL"
            className="w-full px-3 py-1.5 rounded text-[13px]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          />
          <div className="flex gap-2">
            {(['active', 'acquired', 'shutdown'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => updateProduct(index, 'status', status)}
                className="flex-1 py-1 rounded text-[11px] font-medium capitalize transition-colors"
                style={{
                  background: product.status === status ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                  color: product.status === status ? 'white' : 'var(--text-secondary)',
                }}
              >
                {status}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={product.metrics || ''}
            onChange={(e) => updateProduct(index, 'metrics', e.target.value)}
            placeholder="Metrics (e.g., 10k users)"
            className="w-full px-3 py-1.5 rounded text-[13px]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addProduct}
        className="w-full py-2 rounded-lg text-[12px] font-medium"
        style={{
          background: 'var(--bg-glass)',
          color: 'var(--accent-primary)',
          border: '1px dashed var(--border-medium)',
        }}
      >
        + Add product
      </button>
    </div>
  );
}
