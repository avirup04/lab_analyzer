import React, { useState, useEffect, useRef } from 'react';
import { Plus, Save, FileSpreadsheet, FileText, Trash2, ChartLine, ArrowLeft, History, Table as TableIcon } from 'lucide-react';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { API_BASE_URL } from '../config';
import { exportToExcel } from '../utils/excelExporter';
import { exportToPDF } from '../utils/pdfExporter';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function MolarExtinctionCalc() {
  const [view, setView] = useState('list');
  const [experiments, setExperiments] = useState([]);
  const [isSavedRecord, setIsSavedRecord] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [title, setTitle] = useState('');
  const [pathLength, setPathLength] = useState(1);
  const [rows, setRows] = useState([{ conc: '', abs: '' }, { conc: '', abs: '' }, { conc: '', abs: '' }]);
  const [results, setResults] = useState(null);

  const reportRef = useRef(null);
  const chartRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  // --- 1. DATA SYNC ---
  const fetchExperiments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/get_experiments.php?userId=${user.id}`);
      const data = await res.json();
      if (data.status === 'success') setExperiments(data.data);
    } catch (err) { console.error("Database connection failed", err); }
  };

  useEffect(() => { if (view === 'list') fetchExperiments(); }, [view]);

  //Export to Excel Handler
  const handleExcelExport = () => {
    let base64Image = null;
    if (chartRef.current) {
      base64Image = chartRef.current.toBase64Image();
    }

    exportToExcel({
      title: title || "Untitled Experiment",
      researcher: user.name,
      rollNo: user.roll_no || "LSUG/124/25",
      results: results,
      rows: results.data,
      pathLength: pathLength,
      chartImage: base64Image 
    });
  };

  //Export to PDF Handler
  const handlePDFExport = async () => {
    // Grab the isolated chart image
    let base64Image = null;
    if (chartRef.current) {
      base64Image = chartRef.current.toBase64Image();
    }

    try {
      await exportToPDF({
        title: title || "Untitled Experiment",
        researcher: user.name || "Avirup Mukherjee", 
        rollNo: user.roll_no || "LSUG/124/25",
        results: results,
        rows: results.data,
        pathLength: pathLength,
        chartImage: base64Image // Pass the chart directly!
      });
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Failed to generate PDF. Check the browser console.");
    }
  };

  const handleOpen = (exp) => {
    const points = Array.isArray(exp.data_points) ? exp.data_points : JSON.parse(exp.data_points);
    setResults({
      slope: parseFloat(exp.slope),
      intercept: parseFloat(exp.intercept),
      epsilon: parseFloat(exp.epsilon),
      data: points
    });
    setTitle(exp.title);
    setPathLength(exp.path_length);
    setIsSavedRecord(true); 
    setSaveSuccess(false);
    setView('result');
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Permanently delete this experiment?")) return;
    try {
      await fetch(`${API_BASE_URL}/delete_experiment.php`, {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      fetchExperiments();
    } catch (err) { console.error(err); }
  };

  // --- 2. THE ENGINE ---
  const runAnalysis = () => {
    const validRows = rows.filter(r => r.conc !== '' && r.abs !== '');
    if (validRows.length < 2) return alert("Min 2 data points required for curve fitting.");

    const x = validRows.map(r => parseFloat(r.conc)); 
    const y = validRows.map(r => parseFloat(r.abs));  
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((prev, curr, i) => prev + (curr * y[i]), 0);
    const sumXX = x.reduce((a, b) => a + (b * b), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const epsilon = slope / parseFloat(pathLength);

    setResults({ slope, intercept, epsilon, data: validRows });
    setIsSavedRecord(false); 
    setSaveSuccess(false);
    setView('result');
  };

  const saveToDB = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/save_experiment.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id, title, pathLength,
          points: results.data, slope: results.slope,
          intercept: results.intercept, epsilon: results.epsilon
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setIsSavedRecord(true); 
        setSaveSuccess(true); 
      }
    } catch (err) { alert("Network error: Could not save."); }
  };

  // --- 3. UI LAYOUTS ---

  if (view === 'list') {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest text-xs"><History size={18} /> Experimental Archives</h2>
          <button onClick={() => { setResults(null); setView('add'); setTitle(''); setRows([{ conc: '', abs: '' }, { conc: '', abs: '' }, { conc: '', abs: '' }]); }} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition">
            + New Experiment
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {experiments.map((exp) => (
            <div key={exp.id} onClick={() => handleOpen(exp)} className="group flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-500 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-indigo-500 transition-colors"><ChartLine size={20} /></div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{exp.title}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{new Date(exp.created_at).toLocaleDateString()} • ε: {parseFloat(exp.epsilon).toExponential(2)}</p>
                </div>
              </div>
              <button onClick={(e) => handleDelete(e, exp.id)} className="p-2 text-slate-300 hover:text-red-500 transition"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'add') {
    return (
      <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4">
        <button onClick={() => setView('list')} className="text-slate-400 hover:text-indigo-600 mb-6 flex items-center gap-1 text-sm font-bold transition-colors"><ArrowLeft size={16} /> Back to Archives</button>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <input type="text" placeholder="Experiment Title (e.g. BSA Quantification)..." className="text-2xl font-black w-full bg-transparent border-b-2 border-slate-100 dark:border-slate-800 focus:border-indigo-500 outline-none pb-2 dark:text-white mb-8" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="grid grid-cols-2 gap-3 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
            <span>Conc (mM)</span>
            <span>Absorbance (A)</span>
          </div>
          {rows.map((row, i) => (
            <div key={i} className="flex gap-3 mb-2 animate-in fade-in">
              <input type="number" step="any" placeholder="0.00" className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={row.conc} onChange={(e) => { const r = [...rows]; r[i].conc = e.target.value; setRows(r); }} />
              <input type="number" step="any" placeholder="0.00" className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={row.abs} onChange={(e) => { const r = [...rows]; r[i].abs = e.target.value; setRows(r); }} />
            </div>
          ))}
          <button onClick={() => setRows([...rows, { conc: '', abs: '' }])} className="text-indigo-500 font-black text-[10px] mt-2 tracking-widest hover:underline">+ ADD POINT</button>
          <div className="mt-8 pt-6 border-t dark:border-slate-800 flex justify-between items-center">
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase">Path Length (cm)</label>
              <input type="number" className="w-20 mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg dark:text-white font-bold text-center" value={pathLength} onChange={(e) => setPathLength(e.target.value)} />
            </div>
            <button onClick={runAnalysis} className="bg-indigo-600 text-white px-10 py-3.5 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition">GENERATE CURVE</button>
          </div>
        </div>
      </div>
    );
  }

  if (!results) return null;

  const scatterData = {
    datasets: [
      { label: 'Observed', data: results.data.map(r => ({ x: r.conc, y: r.abs })), backgroundColor: '#6366f1', pointRadius: 6 },
      { label: 'Trendline', data: [{ x: Math.min(...results.data.map(r => r.conc)), y: results.slope * Math.min(...results.data.map(r => r.conc)) + results.intercept }, { x: Math.max(...results.data.map(r => r.conc)), y: results.slope * Math.max(...results.data.map(r => r.conc)) + results.intercept }], type: 'line', borderColor: '#10b981', borderWidth: 2, pointRadius: 0 }
    ]
  };

  return (
    <div className="space-y-6 animate-in zoom-in-95">
      {/* RESPONSIVE TOP BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button onClick={() => setView('list')} className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 font-bold text-xs uppercase tracking-widest transition-colors"><ArrowLeft size={14} /> Return</button>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {saveSuccess && <span className="text-emerald-500 text-xs font-bold animate-pulse w-full sm:w-auto mb-2 sm:mb-0">✓ Experiment Saved!</span>}

          <button onClick={handleExcelExport} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-100 transition-all cursor-pointer">
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button onClick={handlePDFExport} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 font-bold text-xs hover:bg-red-100 transition-all cursor-pointer">
            <FileText size={16} /> PDF
          </button>

          {!isSavedRecord && (
            <button onClick={saveToDB} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg hover:bg-indigo-700 transition">
              <Save size={16} /> Save
            </button>
          )}
        </div>
      </div>

      <div ref={reportRef} className="bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-4xl sm:rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800">
        <h3 className="text-2xl sm:text-3xl font-black dark:text-white mb-8 border-l-8 border-indigo-500 pl-4 wrap-break-word">{title}</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          <div className="bg-slate-50 dark:bg-slate-950 p-4 md:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-x-auto">
            <div className="h-64 md:h-80 min-w-100">
                <Scatter ref={chartRef} data={scatterData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: 'Concentration (mM)' } }, y: { title: { display: true, text: 'Absorbance (A)' } } } }} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 sm:p-8 bg-indigo-50 dark:bg-indigo-900/10 border-2 border-indigo-100 dark:border-indigo-800 rounded-3xl sm:rounded-4xl">
              <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-2">Calculated Molar Extinction (ε)</p>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-indigo-900 dark:text-white">{results.epsilon.toExponential(4)}</span>
                <span className="text-xs sm:text-sm font-bold text-indigo-600 italic">mM⁻¹cm⁻¹</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Scientific Derivation</h4>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed font-medium">
                <p>According to the <strong>Beer-Lambert Law</strong>: A = ε · c · l</p>
                <p>Rearranging for the Molar Extinction Coefficient (ε): <strong>ε = A / (c · l)</strong>.</p>

                <div className="bg-indigo-600 text-white p-3 sm:p-4 rounded-2xl text-center font-bold text-xs sm:text-sm shadow-inner wrap-break-word">
                  ε (Slope (m)) = A (Absorbance) / c(conc.)*Path Length (l)
                </div>

                <div className="pt-2 grid grid-cols-2 gap-2 sm:gap-4 text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg text-center border dark:border-slate-800">Slope (m): {results.slope.toFixed(4)}</div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg text-center border dark:border-slate-800">Path (l): {pathLength} cm</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RESPONSIVE SCROLLABLE DATA TABLE WITH TIGHTER SPACING */}
        <div className="mt-8 sm:mt-12 overflow-x-auto rounded-3xl border border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800 px-4 sm:px-6 py-3 flex items-center gap-2 text-slate-400 min-w-87.5">
            <TableIcon size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Raw Dataset Table</span>
          </div>
          <table className="w-full text-left text-xs sm:text-sm min-w-87.5 whitespace-nowrap">
            <thead>
              <tr className="border-b dark:border-slate-800 text-slate-500 font-bold uppercase text-[9px] sm:text-[10px]">
                <th className="px-4 sm:px-6 py-4">Point #</th>
                {/* Center-aligned headers to bring them closer to the data */}
                <th className="px-4 sm:px-6 py-4 text-center">Concentration (mM)</th>
                <th className="px-4 sm:px-6 py-4 text-center">Absorbance (A)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {results.data.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 font-bold text-indigo-600">Sample {(i + 1).toString().padStart(2, '0')}</td>
                  {/* Center-aligned numerical data */}
                  <td className="px-4 sm:px-6 py-4 dark:text-slate-300 font-mono text-center">{parseFloat(row.conc).toFixed(2)}</td>
                  <td className="px-4 sm:px-6 py-4 dark:text-slate-300 font-mono text-center">{parseFloat(row.abs).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}