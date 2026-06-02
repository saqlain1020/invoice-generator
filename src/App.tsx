import { useState } from "react";
import { InvoiceForm } from "./components/InvoiceForm";
import { InvoicePreview } from "./components/InvoicePreview";
import type { InvoiceData } from "./types";
import "./App.css";

const defaultInvoice: InvoiceData = {
  documentTitle: "Invoice",
  companyName: "KickOff Media",
  website: "https://kickoffmedia.co",
  billedTo: "Merline",
  address: "Kirkland, Seattle.",
  invoiceNumber: "523",
  invoiceDate: "1 June 2026",
  items: [
    {
      id: crypto.randomUUID(),
      description: "Opening Balance (Previous Balance)",
      quantity: "-",
      price: "-",
      total: "320",
    },
    {
      id: crypto.randomUUID(),
      description: "Website Development & Designing",
      quantity: "2",
      price: "300",
      total: "600",
    },
  ],
  paid: 0,
  paymentMethod: "Bank/Cash",
  termsAndConditions: ["Payment is due upon receipt."],
  footerMessage: "Thank you for Trusting Kickoff Media.",
  logo: null,
  accentColor: "#1f96e0",
};

function App() {
  const [invoice, setInvoice] = useState<InvoiceData>(defaultInvoice);
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Invoice Generator</h1>
        <p>Create professional invoices in seconds</p>
      </header>

      <div className="tab-bar">
        <button
          type="button"
          className={`tab-btn ${activeTab === "form" ? "active" : ""}`}
          onClick={() => setActiveTab("form")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Invoice
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "preview" ? "active" : ""}`}
          onClick={() => setActiveTab("preview")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Preview & Export
        </button>
      </div>

      <main className="app-main">
        <div className={`panel ${activeTab === "form" ? "visible" : "hidden"}`}>
          <InvoiceForm invoice={invoice} setInvoice={setInvoice} />
        </div>
        <div className={`panel ${activeTab === "preview" ? "visible" : "hidden"}`}>
          <InvoicePreview invoice={invoice} />
        </div>
      </main>
    </div>
  );
}

export default App;
