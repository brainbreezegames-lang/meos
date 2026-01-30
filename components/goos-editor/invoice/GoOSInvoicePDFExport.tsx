'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from '@react-pdf/renderer';
import type { InvoiceContent, InvoiceLineItem } from '@/lib/validations/goos';

// Register custom fonts from Google Fonts
// Using direct download URLs from Google Fonts API
// Averia Serif Libre - for headings (serif, matches screen design)
Font.register({
  family: 'Averia Serif Libre',
  fonts: [
    {
      src: '/fonts/AveriaSerifLibre-Regular.ttf',
      fontWeight: 400,
    },
    {
      src: '/fonts/AveriaSerifLibre-Bold.ttf',
      fontWeight: 700,
    },
  ],
});

// Instrument Sans - for body text (sans-serif, matches screen design)
Font.register({
  family: 'Instrument Sans',
  fonts: [
    {
      src: '/fonts/InstrumentSans-Regular.ttf',
      fontWeight: 400,
    },
    {
      src: '/fonts/InstrumentSans-Medium.ttf',
      fontWeight: 500,
    },
    {
      src: '/fonts/InstrumentSans-SemiBold.ttf',
      fontWeight: 600,
    },
  ],
});

// Disable hyphenation for cleaner text
Font.registerHyphenationCallback((word) => [word]);

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

// PDF Styles matching the screen design
const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
    fontFamily: 'Instrument Sans',
    fontSize: 11,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 18,
  },
  headerTitle: {
    fontFamily: 'Averia Serif Libre',
    fontSize: 30,
    fontWeight: 700,
    color: '#1a1a1a',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  invoiceNumberBlock: {
    alignItems: 'flex-end',
  },
  invoiceNumberLabel: {
    fontFamily: 'Instrument Sans',
    fontSize: 8,
    fontWeight: 400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#666666',
    marginBottom: 2,
  },
  invoiceNumber: {
    fontFamily: 'Instrument Sans',
    fontSize: 13,
    fontWeight: 600,
    color: '#1a1a1a',
  },
  // Parties
  parties: {
    flexDirection: 'row',
    gap: 36,
    marginBottom: 24,
  },
  party: {
    flex: 1,
  },
  partyLabel: {
    fontFamily: 'Averia Serif Libre',
    fontSize: 8,
    fontWeight: 400,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#666666',
    marginBottom: 8,
  },
  partyName: {
    fontFamily: 'Instrument Sans',
    fontSize: 12,
    fontWeight: 600,
    color: '#1a1a1a',
    marginBottom: 3,
  },
  partyDetail: {
    fontFamily: 'Instrument Sans',
    fontSize: 10,
    fontWeight: 400,
    color: '#1a1a1a',
    marginBottom: 1,
    lineHeight: 1.5,
  },
  partyDetailMuted: {
    color: '#666666',
  },
  // Dates
  dates: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 24,
  },
  dateBlock: {
    flex: 1,
  },
  dateLabel: {
    fontFamily: 'Instrument Sans',
    fontSize: 8,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#666666',
    marginBottom: 3,
  },
  dateValue: {
    fontFamily: 'Instrument Sans',
    fontSize: 11,
    fontWeight: 500,
    color: '#1a1a1a',
  },
  // Table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontFamily: 'Instrument Sans',
    fontSize: 8,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#666666',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  tableCell: {
    fontFamily: 'Instrument Sans',
    fontSize: 10,
    fontWeight: 400,
    color: '#1a1a1a',
  },
  tableCellAmount: {
    fontWeight: 500,
  },
  colDescription: {
    flex: 1,
  },
  colQty: {
    width: 60,
    textAlign: 'center',
  },
  colUnitPrice: {
    width: 90,
    textAlign: 'right',
  },
  colAmount: {
    width: 90,
    textAlign: 'right',
  },
  // Totals
  totalsContainer: {
    alignItems: 'flex-end',
    marginTop: 16,
    marginBottom: 28,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 220,
    paddingVertical: 5,
  },
  totalLabel: {
    fontFamily: 'Instrument Sans',
    fontSize: 10,
    fontWeight: 400,
    color: '#666666',
  },
  totalValue: {
    fontFamily: 'Instrument Sans',
    fontSize: 10,
    fontWeight: 500,
    color: '#666666',
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 220,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 4,
  },
  grandTotalLabel: {
    fontFamily: 'Instrument Sans',
    fontSize: 14,
    fontWeight: 700,
    color: '#1a1a1a',
  },
  grandTotalValue: {
    fontFamily: 'Instrument Sans',
    fontSize: 14,
    fontWeight: 700,
    color: '#1a1a1a',
    textAlign: 'right',
  },
  // Notes
  notesSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#f0f0f0',
  },
  notesLabel: {
    fontFamily: 'Averia Serif Libre',
    fontSize: 8,
    fontWeight: 400,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#666666',
    marginBottom: 6,
  },
  notesText: {
    fontFamily: 'Instrument Sans',
    fontSize: 10,
    fontWeight: 400,
    color: '#666666',
    lineHeight: 1.6,
  },
});

// Line item row for PDF
function PDFLineItemRow({ item, currency }: { item: InvoiceLineItem; currency: string }) {
  const amount = item.quantity * item.unitPrice;
  return (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.colDescription]}>{item.description}</Text>
      <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
      <Text style={[styles.tableCell, styles.colUnitPrice]}>{formatCurrency(item.unitPrice, currency)}</Text>
      <Text style={[styles.tableCell, styles.tableCellAmount, styles.colAmount]}>{formatCurrency(amount, currency)}</Text>
    </View>
  );
}

// The PDF Document component
function InvoiceDocument({ content }: { content: InvoiceContent }) {
  const subtotal = content.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxAmount = subtotal * (content.taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>INVOICE</Text>
          <View style={styles.invoiceNumberBlock}>
            <Text style={styles.invoiceNumberLabel}>Invoice No.</Text>
            <Text style={styles.invoiceNumber}>{content.invoiceNumber}</Text>
          </View>
        </View>

        {/* From / Bill To */}
        <View style={styles.parties}>
          {/* From */}
          <View style={styles.party}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>{content.from.name}</Text>
            {content.from.address && (
              <Text style={styles.partyDetail}>{content.from.address}</Text>
            )}
            {content.from.city && (
              <Text style={styles.partyDetail}>{content.from.city}</Text>
            )}
            {content.from.country && (
              <Text style={styles.partyDetail}>{content.from.country}</Text>
            )}
            {content.from.email && (
              <Text style={[styles.partyDetail, styles.partyDetailMuted]}>{content.from.email}</Text>
            )}
            {content.from.phone && (
              <Text style={[styles.partyDetail, styles.partyDetailMuted]}>{content.from.phone}</Text>
            )}
            {content.from.website && (
              <Text style={[styles.partyDetail, styles.partyDetailMuted]}>{content.from.website}</Text>
            )}
          </View>

          {/* Bill To */}
          <View style={styles.party}>
            <Text style={styles.partyLabel}>Bill To</Text>
            <Text style={styles.partyName}>{content.to.name}</Text>
            {content.to.company && (
              <Text style={styles.partyDetail}>{content.to.company}</Text>
            )}
            {content.to.address && (
              <Text style={styles.partyDetail}>{content.to.address}</Text>
            )}
            {content.to.city && (
              <Text style={styles.partyDetail}>{content.to.city}</Text>
            )}
            {content.to.country && (
              <Text style={styles.partyDetail}>{content.to.country}</Text>
            )}
            {content.to.email && (
              <Text style={[styles.partyDetail, styles.partyDetailMuted]}>{content.to.email}</Text>
            )}
          </View>
        </View>

        {/* Dates */}
        <View style={styles.dates}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Issue Date</Text>
            <Text style={styles.dateValue}>{content.issueDate}</Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Due Date</Text>
            <Text style={styles.dateValue}>{content.dueDate}</Text>
          </View>
          {content.paymentTerms && (
            <View style={styles.dateBlock}>
              <Text style={styles.dateLabel}>Payment Terms</Text>
              <Text style={styles.dateValue}>{content.paymentTerms}</Text>
            </View>
          )}
        </View>

        {/* Line Items Table */}
        <View>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colUnitPrice]}>Unit Price</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
          </View>

          {/* Table Rows */}
          {content.lineItems.map((item) => (
            <PDFLineItemRow key={item.id} item={item} currency={content.currency} />
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal, content.currency)}</Text>
          </View>
          {content.taxRate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({content.taxRate}%)</Text>
              <Text style={styles.totalValue}>{formatCurrency(taxAmount, content.currency)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(total, content.currency)}</Text>
          </View>
        </View>

        {/* Notes */}
        {content.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{content.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

// Export function - generates and downloads the PDF
export async function exportInvoiceToPDF(content: InvoiceContent, filename: string = 'Invoice'): Promise<void> {
  try {
    const blob = await pdf(<InvoiceDocument content={content} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename.replace(/[^a-z0-9]/gi, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw error;
  }
}

export default InvoiceDocument;
