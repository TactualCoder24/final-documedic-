import { Invoice } from '../types';

export const generateInvoicePdf = async (invoice: Invoice, doctorName: string, doctorSpecialty?: string): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  let y = 20;
  const lh = 7;

  doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 64, 175);
  doc.text('DocuMedic — Invoice', 14, y); y += 8;

  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 30, 30);
  doc.text(`Dr. ${doctorName}`, 14, y);
  if (doctorSpecialty) {
    doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100); doc.setFontSize(9);
    doc.text(doctorSpecialty, 14, y + 5);
  }
  y += 12;

  doc.setDrawColor(220, 220, 220);
  doc.line(14, y, 196, y); y += 7;

  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 30, 30);
  doc.text('Bill To:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.patientName || 'Patient', 35, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 150, y);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(invoice.issuedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 165, y);
  y += lh;

  if (invoice.dueDate) {
    doc.setFont('helvetica', 'bold');
    doc.text('Due Date:', 150, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 172, y);
    y += lh;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Status:', 150, y);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.status.toUpperCase(), 167, y);
  y += lh + 4;

  // Line items table header
  doc.setFillColor(240, 245, 255);
  doc.rect(10, y - 5, 186, 9, 'F');
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 64, 175);
  doc.text('Description', 14, y);
  doc.text('Qty', 130, y);
  doc.text('Unit Price', 150, y);
  doc.text('Amount', 178, y);
  y += lh + 1;

  doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30); doc.setFontSize(10);
  invoice.items.forEach(item => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(item.description, 14, y);
    doc.text(String(item.quantity), 130, y);
    doc.text(item.unitPrice.toFixed(2), 150, y);
    doc.text((item.quantity * item.unitPrice).toFixed(2), 178, y);
    y += lh - 1;
  });

  y += 3;
  doc.setDrawColor(220, 220, 220);
  doc.line(120, y, 196, y); y += lh;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
  doc.text('Total:', 150, y);
  doc.text(invoice.total.toFixed(2), 178, y);
  y += lh + 4;

  if (invoice.notes) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(30, 64, 175);
    doc.text('Notes', 14, y); y += lh;
    doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
    const noteLines = doc.splitTextToSize(invoice.notes, 180);
    doc.text(noteLines, 14, y); y += noteLines.length * (lh - 2);
  }

  doc.setFontSize(8); doc.setTextColor(150, 150, 150);
  doc.text('Generated via DocuMedic.', 14, 290);

  doc.save(`Invoice_${(invoice.patientName || 'Patient').replace(/\s+/g, '_')}_${invoice.issuedDate}.pdf`);
};
