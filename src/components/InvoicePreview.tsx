import { useRef } from "react";
import type { InvoiceData } from "../types";

interface Props {
  invoice: InvoiceData;
}

export function InvoicePreview({ invoice }: Props) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const total = invoice.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
  const remaining = total - invoice.paid;

  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    const html2pdf = (await import("html2pdf.js")).default;

    const opt = {
      margin: 0,
      filename: `Invoice-${invoice.invoiceNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" as const },
    } as const;

    html2pdf().set(opt).from(element).save();
  };

  const accentColor = invoice.accentColor || "#1a6dff";

  return (
    <div className="preview-wrapper">
      <div className="preview-actions">
        <button
          type="button"
          className="btn-download"
          style={{ backgroundColor: accentColor }}
          onClick={handleDownloadPDF}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PDF
        </button>
      </div>

      <div className="invoice-paper" ref={invoiceRef}>
        {/* Header */}
        <div className="inv-header">
          <div className="inv-header-left">
            <h1 className="inv-title" style={{ color: accentColor }}>
              Invoice
            </h1>
            <p className="inv-company">{invoice.companyName}</p>
          </div>
          {invoice.logo && (
            <div className="inv-header-right">
              <img src={invoice.logo} alt="Company Logo" className="inv-logo" />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="inv-divider" style={{ backgroundColor: accentColor }} />

        {/* Website */}
        <div className="inv-website">
          <span style={{ color: accentColor }}>{invoice.website}</span>
        </div>

        {/* Billing Info */}
        <div className="inv-billing" style={{ backgroundColor: accentColor }}>
          <div className="inv-billing-left">
            <p>
              <strong>BILLED TO: {invoice.billedTo}</strong>
            </p>
            <p>Address: {invoice.address}</p>
          </div>
          <div className="inv-billing-right">
            <p>Invoice # {invoice.invoiceNumber}</p>
            <p>Invoice Date: {invoice.invoiceDate}</p>
          </div>
        </div>

        {/* Items Table */}
        <table
          className="inv-table"
          style={{ border: `1px solid ${accentColor}`, "--table-accent": accentColor } as React.CSSProperties}
        >
          <thead>
            <tr style={{ backgroundColor: accentColor }}>
              <th className="col-desc">Description</th>
              <th className="col-qty">Quantity</th>
              <th className="col-price">Price</th>
              <th className="col-total">Total (USD)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="col-desc">{item.description}</td>
                <td className="col-qty">{item.quantity}</td>
                <td className="col-price">{item.price}</td>
                <td className="col-total">${parseFloat(item.total) || 0}</td>
              </tr>
            ))}
            {/* Empty rows to fill space */}
            {invoice.items.length < 5 &&
              Array.from({ length: 5 - invoice.items.length }).map((_, i) => (
                <tr key={`empty-${i}`} className="empty-row">
                  <td className="col-desc">&nbsp;</td>
                  <td className="col-qty">&nbsp;</td>
                  <td className="col-price">&nbsp;</td>
                  <td className="col-total">&nbsp;</td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="inv-summary">
          <div className="inv-summary-row">
            <span className="inv-summary-label">
              <strong>Total</strong>
            </span>
            <span className="inv-summary-value">: ${total}</span>
          </div>
          <div className="inv-summary-row">
            <span className="inv-summary-label">
              <strong>Paid</strong>
            </span>
            <span className="inv-summary-value">: ${invoice.paid}</span>
          </div>
          <div className="inv-summary-row remaining" style={{ color: accentColor }}>
            <span className="inv-summary-label">
              <strong>Remaining</strong>
            </span>
            <span className="inv-summary-value">: ${remaining}</span>
          </div>
          <div className="inv-summary-row">
            <span className="inv-summary-label">
              <strong>Payment method:</strong>
            </span>
            <span className="inv-summary-value">{invoice.paymentMethod}</span>
          </div>
        </div>

        {/* Terms */}
        <div className="inv-terms">
          <p className="inv-terms-title">
            <strong>Terms and Conditions:</strong>
          </p>
          <ol>
            {invoice.termsAndConditions.map((term, i) => (
              <li key={i}>{term}</li>
            ))}
          </ol>
        </div>

        {/* Footer */}
        <div className="inv-footer" style={{ borderTopColor: accentColor }}>
          <p style={{ color: accentColor }}>
            <strong>{invoice.footerMessage}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
