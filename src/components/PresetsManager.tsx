import { useState, useEffect, useRef } from 'react';
import type { InvoiceData, InvoicePreset } from '../types';

const STORAGE_KEY = 'invoice-generator-presets';

function loadPresets(): InvoicePreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePresetsToStorage(presets: InvoicePreset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

interface Props {
  invoice: InvoiceData;
  setInvoice: React.Dispatch<React.SetStateAction<InvoiceData>>;
}

export function PresetsManager({ invoice, setInvoice }: Props) {
  const [presets, setPresets] = useState<InvoicePreset[]>(loadPresets);
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    savePresetsToStorage(presets);
  }, [presets]);

  const handleSave = () => {
    const name = saveName.trim();
    if (!name) return;

    const preset: InvoicePreset = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      data: structuredClone(invoice),
    };

    setPresets((prev) => [preset, ...prev]);
    setSaveName('');
    setShowSaveInput(false);
  };

  const handleLoad = (preset: InvoicePreset) => {
    setInvoice(structuredClone(preset.data));
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      setPresets((prev) => prev.filter((p) => p.id !== id));
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const handleExport = (preset: InvoicePreset) => {
    const json = JSON.stringify(preset, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${preset.name.replace(/[^a-zA-Z0-9-_ ]/g, '')}.preset.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    if (!presets.length) return;
    const json = JSON.stringify(presets, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoice-presets.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);

        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (p: unknown): p is InvoicePreset =>
              typeof p === 'object' && p !== null && 'data' in p && 'name' in p
          );
          const withIds = valid.map((p) => ({
            ...p,
            id: crypto.randomUUID(),
          }));
          setPresets((prev) => [...withIds, ...prev]);
        } else if (parsed && typeof parsed === 'object' && 'data' in parsed && 'name' in parsed) {
          const preset: InvoicePreset = {
            ...parsed,
            id: crypto.randomUUID(),
          };
          setPresets((prev) => [preset, ...prev]);
        }
      } catch {
        alert('Invalid preset file.');
      }
    };
    reader.readAsText(file);
    if (importRef.current) importRef.current.value = '';
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section className="form-section presets-section">
      <h2 className="section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        Presets
      </h2>

      {/* Save / Import actions */}
      <div className="presets-actions">
        {showSaveInput ? (
          <div className="preset-save-row">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Preset name..."
              autoFocus
            />
            <button type="button" className="btn-preset-save" onClick={handleSave} disabled={!saveName.trim()}>
              Save
            </button>
            <button type="button" className="btn-preset-cancel" onClick={() => { setShowSaveInput(false); setSaveName(''); }}>
              Cancel
            </button>
          </div>
        ) : (
          <div className="presets-btn-row">
            <button type="button" className="btn-preset-action primary" onClick={() => setShowSaveInput(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Current as Preset
            </button>
            <button type="button" className="btn-preset-action" onClick={() => importRef.current?.click()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Import
            </button>
            {presets.length > 0 && (
              <button type="button" className="btn-preset-action" onClick={handleExportAll}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export All
              </button>
            )}
          </div>
        )}
        <input
          ref={importRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>

      {/* Preset list */}
      {presets.length > 0 ? (
        <div className="presets-list">
          {presets.map((preset) => (
            <div key={preset.id} className="preset-card">
              <div className="preset-info">
                <span className="preset-name">{preset.name}</span>
                <span className="preset-meta">
                  {preset.data.documentTitle} &middot; {preset.data.companyName} &middot; {formatDate(preset.createdAt)}
                </span>
              </div>
              <div className="preset-card-actions">
                <button type="button" className="btn-preset-load" onClick={() => handleLoad(preset)} title="Load preset">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  Load
                </button>
                <button type="button" className="btn-preset-export" onClick={() => handleExport(preset)} title="Export preset">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`btn-preset-delete ${confirmDeleteId === preset.id ? 'confirm' : ''}`}
                  onClick={() => handleDelete(preset.id)}
                  title={confirmDeleteId === preset.id ? 'Click again to confirm' : 'Delete preset'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="presets-empty">No saved presets yet. Save your current configuration to reuse it later.</p>
      )}
    </section>
  );
}
