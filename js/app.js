// ===============================
// GENERAZIONE PDF PROFESSIONALE V2
// ===============================

async function generatePDF() {

  if (!lastAnalysisData) return;

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let y = 25;

  // ================= HEADER =================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("RendimentoBB", margin, y);

  y += 8;

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text("Report Professionale di Valutazione Investimento B&B", margin, y);

  y += 12;

  pdf.setDrawColor(200);
  pdf.line(margin, y, pageWidth - margin, y);

  y += 12;

  // ================= EXECUTIVE BOX =================

  pdf.setFillColor(245, 247, 250);
  pdf.roundedRect(margin, y, pageWidth - margin * 2, 40, 3, 3, "F");

  let boxY = y + 8;

  pdf.setFont("helvetica", "bold");
  pdf.text("Executive Summary", margin + 5, boxY);

  boxY += 8;

  pdf.setFont("helvetica", "normal");

  pdf.text(`Valutazione: ${lastAnalysisData.statusText}`, margin + 5, boxY);
  boxY += 7;

  pdf.text(`ROI 5 anni: ${lastAnalysisData.roi5Years.toFixed(2)}%`, margin + 5, boxY);
  boxY += 7;

  pdf.text(`Break-even: ${lastAnalysisData.breakEvenYears ? lastAnalysisData.breakEvenYears.toFixed(1) : "-"} anni`, margin + 5, boxY);
  boxY += 7;

  pdf.text(`Margine operativo: ${lastAnalysisData.marginPercentage.toFixed(1)}%`, margin + 5, boxY);

  y += 55;

  // ================= DATI FINANZIARI =================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("Dati Finanziari Principali", margin, y);

  y += 10;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const financialLines = [
    `Fatturato annuo stimato: ${formatCurrency(lastAnalysisData.grossYearly)}`,
    `Utile netto annuo: ${formatCurrency(lastAnalysisData.netYearly)}`,
    `ROI annuo: ${lastAnalysisData.baseROI.toFixed(2)}%`,
    `Scenario pessimistico: ${formatCurrency(lastAnalysisData.stressedNet)}`
  ];

  financialLines.forEach(line => {
    pdf.text(line, margin, y);
    y += 8;
  });

  y += 5;

  // ================= DIAGNOSI =================

  pdf.setFont("helvetica", "bold");
  pdf.text("Diagnosi Professionale", margin, y);
  y += 8;

  pdf.setFont("helvetica", "normal");

  const splitDiagnosis = pdf.splitTextToSize(
    lastAnalysisData.diagnosis,
    pageWidth - margin * 2
  );

  pdf.text(splitDiagnosis, margin, y);

  y += splitDiagnosis.length * 6 + 15;

  // ================= FOOTER =================

  const today = new Date().toLocaleDateString("it-IT");

  pdf.setDrawColor(220);
  pdf.line(margin, 280, pageWidth - margin, 280);

  pdf.setFontSize(9);
  pdf.setTextColor(120);

  pdf.text(
    `Documento generato automaticamente il ${today}`,
    margin,
    287
  );

  pdf.text(
    "RendimentoBB - Analisi finanziaria professionale",
    pageWidth - margin,
    287,
    { align: "right" }
  );

  pdf.save("Report_RendimentoBB_Pro.pdf");
}
