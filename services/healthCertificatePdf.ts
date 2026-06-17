import { Profile, Allergy, Immunization } from '../types';

interface HealthCertificateOptions {
    profile: Profile;
    allergies: Allergy[];
    immunizations: Immunization[];
    emergencyUrl: string;
}

const SEVERITY_COLOR: Record<string, [number, number, number]> = {
    Severe: [220, 38, 38],
    Moderate: [234, 88, 12],
    Mild: [202, 138, 4],
};

export const generateHealthCertificatePdf = async (opts: HealthCertificateOptions): Promise<void> => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210;
    let y = 0;

    const section = (title: string, color: [number, number, number] = [30, 64, 175]) => {
        doc.setFillColor(...color);
        doc.rect(0, y, W, 9, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(title, 14, y + 6.2);
        y += 13;
        doc.setTextColor(30, 30, 30);
    };

    const row = (label: string, value: string, indent = 14) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(label, indent, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(20, 20, 20);
        doc.text(value || '—', indent + 42, y);
        y += 6;
    };

    // ── Cover header ─────────────────────────────────────────────────────────
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, W, 30, 'F');
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('DocuMedic — Health Certificate', 14, 13);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 22);
    doc.text('This document is for informational purposes. Not a substitute for medical advice.', 14, 27);
    y = 36;

    // ── Personal Info ─────────────────────────────────────────────────────────
    section('PERSONAL INFORMATION');
    row('Full Name:', opts.profile.name || '');
    row('Age:', opts.profile.age || '');
    row('Blood Type:', opts.profile.bloodType || '');
    row('Known Conditions:', opts.profile.conditions || 'None reported');
    y += 3;

    // ── Emergency Contact ─────────────────────────────────────────────────────
    section('EMERGENCY CONTACT', [15, 118, 110]);
    row('Contact Name:', opts.profile.emergencyContactName || '');
    row('Contact Phone:', opts.profile.emergencyContactPhone || '');
    y += 3;

    // ── Allergies ─────────────────────────────────────────────────────────────
    section('ALLERGIES & ADVERSE REACTIONS', [185, 28, 28]);
    if (opts.allergies.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('No known allergies recorded.', 14, y);
        y += 8;
    } else {
        opts.allergies.forEach(a => {
            const col = SEVERITY_COLOR[a.severity] || [80, 80, 80];
            doc.setFillColor(...col);
            doc.roundedRect(10, y - 4, W - 20, 7, 1.5, 1.5, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(`${a.name}`, 14, y);
            doc.setFont('helvetica', 'normal');
            doc.text(`  ·  ${a.severity}  ·  Reaction: ${a.reaction || 'Not specified'}`, 14 + doc.getTextWidth(a.name), y);
            y += 9;
        });
    }
    y += 3;

    // ── Vaccinations ─────────────────────────────────────────────────────────
    section('VACCINATION & IMMUNIZATION HISTORY', [5, 150, 105]);
    if (opts.immunizations.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('No immunization records found.', 14, y);
        y += 8;
    } else {
        // Table header
        doc.setFillColor(240, 253, 244);
        doc.rect(10, y - 4, W - 20, 7, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105);
        doc.text('Vaccine / Immunization', 14, y);
        doc.text('Date', 110, y);
        doc.text('Provider', 150, y);
        y += 7;
        doc.setDrawColor(200, 240, 220);
        doc.line(10, y - 2, W - 10, y - 2);

        opts.immunizations.forEach((imm, i) => {
            if (i % 2 === 0) {
                doc.setFillColor(248, 255, 252);
                doc.rect(10, y - 4, W - 20, 7, 'F');
            }
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(20, 20, 20);
            doc.setFontSize(8.5);
            doc.text(imm.name || '—', 14, y, { maxWidth: 90 });
            doc.text(imm.date ? new Date(imm.date).toLocaleDateString('en-IN') : '—', 110, y);
            doc.text(imm.provider || '—', 150, y, { maxWidth: 50 });
            y += 7;

            if (y > 260) {
                doc.addPage();
                y = 20;
            }
        });
    }
    y += 6;

    // ── QR Code ──────────────────────────────────────────────────────────────
    if (y > 230) { doc.addPage(); y = 20; }

    section('EMERGENCY QR CODE', [79, 70, 229]);
    try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(opts.emergencyUrl)}`;
        const res = await fetch(qrUrl);
        const blob = await res.blob();
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
            reader.onload = () => {
                try {
                    doc.addImage(reader.result as string, 'PNG', W / 2 - 20, y, 40, 40);
                } catch {}
                resolve();
            };
            reader.readAsDataURL(blob);
        });
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('Scan for emergency health info', W / 2, y + 44, { align: 'center' });
        y += 50;
    } catch {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(opts.emergencyUrl, 14, y);
        y += 10;
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(180, 180, 180);
        doc.text(`DocuMedic Health Certificate  •  Page ${i} of ${pageCount}  •  documedic.in`, W / 2, 292, { align: 'center' });
    }

    const safeName = (opts.profile.name || 'patient').replace(/\s+/g, '_');
    doc.save(`${safeName}_health_certificate_${new Date().toISOString().slice(0, 10)}.pdf`);
};
