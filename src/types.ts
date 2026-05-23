export interface InvoiceItem {
  id: string;
  description: string;
  quantity: string;
  price: string;
  total: string;
}

export interface InvoiceData {
  companyName: string;
  website: string;
  billedTo: string;
  address: string;
  invoiceNumber: string;
  invoiceDate: string;
  items: InvoiceItem[];
  paid: number;
  paymentMethod: string;
  termsAndConditions: string[];
  footerMessage: string;
  logo: string | null;
  accentColor: string;
}
