'use client';

import React from 'react';
import type { InvoiceContent, InvoiceLineItem } from '@/lib/validations/goos';
import './invoice-styles.css';

interface GoOSInvoiceDocumentProps {
  content: InvoiceContent;
  isEditing?: boolean;
  editingField?: string | null;
  onFieldClick?: (field: string) => void;
  onFieldChange?: (field: string, value: string | number) => void;
  onFieldBlur?: () => void;
  onAddLineItem?: () => void;
  onDeleteLineItem?: (id: string) => void;
}

// Editable text component for inline editing
function EditableText({
  value,
  field,
  isEditing,
  editingField,
  onFieldClick,
  onFieldChange,
  onFieldBlur,
  className,
  multiline = false,
  placeholder = 'Click to edit...',
  type = 'text',
}: {
  value: string;
  field: string;
  isEditing?: boolean;
  editingField?: string | null;
  onFieldClick?: (field: string) => void;
  onFieldChange?: (field: string, value: string | number) => void;
  onFieldBlur?: () => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  type?: 'text' | 'number';
}) {
  const isActive = editingField === field;

  if (isEditing && isActive) {
    const baseClass = `invoice-editable-input ${className || ''}`;
    if (multiline) {
      return (
        <textarea
          autoFocus
          value={value}
          onChange={(e) => onFieldChange?.(field, e.target.value)}
          onBlur={onFieldBlur}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onFieldBlur?.();
          }}
          className={`${baseClass} invoice-editable-textarea`}
          placeholder={placeholder}
        />
      );
    }
    if (type === 'number') {
      return (
        <input
          autoFocus
          type="number"
          value={value}
          onChange={(e) => onFieldChange?.(field, parseFloat(e.target.value) || 0)}
          onBlur={onFieldBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') onFieldBlur?.();
          }}
          className={`${baseClass} invoice-editable-number`}
          placeholder={placeholder}
          step="any"
          min="0"
        />
      );
    }
    return (
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onFieldChange?.(field, e.target.value)}
        onBlur={onFieldBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') onFieldBlur?.();
        }}
        className={baseClass}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={() => isEditing && onFieldClick?.(field)}
      className={`invoice-editable-text ${isEditing ? 'invoice-editable-hover' : ''} ${className || ''}`}
    >
      {value || <span className="invoice-placeholder">{placeholder}</span>}
    </span>
  );
}

// Format currency amount
function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// Line item row component
function LineItemRow({
  item,
  index,
  currency,
  isEditing,
  editingField,
  onFieldClick,
  onFieldChange,
  onFieldBlur,
  onDelete,
}: {
  item: InvoiceLineItem;
  index: number;
  currency: string;
  isEditing?: boolean;
  editingField?: string | null;
  onFieldClick?: (field: string) => void;
  onFieldChange?: (field: string, value: string | number) => void;
  onFieldBlur?: () => void;
  onDelete?: () => void;
}) {
  const prefix = `lineItems.${index}`;
  const amount = item.quantity * item.unitPrice;

  return (
    <div className="invoice-table-row">
      {/* Description */}
      <div className="invoice-table-cell description">
        <EditableText
          value={item.description}
          field={`${prefix}.description`}
          isEditing={isEditing}
          editingField={editingField}
          onFieldClick={onFieldClick}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
          placeholder="Item description"
        />
      </div>

      {/* Quantity */}
      <div className="invoice-table-cell align-center">
        <EditableText
          value={String(item.quantity)}
          field={`${prefix}.quantity`}
          isEditing={isEditing}
          editingField={editingField}
          onFieldClick={onFieldClick}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
          placeholder="0"
          type="number"
        />
      </div>

      {/* Unit Price */}
      <div className="invoice-table-cell align-right">
        <EditableText
          value={String(item.unitPrice)}
          field={`${prefix}.unitPrice`}
          isEditing={isEditing}
          editingField={editingField}
          onFieldClick={onFieldClick}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
          placeholder="0.00"
          type="number"
        />
      </div>

      {/* Amount (calculated) */}
      <div className="invoice-table-cell align-right amount">
        {formatCurrency(amount, currency)}
      </div>

      {/* Delete button */}
      {isEditing && onDelete && (
        <button onClick={onDelete} className="invoice-delete-btn" title="Delete line item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Add button component
function AddButton({ onClick, label }: { onClick?: () => void; label: string }) {
  return (
    <button onClick={onClick} className="invoice-add-btn">
      <span className="invoice-add-btn-icon">+</span> {label}
    </button>
  );
}

export function GoOSInvoiceDocument({
  content,
  isEditing = false,
  editingField,
  onFieldClick,
  onFieldChange,
  onFieldBlur,
  onAddLineItem,
  onDeleteLineItem,
}: GoOSInvoiceDocumentProps) {
  // Auto-calculations
  const subtotal = content.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxAmount = subtotal * (content.taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="invoice-document">
      {/* Header - INVOICE title + invoice number */}
      <header className="invoice-header">
        <h1 className="invoice-title">INVOICE</h1>
        <div className="invoice-number">
          <span className="invoice-number-label">Invoice No.</span>
          <EditableText
            value={content.invoiceNumber}
            field="invoiceNumber"
            isEditing={isEditing}
            editingField={editingField}
            onFieldClick={onFieldClick}
            onFieldChange={onFieldChange}
            onFieldBlur={onFieldBlur}
            placeholder="INV-001"
          />
        </div>
      </header>

      {/* From / Bill To */}
      <div className="invoice-parties">
        {/* From */}
        <div className="invoice-party">
          <p className="invoice-party-label">From</p>
          <p className="invoice-party-name">
            <EditableText
              value={content.from.name}
              field="from.name"
              isEditing={isEditing}
              editingField={editingField}
              onFieldClick={onFieldClick}
              onFieldChange={onFieldChange}
              onFieldBlur={onFieldBlur}
              placeholder="Your Company Name"
            />
          </p>
          {(content.from.address || isEditing) && (
            <p className="invoice-party-detail">
              <EditableText
                value={content.from.address || ''}
                field="from.address"
                isEditing={isEditing}
                editingField={editingField}
                onFieldClick={onFieldClick}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
                placeholder="Address"
              />
            </p>
          )}
          {(content.from.city || isEditing) && (
            <p className="invoice-party-detail">
              <EditableText
                value={content.from.city || ''}
                field="from.city"
                isEditing={isEditing}
                editingField={editingField}
                onFieldClick={onFieldClick}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
                placeholder="City, State ZIP"
              />
            </p>
          )}
          {(content.from.country || isEditing) && (
            <p className="invoice-party-detail">
              <EditableText
                value={content.from.country || ''}
                field="from.country"
                isEditing={isEditing}
                editingField={editingField}
                onFieldClick={onFieldClick}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
                placeholder="Country"
              />
            </p>
          )}
          {(content.from.email || isEditing) && (
            <p className="invoice-party-detail invoice-party-detail-muted">
              <EditableText
                value={content.from.email || ''}
                field="from.email"
                isEditing={isEditing}
                editingField={editingField}
                onFieldClick={onFieldClick}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
                placeholder="email@company.com"
              />
            </p>
          )}
          {(content.from.phone || isEditing) && (
            <p className="invoice-party-detail invoice-party-detail-muted">
              <EditableText
                value={content.from.phone || ''}
                field="from.phone"
                isEditing={isEditing}
                editingField={editingField}
                onFieldClick={onFieldClick}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
                placeholder="Phone number"
              />
            </p>
          )}
          {(content.from.website || isEditing) && (
            <p className="invoice-party-detail invoice-party-detail-muted">
              <EditableText
                value={content.from.website || ''}
                field="from.website"
                isEditing={isEditing}
                editingField={editingField}
                onFieldClick={onFieldClick}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
                placeholder="Website URL"
              />
            </p>
          )}
        </div>

        {/* Bill To */}
        <div className="invoice-party">
          <p className="invoice-party-label">Bill To</p>
          <p className="invoice-party-name">
            <EditableText
              value={content.to.name}
              field="to.name"
              isEditing={isEditing}
              editingField={editingField}
              onFieldClick={onFieldClick}
              onFieldChange={onFieldChange}
              onFieldBlur={onFieldBlur}
              placeholder="Client Name"
            />
          </p>
          {(content.to.company || isEditing) && (
            <p className="invoice-party-detail">
              <EditableText
                value={content.to.company || ''}
                field="to.company"
                isEditing={isEditing}
                editingField={editingField}
                onFieldClick={onFieldClick}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
                placeholder="Client Company"
              />
            </p>
          )}
          {(content.to.address || isEditing) && (
            <p className="invoice-party-detail">
              <EditableText
                value={content.to.address || ''}
                field="to.address"
                isEditing={isEditing}
                editingField={editingField}
                onFieldClick={onFieldClick}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
                placeholder="Address"
              />
            </p>
          )}
          {(content.to.city || isEditing) && (
            <p className="invoice-party-detail">
              <EditableText
                value={content.to.city || ''}
                field="to.city"
                isEditing={isEditing}
                editingField={editingField}
                onFieldClick={onFieldClick}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
                placeholder="City, State ZIP"
              />
            </p>
          )}
          {(content.to.country || isEditing) && (
            <p className="invoice-party-detail">
              <EditableText
                value={content.to.country || ''}
                field="to.country"
                isEditing={isEditing}
                editingField={editingField}
                onFieldClick={onFieldClick}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
                placeholder="Country"
              />
            </p>
          )}
          {(content.to.email || isEditing) && (
            <p className="invoice-party-detail invoice-party-detail-muted">
              <EditableText
                value={content.to.email || ''}
                field="to.email"
                isEditing={isEditing}
                editingField={editingField}
                onFieldClick={onFieldClick}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
                placeholder="client@company.com"
              />
            </p>
          )}
        </div>
      </div>

      {/* Dates Row */}
      <div className="invoice-dates">
        <div className="invoice-date-block">
          <p className="invoice-date-label">Issue Date</p>
          <p className="invoice-date-value">
            <EditableText
              value={content.issueDate}
              field="issueDate"
              isEditing={isEditing}
              editingField={editingField}
              onFieldClick={onFieldClick}
              onFieldChange={onFieldChange}
              onFieldBlur={onFieldBlur}
              placeholder="YYYY-MM-DD"
            />
          </p>
        </div>
        <div className="invoice-date-block">
          <p className="invoice-date-label">Due Date</p>
          <p className="invoice-date-value">
            <EditableText
              value={content.dueDate}
              field="dueDate"
              isEditing={isEditing}
              editingField={editingField}
              onFieldClick={onFieldClick}
              onFieldChange={onFieldChange}
              onFieldBlur={onFieldBlur}
              placeholder="YYYY-MM-DD"
            />
          </p>
        </div>
        <div className="invoice-date-block">
          <p className="invoice-date-label">Payment Terms</p>
          <p className="invoice-date-value">
            <EditableText
              value={content.paymentTerms || ''}
              field="paymentTerms"
              isEditing={isEditing}
              editingField={editingField}
              onFieldClick={onFieldClick}
              onFieldChange={onFieldChange}
              onFieldBlur={onFieldBlur}
              placeholder="Net 30"
            />
          </p>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="invoice-table">
        {/* Table Header */}
        <div className="invoice-table-header">
          <div className="invoice-table-header-cell">Description</div>
          <div className="invoice-table-header-cell align-center">Qty</div>
          <div className="invoice-table-header-cell align-right">Unit Price</div>
          <div className="invoice-table-header-cell align-right">Amount</div>
        </div>

        {/* Table Rows */}
        {content.lineItems.map((item, index) => (
          <LineItemRow
            key={item.id}
            item={item}
            index={index}
            currency={content.currency}
            isEditing={isEditing}
            editingField={editingField}
            onFieldClick={onFieldClick}
            onFieldChange={onFieldChange}
            onFieldBlur={onFieldBlur}
            onDelete={isEditing ? () => onDeleteLineItem?.(item.id) : undefined}
          />
        ))}

        {/* Add line item button */}
        {isEditing && <AddButton onClick={onAddLineItem} label="Add Line Item" />}
      </div>

      {/* Totals */}
      <div className="invoice-totals">
        <div className="invoice-total-row subtotal">
          <span className="invoice-total-label">Subtotal</span>
          <span className="invoice-total-value">{formatCurrency(subtotal, content.currency)}</span>
        </div>
        <div className="invoice-total-row tax">
          <span className="invoice-total-label">
            Tax{' '}
            <span className="invoice-tax-rate">
              (
              <EditableText
                value={String(content.taxRate)}
                field="taxRate"
                isEditing={isEditing}
                editingField={editingField}
                onFieldClick={onFieldClick}
                onFieldChange={onFieldChange}
                onFieldBlur={onFieldBlur}
                placeholder="0"
                type="number"
              />
              %)
            </span>
          </span>
          <span className="invoice-total-value">{formatCurrency(taxAmount, content.currency)}</span>
        </div>
        <div className="invoice-total-row total">
          <span className="invoice-total-label">Total</span>
          <span className="invoice-total-value">{formatCurrency(total, content.currency)}</span>
        </div>
      </div>

      {/* Notes */}
      {(content.notes || isEditing) && (
        <div className="invoice-notes">
          <p className="invoice-notes-label">Notes</p>
          <div className="invoice-notes-text">
            <EditableText
              value={content.notes || ''}
              field="notes"
              isEditing={isEditing}
              editingField={editingField}
              onFieldClick={onFieldClick}
              onFieldChange={onFieldChange}
              onFieldBlur={onFieldBlur}
              multiline
              placeholder="Additional notes or payment instructions..."
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default GoOSInvoiceDocument;
