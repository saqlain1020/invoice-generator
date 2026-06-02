# Invoice Generator

A professional invoice generator built for **KickOff Media**. Create, customize, preview, and export invoices (or quotations/receipts/estimates) as PDF — all from the browser.

## Tech Stack

- **React 19** + **TypeScript 6** (with React Compiler via Babel plugin)
- **Vite 8** (dev server & build)
- **Bun** as the package manager (`bun.lock`)
- **html2pdf.js** for client-side PDF export
- Pure CSS (no Tailwind / CSS-in-JS) — all styles in `src/App.css` and `src/index.css`

## Getting Started

```bash
bun install
bun run dev       # http://localhost:5173
bun run build     # production build
bun run preview   # preview production build
```

## Project Structure

```
src/
├── main.tsx                        # App entry point, renders <App />
├── App.tsx                         # Root component — tab switching, default invoice data
├── App.css                         # All application styles (form, preview, presets, responsive)
├── index.css                       # Global resets and body styles
├── types.ts                        # TypeScript interfaces (InvoiceItem, InvoiceData, InvoicePreset)
├── assets/
│   └── logos/
│       └── kickoff.jpg             # Pre-bundled logo (auto-discovered by InvoiceForm)
└── components/
    ├── InvoiceForm.tsx             # Edit form — all invoice fields, logo gallery, color picker
    ├── InvoicePreview.tsx          # Live preview + PDF download
    └── PresetsManager.tsx          # Save/load/delete/export/import presets (localStorage)
```

## Features

### Document Types
The document title can be switched between **Invoice**, **Quotation**, **Receipt**, **Estimate**, or a **custom** free-text title. The title appears as the large header on the generated document and also affects the exported PDF filename (`{Title}-{Number}.pdf`).

### Branding
- **Company name** and **website URL** shown on the invoice header
- **Logo selector**: logos placed in `src/assets/logos/` are auto-discovered via `import.meta.glob` and shown as clickable thumbnails. Users can also upload a custom logo from their device. The selected logo appears in the top-right of the invoice.
- **Accent color**: a color picker + hex input + 8 preset swatches (`#1f96e0` default). The accent color controls the invoice title, divider line, website URL, billing block background, table header & borders, remaining balance, footer divider, footer text, and the Download PDF button.

### Invoice Fields
- **Billed To** / **Address** — client info block
- **Invoice #** / **Invoice Date** — document identifiers
- **Line Items** — dynamic rows, each with description, quantity, price, and total. Total auto-calculates from qty × price unless qty or price is `-` (for manual override like opening balances). Items can be added/removed freely.
- **Amount Paid** / **Payment Method** — payment tracking; remaining balance is auto-calculated (Total - Paid)
- **Terms & Conditions** — dynamic numbered list, add/remove individual terms
- **Footer Message** — customizable closing text

### Invoice Preview
The Preview & Export tab renders a pixel-accurate invoice that matches the original KickOff Media design:
- Header: italic document title (colored) + company name + logo
- Colored divider bar
- Website URL (right-aligned, accent-colored)
- Billing info block (full-width, accent-colored background, top corners rounded, no bottom radius — flows into table)
- Items table with accent-colored header, outer border, and bottom border
- Empty placeholder rows fill to minimum 5 rows
- Summary: Total / Paid / Remaining (accent-colored) / Payment method
- Numbered terms & conditions
- Footer with accent-colored divider and italic message

### PDF Export
Click **Download PDF** to generate and save a high-quality A4 PDF using `html2pdf.js` (html2canvas + jsPDF under the hood). The PDF is rendered at 2x scale for crisp output.

### Presets System
The **Presets** section (at the bottom of the Edit form) lets you:
- **Save Current as Preset** — name and store the entire current invoice configuration (all fields, items, logo, color, terms, etc.) in `localStorage` under the key `invoice-generator-presets`
- **Load** a preset — instantly applies all saved values to the form
- **Delete** a preset — click once to arm, click again within 3 seconds to confirm
- **Export** a single preset as a `.preset.json` file
- **Export All** presets as one `invoice-presets.json` file
- **Import** a `.preset.json` file (supports both single preset and array of presets)

Presets persist across browser sessions. Exported files can be shared between machines or team members.

## Data Model

### `InvoiceData` (src/types.ts)
| Field                | Type              | Description                                      |
|----------------------|-------------------|--------------------------------------------------|
| `documentTitle`      | `string`          | "Invoice", "Quotation", "Receipt", "Estimate", or custom |
| `companyName`        | `string`          | Company name shown in header                     |
| `website`            | `string`          | Website URL shown below divider                  |
| `billedTo`           | `string`          | Client name                                      |
| `address`            | `string`          | Client address                                   |
| `invoiceNumber`      | `string`          | Document number                                  |
| `invoiceDate`        | `string`          | Document date (free text)                        |
| `items`              | `InvoiceItem[]`   | Line items array                                 |
| `paid`               | `number`          | Amount already paid                              |
| `paymentMethod`      | `string`          | e.g. "Bank/Cash"                                 |
| `termsAndConditions` | `string[]`        | Array of term strings                            |
| `footerMessage`      | `string`          | Closing message                                  |
| `logo`               | `string \| null`  | Data URL or asset URL of the logo                |
| `accentColor`        | `string`          | Hex color code (default `#1f96e0`)               |

### `InvoiceItem`
| Field         | Type     | Description                                    |
|---------------|----------|------------------------------------------------|
| `id`          | `string` | UUID                                           |
| `description` | `string` | Item description                               |
| `quantity`    | `string` | Quantity (use `-` for manual-total items)       |
| `price`       | `string` | Unit price (use `-` for manual-total items)     |
| `total`       | `string` | Line total (auto-calculated or manual)          |

### `InvoicePreset`
| Field       | Type          | Description                      |
|-------------|---------------|----------------------------------|
| `id`        | `string`      | UUID                             |
| `name`      | `string`      | User-provided preset name        |
| `createdAt` | `number`      | Unix timestamp (ms)              |
| `data`      | `InvoiceData` | Full snapshot of invoice state   |

## Adding New Logos

Drop image files into `src/assets/logos/`. They are automatically picked up by Vite's `import.meta.glob` in `InvoiceForm.tsx` and appear as selectable thumbnails in the Logo gallery — no code changes needed.

## Default Configuration

The app ships with sample data for KickOff Media (see `defaultInvoice` in `App.tsx`):
- Company: KickOff Media / https://kickoffmedia.co
- Default accent color: `#1f96e0`
- Sample items: Opening Balance ($320) + Website Development ($600)
- Payment method: Bank/Cash
- Term: "Payment is due upon receipt."

## Key Implementation Notes

- **No routing** — the app uses a simple tab toggle (`form` / `preview`) controlled by React state in `App.tsx`.
- **Logo storage** — uploaded logos are stored as base64 data URLs in state (and in presets). Bundled logos from `src/assets/logos/` use Vite asset URLs.
- **Auto-total calculation** — when quantity or price changes and neither is `-`, total = qty × price. When either is `-`, the total field remains manually editable (useful for entries like "Opening Balance").
- **Accent color propagation** — all accent-colored elements use inline `style` props driven by `invoice.accentColor`. The table's bottom border uses a CSS custom property `--table-accent` set via inline style.
- **PDF generation** — `html2pdf.js` is dynamically imported only when the user clicks Download, keeping the initial bundle small.
- **Presets localStorage key** — `invoice-generator-presets` (array of `InvoicePreset` objects serialized as JSON).
