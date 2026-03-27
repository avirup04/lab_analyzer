import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcel = async (data) => {
    const { title, researcher, rollNo, results, rows, pathLength, chartImage } = data;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lab Report');

    // --- 1. TITLE & INSTITUTIONAL HEADER ---
    worksheet.mergeCells('A1:I1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = title.toUpperCase();
    titleCell.font = { name: 'Arial Black', size: 16, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A2:I2');
    worksheet.getCell('A2').value = `Name: ${researcher} | Roll: ${rollNo} | Dept. of Life Sciences, RKMRC Narendrapur`; worksheet.getCell('A2').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

    // --- 2. RESULT SUMMARY BOX ---
    worksheet.addRow([]); // Row 3 (Gap)
    const resHeader = worksheet.addRow(['ANALYSIS SUMMARY']); // Row 4
    resHeader.font = { bold: true, color: { argb: 'FF4F46E5' } };

    worksheet.addRow(['Molar Extinction (ε)', `${results.epsilon.toExponential(4)} mM⁻¹cm⁻¹`]); // Row 5
    worksheet.addRow(['Slope (m)', results.slope.toFixed(4)]); // Row 6
    worksheet.addRow(['Path Length (l)', `${pathLength} cm`]); // Row 7

    const summaryRows = [5, 6, 7];
    summaryRows.forEach(rowNum => {
        worksheet.getRow(rowNum).getCell(2).font = { bold: true, color: { argb: 'FF10B981' } };
    });

    // --- 3. SCIENTIFIC DERIVATION ---
    worksheet.addRow([]); // Row 8
    worksheet.mergeCells('A9:C9');
    const formulaCell = worksheet.getCell('A9');
    formulaCell.value = "DERIVATION: Based on Beer-Lambert Law (A=εcl), ε is calculated as Slope/Path.";
    formulaCell.font = { italic: true, size: 9, color: { argb: 'FF64748B' } };

    // --- 4. DATA TABLE ---
    worksheet.addRow([]); // Row 10
    const tableHeader = worksheet.addRow(['Reading #', 'Concentration (mM)', 'Absorbance (A)']); // Row 11

    tableHeader.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        cell.font = { bold: true };
        cell.border = { bottom: { style: 'thin' } };
    });

    rows.forEach((row, index) => {
        worksheet.addRow([`Sample 0${index + 1}`, parseFloat(row.conc), parseFloat(row.abs)]);
    });

    // Set tight column widths for the table side
    worksheet.getColumn(1).width = 15;
    worksheet.getColumn(2).width = 22;
    worksheet.getColumn(3).width = 18;

    // --- 5. EMBED THE CHART ---
    if (chartImage) {
        const imageId = workbook.addImage({
            base64: chartImage,
            extension: 'png',
        });

        // Position the chart to the right of the text (Column E, Row 4)
        worksheet.addImage(imageId, {
            tl: { col: 4, row: 3 }, // tl = top-left (col 4 is 'E', row 3 is Row 4 in Excel)
            ext: { width: 500, height: 300 } // Standard chart dimensions
        });
    }

    // --- 6. GENERATE & DOWNLOAD ---
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${title.replace(/\s+/g, '_')}_Lab_Report.xlsx`);
};