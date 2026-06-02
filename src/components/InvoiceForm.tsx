import { useRef, useMemo } from 'react';
import type { InvoiceData, InvoiceItem } from '../types';
import { PresetsManager } from './PresetsManager';

const logoModules = import.meta.glob<string>('../assets/logos/*', {
  eager: true,
  import: 'default',
  query: '?url',
});

interface Props {
  invoice: InvoiceData;
  setInvoice: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

export function InvoiceForm({ invoice, setInvoice }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presetLogos = useMemo(() => {
    return Object.entries(logoModules).map(([path, url]) => ({
      name: path.split('/').pop() || 'logo',
      url,
    }));
  }, []);

  const updateField = <K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) => {
    setInvoice((prev) => ({ ...prev, [key]: value }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          const qty = parseFloat(updated.quantity) || 0;
          const price = parseFloat(updated.price) || 0;
          if (updated.quantity === '-' || updated.price === '-') {
            // leave total as manually entered
          } else {
            updated.total = (qty * price).toString();
          }
        }
        return updated;
      }),
    }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: '1',
      price: '0',
      total: '0',
    };
    setInvoice((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateField('logo', ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    updateField('logo', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateTerms = (index: number, value: string) => {
    setInvoice((prev) => {
      const terms = [...prev.termsAndConditions];
      terms[index] = value;
      return { ...prev, termsAndConditions: terms };
    });
  };

  const addTerm = () => {
    setInvoice((prev) => ({
      ...prev,
      termsAndConditions: [...prev.termsAndConditions, ''],
    }));
  };

  const removeTerm = (index: number) => {
    setInvoice((prev) => ({
      ...prev,
      termsAndConditions: prev.termsAndConditions.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="invoice-form">
      {/* Branding Section */}
      <section className="form-section">
        <h2 className="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Branding
        </h2>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label>Document Title</label>
          <div className="title-selector">
            {['Invoice', 'Quotation', 'Receipt', 'Estimate'].map((title) => (
              <button
                key={title}
                type="button"
                className={`title-chip ${invoice.documentTitle === title ? 'active' : ''}`}
                onClick={() => updateField('documentTitle', title)}
              >
                {title}
              </button>
            ))}
          </div>
          {!['Invoice', 'Quotation', 'Receipt', 'Estimate'].includes(invoice.documentTitle) && (
            <input
              type="text"
              value={invoice.documentTitle}
              onChange={(e) => updateField('documentTitle', e.target.value)}
              placeholder="Custom title"
              style={{ marginTop: '8px' }}
            />
          )}
          <button
            type="button"
            className={`title-chip custom ${!['Invoice', 'Quotation', 'Receipt', 'Estimate'].includes(invoice.documentTitle) ? 'active' : ''}`}
            onClick={() => updateField('documentTitle', '')}
            style={{ marginTop: '8px' }}
          >
            Custom...
          </button>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              value={invoice.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
              placeholder="Your Company Name"
            />
          </div>
          <div className="form-group">
            <label>Website</label>
            <input
              type="text"
              value={invoice.website}
              onChange={(e) => updateField('website', e.target.value)}
              placeholder="www.example.com"
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Logo</label>
            <div className="logo-selector">
              {presetLogos.length > 0 && (
                <div className="logo-gallery">
                  {presetLogos.map((logo) => (
                    <button
                      key={logo.name}
                      type="button"
                      className={`logo-gallery-item ${invoice.logo === logo.url ? 'active' : ''}`}
                      onClick={() => updateField('logo', logo.url)}
                      title={logo.name}
                    >
                      <img src={logo.url} alt={logo.name} />
                    </button>
                  ))}
                  <button
                    type="button"
                    className="logo-gallery-item upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload custom logo"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                </div>
              )}
              {!presetLogos.length && (
                <button type="button" className="btn-upload" onClick={() => fileInputRef.current?.click()}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload Logo
                </button>
              )}
              {invoice.logo && (
                <div className="logo-selected-row">
                  <img src={invoice.logo} alt="Selected logo" className="logo-thumb" />
                  <button type="button" className="btn-remove-logo" onClick={removeLogo}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Remove
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Accent Color</label>
            <div className="color-picker-row">
              <input
                type="color"
                value={invoice.accentColor}
                onChange={(e) => updateField('accentColor', e.target.value)}
                className="color-input"
              />
              <input
                type="text"
                value={invoice.accentColor}
                onChange={(e) => updateField('accentColor', e.target.value)}
                className="color-text"
                placeholder="#1a6dff"
              />
            </div>
            <div className="color-presets">
              {['#1f96e0', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#333333'].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch ${invoice.accentColor === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => updateField('accentColor', c)}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Client & Invoice Details */}
      <section className="form-section">
        <h2 className="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Client & {invoice.documentTitle || 'Document'} Details
        </h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Billed To</label>
            <input
              type="text"
              value={invoice.billedTo}
              onChange={(e) => updateField('billedTo', e.target.value)}
              placeholder="Client Name"
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={invoice.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Client Address"
            />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>{invoice.documentTitle || 'Document'} #</label>
            <input
              type="text"
              value={invoice.invoiceNumber}
              onChange={(e) => updateField('invoiceNumber', e.target.value)}
              placeholder="001"
            />
          </div>
          <div className="form-group">
            <label>{invoice.documentTitle || 'Document'} Date</label>
            <input
              type="text"
              value={invoice.invoiceDate}
              onChange={(e) => updateField('invoiceDate', e.target.value)}
              placeholder="1 June 2026"
            />
          </div>
        </div>
      </section>

      {/* Line Items */}
      <section className="form-section">
        <h2 className="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          Line Items
        </h2>

        {invoice.items.map((item, index) => (
          <div key={item.id} className="item-card">
            <div className="item-card-header">
              <span className="item-number">Item {index + 1}</span>
              {invoice.items.length > 1 && (
                <button type="button" className="btn-remove-item" onClick={() => removeItem(item.id)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Remove
                </button>
              )}
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                placeholder="Item description"
              />
            </div>
            <div className="item-numbers">
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="text"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                  placeholder="1"
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="text"
                  value={item.price}
                  onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Total</label>
                <input
                  type="text"
                  value={item.total}
                  onChange={(e) => updateItem(item.id, 'total', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        ))}

        <button type="button" className="btn-add-item" onClick={addItem}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Item
        </button>
      </section>

      {/* Payment Details */}
      <section className="form-section">
        <h2 className="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Payment Details
        </h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Amount Paid ($)</label>
            <input
              type="number"
              value={invoice.paid}
              onChange={(e) => updateField('paid', parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Payment Method</label>
            <input
              type="text"
              value={invoice.paymentMethod}
              onChange={(e) => updateField('paymentMethod', e.target.value)}
              placeholder="Bank/Cash"
            />
          </div>
        </div>
      </section>

      {/* Terms & Footer */}
      <section className="form-section">
        <h2 className="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Terms & Footer
        </h2>
        {invoice.termsAndConditions.map((term, index) => (
          <div key={index} className="term-row">
            <span className="term-number">{index + 1}.</span>
            <input
              type="text"
              value={term}
              onChange={(e) => updateTerms(index, e.target.value)}
              placeholder="Enter term..."
            />
            {invoice.termsAndConditions.length > 1 && (
              <button type="button" className="btn-remove-term" onClick={() => removeTerm(index)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn-add-term" onClick={addTerm}>
          + Add Term
        </button>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>Footer Message</label>
          <input
            type="text"
            value={invoice.footerMessage}
            onChange={(e) => updateField('footerMessage', e.target.value)}
            placeholder="Thank you for your business!"
          />
        </div>
      </section>

      <PresetsManager invoice={invoice} setInvoice={setInvoice} />
    </div>
  );
}
