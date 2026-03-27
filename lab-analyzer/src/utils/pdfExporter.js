import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = async (data) => {
  const { title, researcher, rollNo, results, rows, pathLength, chartImage } = data;

  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // --- HEADER SECTION ---
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(79, 70, 229); 
  pdf.text(title.toUpperCase(), 15, 20);

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
  pdf.line(15, 38, 195, 38);

  let currentY = 45;

  // --- CHART SECTION (FIXED ASPECT RATIO) ---
  if (chartImage) {
    // Read the actual dimensions of the snapshot
    const imgProps = pdf.getImageProperties(chartImage);
    const pdfWidth = 180; // Force width to fit page margins
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width; // Calculate true height
    
    pdf.addImage(chartImage, 'PNG', 15, currentY, pdfWidth, pdfHeight); 
    currentY += pdfHeight + 15; // Push the text down dynamically based on image height
  }

  // --- RESULTS SECTION (FIXED UNICODE TEXT) ---
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(71, 85, 105);
  pdf.text("CALCULATED MOLAR EXTINCTION (Epsilon)", 15, currentY); 
  currentY += 8;

  pdf.setFontSize(24);
  pdf.setTextColor(79, 70, 229);
  // Using standard ASCII for exponents to prevent font rendering errors
  pdf.text(`${results.epsilon.toExponential(4)} mM^-1 cm^-1`, 15, currentY);
  currentY += 12;

  // --- DERIVATION SECTION (FIXED UNICODE TEXT) ---
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(71, 85, 105);
  pdf.text("SCIENTIFIC DERIVATION", 15, currentY);
  currentY += 6;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Beer-Lambert Law: A = Epsilon * c * l`, 15, currentY); 
  currentY += 6;
  pdf.text(`Epsilon = Slope (m) / Path Length (l)`, 15, currentY);
  currentY += 6;
  pdf.text(`Slope: ${results.slope.toFixed(4)}   |   Path: ${pathLength} cm`, 15, currentY);
  currentY += 12;

  // --- DATA TABLE SECTION ---
  const tableBody = rows.map((row, index) => [
    `Sample ${(index + 1).toString().padStart(2, '0')}`,
    parseFloat(row.conc).toFixed(2),
    parseFloat(row.abs).toFixed(3)
  ]);

  autoTable(pdf, {
    startY: currentY,
    head: [['Point #', 'Concentration (mM)', 'Absorbance (A)']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { halign: 'center', fontSize: 10 },
    columnStyles: { 0: { halign: 'left', fontStyle: 'bold', textColor: [79, 70, 229] } },
    margin: { left: 15, right: 15 }
  });

  // --- DOWNLOAD ---
  pdf.save(`${title.replace(/\s+/g, '_')}_Lab_Report.pdf`);
};