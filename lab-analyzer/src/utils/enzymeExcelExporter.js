import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToEnzymeExcel = async (data) => {
    const { title, researcher, rollNo, results, epsilon, pathLength, time, mmChartImage, lbChartImage } = data;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Kinetics Report');

    // --- 1. TITLE & INSTITUTIONAL HEADER ---
    worksheet.mergeCells('A1:K1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = (title || "Enzyme Kinetics Assay").toUpperCase();
    titleCell.font = { name: 'Arial Black', size: 16, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B5CF6' } }; // Violet theme
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A2:K2');
    worksheet.getCell('A2').value = `Name: ${researcher} | Roll: ${rollNo} | Dept. of Life Sciences, RKMRC Narendrapur`; 
    worksheet.getCell('A2').font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

    // --- 2. CONSTANTS & RESULTS SUMMARY ---
    worksheet.addRow([]); // Row 3
    
    // Constants Box
    worksheet.getCell('A4').value = 'ASSAY CONSTANTS';
    worksheet.getCell('A4').font = { bold: true, color: { argb: 'FF64748B' } };
    worksheet.addRow(['Extinction (ε)', `${epsilon} mM⁻¹cm⁻¹`]);
    worksheet.addRow(['Path Length', `${pathLength} cm`]);
    worksheet.addRow(['Incubation', `${time} mins`]);
    
    worksheet.addRow([]); // Row 8
    
    // Results Box
    worksheet.getCell('A9').value = 'KINETICS PARAMETERS';
    worksheet.getCell('A9').font = { bold: true, color: { argb: 'FF8B5CF6' } };
    worksheet.addRow(['Vmax', `${results.vmax.toExponential(4)} mM/min`]);
    worksheet.addRow(['Km', `${results.km.toFixed(4)} mM`]);
    
    // Highlight Vmax and Km values
    worksheet.getCell('B10').font = { bold: true, color: { argb: 'FFEF4444' } }; // Red for Vmax
    worksheet.getCell('B11').font = { bold: true, color: { argb: 'FF10B981' } }; // Green for Km

    // --- 3. DATA TABLE ---
    worksheet.addRow([]); // Row 12
    const tableHeader = worksheet.addRow(['Tube #', '[S] (mM)', 'Absorbance (OD)', 'V0 (mM/min)', '1/[S]', '1/V0']);

    tableHeader.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        cell.font = { bold: true };
        cell.border = { bottom: { style: 'thin' } };
    });

    // Populate the processed data (which already contains V0, 1/S, etc.)
    results.data.forEach((row, index) => {
        worksheet.addRow([
            `Sample 0${index + 1}`, 
            parseFloat(row.S), 
            parseFloat(row.OD), 
            parseFloat(row.V0), 
            parseFloat(row.invS), 
            parseFloat(row.invV0)
        ]);
    });

    // Clean up Column widths
    worksheet.getColumn(1).width = 12;
    worksheet.getColumn(2).width = 12;
    worksheet.getColumn(3).width = 18;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 12;
    worksheet.getColumn(6).width = 12;

    // --- 4. EMBED THE CHARTS ---
    // Place Michaelis-Menten Chart
    if (mmChartImage) {
        const mmId = workbook.addImage({ base64: mmChartImage, extension: 'png' });
        worksheet.addImage(mmId, {
            tl: { col: 7, row: 3 }, // Place at Column H, Row 4
            ext: { width: 450, height: 260 } 
        });
    }

    // Place Lineweaver-Burk Chart right below it
    if (lbChartImage) {
        const lbId = workbook.addImage({ base64: lbChartImage, extension: 'png' });
        worksheet.addImage(lbId, {
            tl: { col: 7, row: 18 }, // Place at Column H, Row 19
            ext: { width: 450, height: 260 } 
        });
    }

    // --- 5. GENERATE & DOWNLOAD ---
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${(title || 'Kinetics').replace(/\s+/g, '_')}_Lab_Report.xlsx`);
};