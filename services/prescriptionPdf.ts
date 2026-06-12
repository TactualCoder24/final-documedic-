import { Prescription } from '../types';

interface PrescriptionPdfOptions {
  prescription: Pick<Prescription, 'diagnosis' | 'diagnosisCodes' | 'medications' | 'notes' | 'advice' | 'followUpDate' | 'createdAt'>;
  doctorName: string;
  doctorSpecialty?: string;
  patientName: string;
  patientAge?: string;
}

export const generatePrescriptionPdf = async (options: PrescriptionPdfOptions): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const { prescription, doctorName, doctorSpecialty, patientName, patientAge } = options;

  let y = 20;
  const lh = 7;

  // Header
  doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 64, 175);
  doc.text('DocuMedic — Prescription', 14, y); y += 8;

  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 30, 30);
  doc.text(`Dr. ${doctorName}`, 14, y);
  if (doctorSpecialty) {
    doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100); doc.setFontSize(9);
    doc.text(doctorSpecialty, 14, y + 5);
  }
  y += 12;

  doc.setDrawColor(220, 220, 220);
  doc.line(14, y, 196, y); y += 7;

  // Patient info
  const dateStr = new Date(prescription.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 30, 30);
  doc.text('Patient:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${patientName}${patientAge ? `  (Age: ${patientAge})` : ''}`, 35, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 150, y);
  doc.setFont('helvetica', 'normal');
  doc.text(dateStr, 165, y);
  y += lh + 2;

  // Diagnosis
  if (prescription.diagnosis || (prescription.diagnosisCodes && prescription.diagnosisCodes.length > 0)) {
    doc.setFillColor(240, 245, 255);
    doc.rect(10, y - 5, 186, 9, 'F');
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 64, 175);
    doc.text('Diagnosis', 14, y); y += lh;
    doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30); doc.setFontSize(10);
    if (prescription.diagnosis) {
      doc.text(prescription.diagnosis, 14, y); y += lh - 1;
    }
    (prescription.diagnosisCodes || []).forEach(code => {
      doc.text(`${code.code} — ${code.description}`, 14, y); y += lh - 1;
    });
    y += 2;
  }

  // Rx symbol + medications
  doc.setFillColor(240, 245, 255);
  doc.rect(10, y - 5, 186, 9, 'F');
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 64, 175);
  doc.text('Rx', 14, y); y += lh + 1;

  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 100, 100);
  doc.text('Medication', 16, y);
  doc.text('Dosage', 90, y);
  doc.text('Frequency', 120, y);
  doc.text('Duration', 155, y);
  y += 5;
  doc.setDrawColor(230, 230, 230);
  doc.line(14, y - 3.5, 196, y - 3.5);

  doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30); doc.setFontSize(10);
  prescription.medications.forEach((med, idx) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.text(`${idx + 1}. ${med.name}`, 16, y);
    doc.setFont('helvetica', 'normal');
    doc.text(med.dosage || '—', 90, y);
    doc.text(med.frequency || '—', 120, y);
    doc.text(med.duration || '—', 155, y);
    y += lh - 2;
    if (med.instructions) {
      doc.setFontSize(8); doc.setTextColor(120, 120, 120);
      doc.text(`   ${med.instructions}`, 16, y);
      doc.setFontSize(10); doc.setTextColor(30, 30, 30);
      y += lh - 3;
    }
    y += 1;
  });

  y += 4;

  // Advice
  if (prescription.advice) {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFillColor(240, 245, 255);
    doc.rect(10, y - 5, 186, 9, 'F');
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 64, 175);
    doc.text('Advice', 14, y); y += lh;
    doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30); doc.setFontSize(10);
    const adviceLines = doc.splitTextToSize(prescription.advice, 180);
    doc.text(adviceLines, 14, y); y += adviceLines.length * (lh - 2) + 2;
  }

  // Notes
  if (prescription.notes) {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 64, 175);
    doc.text('Notes', 14, y); y += lh;
    doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30); doc.setFontSize(10);
    const noteLines = doc.splitTextToSize(prescription.notes, 180);
    doc.text(noteLines, 14, y); y += noteLines.length * (lh - 2) + 2;
  }

  // Follow-up
  if (prescription.followUpDate) {
    if (y > 265) { doc.addPage(); y = 20; }
    y += 2;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(30, 30, 30);
    doc.text('Follow-up:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(prescription.followUpDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 40, y);
    y += lh;
  }

  // Footer
  doc.setFontSize(8); doc.setTextColor(150, 150, 150);
  doc.text('Generated via DocuMedic. This prescription is digitally generated and intended for the named patient only.', 14, 290);

  doc.save(`Prescription_${patientName.replace(/\s+/g, '_')}_${new Date(prescription.createdAt).toISOString().split('T')[0]}.pdf`);
};
