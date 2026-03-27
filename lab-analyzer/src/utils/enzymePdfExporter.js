import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToEnzymePDF = async (data) => {
  const { title, researcher, rollNo, results, epsilon, pathLength, time, mmChartImage, lbChartImage } = data;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // --- HEADER SECTION ---
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(139, 92, 246); // Violet theme for Kinetics
  pdf.text((title || "Enzyme Kinetics Assay").toUpperCase(), 15, 20);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(71, 85, 105); 
  pdf.text(`Name: ${researcher}   |   Roll No: ${rollNo}`, 15, 28);
  
  pdf.setFontSize(10);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Department of Life Sciences, RKMRC Narendrapur`, 15, 34);

  // Line separator
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(226, 232, 240);
  pdf.line(15, 38, pageWidth - 15, 38);

  let currentY = 48;

  // --- RESULTS & CONSTANTS SECTION ---
  // Left Column: Results
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(71, 85, 105);
  pdf.text("KINETICS PARAMETERS", 15, currentY); 
  
  pdf.setFontSize(14);
  pdf.setTextColor(239, 68, 68); // Red
  pdf.text(`Vmax: ${results.vmax.toExponential(4)} mM/min`, 15, currentY + 8);
  
  pdf.setTextColor(16, 185, 129); // Green
  pdf.text(`Km: ${results.km.toFixed(4)} mM`, 15, currentY + 16);

  // Right Column: Constants
  pdf.setFontSize(12);
  pdf.setTextColor(71, 85, 105);
  pdf.text("ASSAY CONSTANTS", 120, currentY);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Extinction (Epsilon): ${epsilon} mM^-1 cm^-1`, 120, currentY + 8);
  pdf.text(`Path Length: ${pathLength} cm`, 120, currentY + 14);
  pdf.text(`Incubation: ${time} mins`, 120, currentY + 20);

  currentY += 35; // Move down below text

  // --- CHARTS SECTION ---
  // We make the charts slightly smaller (150mm wide) and center them so both fit on page 1
  const chartWidth = 150;
  const chartX = (pageWidth - chartWidth) / 2;

  if (mmChartImage) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(148, 163, 184);
    pdf.text("MICHAELIS-MENTEN PLOT", pageWidth/2, currentY, { align: 'center' });
    currentY += 4;

    const imgProps = pdf.getImageProperties(mmChartImage);
    const chartHeight = (imgProps.height * chartWidth) / imgProps.width;
    pdf.addImage(mmChartImage, 'PNG', chartX, currentY, chartWidth, chartHeight); 
    currentY += chartHeight + 15;
  }

  if (lbChartImage) {
    // Safety check: if chart goes off page, add new page
    if (currentY > 200) { pdf.addPage(); currentY = 20; }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(148, 163, 184);
    pdf.text("LINEWEAVER-BURK PLOT", pageWidth/2, currentY, { align: 'center' });
    currentY += 4;

    const imgProps = pdf.getImageProperties(lbChartImage);
    const chartHeight = (imgProps.height * chartWidth) / imgProps.width;
    pdf.addImage(lbChartImage, 'PNG', chartX, currentY, chartWidth, chartHeight); 
    currentY += chartHeight + 15;
  }

  // --- DATA TABLE SECTION ---
  const tableBody = results.data.map((row, index) => [
    `Sample ${(index + 1).toString().padStart(2, '0')}`,
    parseFloat(row.S).toFixed(2),
    parseFloat(row.OD).toFixed(3),
    parseFloat(row.V0).toExponential(3),
    parseFloat(row.invS).toFixed(3),
    parseFloat(row.invV0).toFixed(3)
  ]);

  autoTable(pdf, {
    startY: currentY,
    head: [['Tube #', '[S] (mM)', 'Absorbance', 'V0 (mM/min)', '1/[S]', '1/V0']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { halign: 'center', fontSize: 9 },
    columnStyles: { 0: { halign: 'left', fontStyle: 'bold', textColor: [139, 92, 246] } },
    margin: { left: 15, right: 15 }
  });

  // --- DOWNLOAD ---
  pdf.save(`${(title || "Kinetics").replace(/\s+/g, '_')}_Lab_Report.pdf`);
};