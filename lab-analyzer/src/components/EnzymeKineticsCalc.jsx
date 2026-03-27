import React, { useState, useRef, useEffect } from 'react';
import { Save, FileSpreadsheet, FileText, ChartLine, ArrowLeft, History, Table as TableIcon, Trash2 } from 'lucide-react';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { API_BASE_URL } from '../config';
import { exportToEnzymeExcel } from '../utils/enzymeExcelExporter';
import { exportToEnzymePDF } from '../utils/enzymePdfExporter'; // <-- NEW PDF IMPORT

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function EnzymeKineticsCalc() {
  const [view, setView] = useState('list'); 
  const [experiments, setExperiments] = useState([]);
  const [isSavedRecord, setIsSavedRecord] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [title, setTitle] = useState('');
  const [pathLength, setPathLength] = useState(1);
  const [epsilon, setEpsilon] = useState(''); 
  const [time, setTime] = useState(10); 
  
  const [rows, setRows] = useState([
    { conc: '', abs: '' }, { conc: '', abs: '' }, { conc: '', abs: '' }, { conc: '', abs: '' }, { conc: '', abs: '' }
  ]);
  const [results, setResults] = useState(null);

  const reportRef = useRef(null);
  const mmChartRef = useRef(null);
  const lbChartRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user')) || {};

  // --- 1. DATA SYNC ---
  const fetchExperiments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/get_enzyme.php?userId=${user.id}`);
      const data = await res.json();
      if (data.status === 'success') setExperiments(data.data);
    } catch (err) { console.error("Database connection failed", err); }
  };

  useEffect(() => { if (view === 'list') fetchExperiments(); }, [view]);

  // --- EXPORT HANDLERS ---
  const handleExcelExport = () => {
    let mmBase64 = null;
    let lbBase64 = null;
    
    if (mmChartRef.current) mmBase64 = mmChartRef.current.toBase64Image();
    if (lbChartRef.current) lbBase64 = lbChartRef.current.toBase64Image();

    exportToEnzymeExcel({
      title: title,
      researcher: user.name,
      rollNo: user.roll_no || "LSUG/124/25",
      results: results,
      epsilon: epsilon,
      pathLength: pathLength,
      time: time,
      mmChartImage: mmBase64,
      lbChartImage: lbBase64
    });
  };

  // <-- NEW PDF EXPORT HANDLER -->
  const handlePDFExport = async () => {
    let mmBase64 = null;
    let lbBase64 = null;
    
    // Snapshot both charts for the PDF
    if (mmChartRef.current) mmBase64 = mmChartRef.current.toBase64Image();
    if (lbChartRef.current) lbBase64 = lbChartRef.current.toBase64Image();

    try {
      await exportToEnzymePDF({
        title: title,
        researcher: user.name,
        rollNo: user.roll_no || "LSUG/124/25",
        results: results,
        epsilon: epsilon,
        pathLength: pathLength,
        time: time,
        mmChartImage: mmBase64,
        lbChartImage: lbBase64
      });
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Failed to generate PDF. Check the browser console.");
    }
  };

  const handleOpen = (exp) => {
    const points = Array.isArray(exp.data_points) ? exp.data_points : JSON.parse(exp.data_points);
    const slope = exp.km / exp.vmax;
    const yIntercept = 1 / exp.vmax;

    setResults({
      slope: slope,
      yIntercept: yIntercept,
      vmax: parseFloat(exp.vmax),
      km: parseFloat(exp.km),
      data: points
    });
    setTitle(exp.title);
    setPathLength(exp.path_length);
    setEpsilon(exp.epsilon);
    setTime(exp.incubation_time);
    setIsSavedRecord(true);
    setSaveSuccess(false);
    setView('result');
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Permanently delete this kinetics experiment?")) return;
    try {
      await fetch(`${API_BASE_URL}/delete_enzyme.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchExperiments();
    } catch (err) { console.error(err); }
  };

  const saveToDB = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/save_enzyme.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id, title, pathLength, epsilon, time,
          points: results.data, km: results.km, vmax: results.vmax
        })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setIsSavedRecord(true); 
        setSaveSuccess(true); 
      } else {
        alert("Server Error: " + data.message); 
      }
    } catch (err) { 
        alert("Network Error: Make sure your PHP files are running and the URL is correct."); 
        console.error(err);
    }
  };

  // --- THE MATH ENGINE ---
  const runAnalysis = () => {
    const validRows = rows.filter(r => r.conc !== '' && r.abs !== '');
    if (validRows.length < 3) return alert("Min 3 data points required for accurate kinetics.");
    if (!epsilon) return alert("Please enter the Molar Extinction Coefficient (ε).");

    const eps = parseFloat(epsilon);
    const l = parseFloat(pathLength);
    const t = parseFloat(time);

    // 1. Convert OD to V0
    const processedData = validRows.map(r => {
      const S = parseFloat(r.conc);
      const OD = parseFloat(r.abs);
      const V0 = OD / (eps * l * t); // mM/min
      return { S, OD, V0, invS: 1 / S, invV0: 1 / V0 };
    });

    // 2. Lineweaver-Burk Linear Regression (1/V0 vs 1/S)
    const x = processedData.map(d => d.invS);
    const y = processedData.map(d => d.invV0);
    const n = x.length;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((prev, curr, i) => prev + (curr * y[i]), 0);
    const sumXX = x.reduce((a, b) => a + (b * b), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const yIntercept = (sumY - slope * sumX) / n;

    // 3. Extract Vmax and Km
    const vmax = 1 / yIntercept;
    const km = slope * vmax;

    setResults({ slope, yIntercept, vmax, km, data: processedData });
    setIsSavedRecord(false);
    setSaveSuccess(false);
    setView('result');
  };

  // --- UI LAYOUTS ---

  if (view === 'add') {
    return (
      <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4">
        <button onClick={() => setView('list')} className="text-slate-400 hover:text-indigo-600 mb-6 flex items-center gap-1 text-sm font-bold transition-colors"><ArrowLeft size={16} /> Back to Archives</button>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <input type="text" placeholder="Experiment Title (e.g. Hexokinase Kinetics)..." className="text-2xl font-black w-full bg-transparent border-b-2 border-slate-100 dark:border-slate-800 focus:border-indigo-500 outline-none pb-2 dark:text-white mb-8" value={title} onChange={(e) => setTitle(e.target.value)} />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
             <div className="flex flex-col">
               <label className="text-[10px] font-black text-indigo-500 uppercase">Molar Extinction (ε)</label>
               <input type="number" placeholder="e.g. 1.5e3" className="mt-1 p-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg dark:text-white font-mono text-sm" value={epsilon} onChange={(e)=>setEpsilon(e.target.value)} />
               <span className="text-[9px] text-slate-400 mt-1 font-bold">Use #App1 to find it</span>
             </div>
             <div className="flex flex-col">
               <label className="text-[10px] font-black text-slate-500 uppercase">Path Length (cm)</label>
               <input type="number" className="mt-1 p-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg dark:text-white font-mono text-sm" value={pathLength} onChange={(e)=>setPathLength(e.target.value)} />
             </div>
             <div className="flex flex-col">
               <label className="text-[10px] font-black text-slate-500 uppercase">Incubation (mins)</label>
               <input type="number" className="mt-1 p-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg dark:text-white font-mono text-sm" value={time} onChange={(e)=>setTime(e.target.value)} />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
            <span>Substrate [S] (mM)</span>
            <span>Absorbance (OD)</span>
          </div>
          {rows.map((row, i) => (
            <div key={i} className="flex gap-3 mb-2 animate-in fade-in">
              <input type="number" step="any" placeholder="0.00" className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={row.conc} onChange={(e) => { const r = [...rows]; r[i].conc = e.target.value; setRows(r); }} />
              <input type="number" step="any" placeholder="0.00" className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={row.abs} onChange={(e) => { const r = [...rows]; r[i].abs = e.target.value; setRows(r); }} />
            </div>
          ))}
          <button onClick={() => setRows([...rows, { conc: '', abs: '' }])} className="text-indigo-500 font-black text-[10px] mt-2 tracking-widest hover:underline">+ ADD TUBE</button>
          
          <div className="mt-8 pt-6 border-t dark:border-slate-800 flex justify-end">
            <button onClick={runAnalysis} className="bg-indigo-600 text-white w-full sm:w-auto px-10 py-3.5 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition">PLOT KINETICS</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'list') {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest text-xs"><History size={18} /> Kinetics Archives</h2>
          <button onClick={() => { setResults(null); setView('add'); setTitle(''); setRows([{ conc: '', abs: '' }, { conc: '', abs: '' }, { conc: '', abs: '' }, { conc: '', abs: '' }, { conc: '', abs: '' }]); }} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition">
            + New Kinetics Assay
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {experiments.length === 0 ? (
            <div className="p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">No records found.</div>
          ) : (
            experiments.map((exp) => (
              <div key={exp.id} onClick={() => handleOpen(exp)} className="group flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-500 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-indigo-500 transition-colors"><ChartLine size={20} /></div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">{exp.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                        {new Date(exp.created_at).toLocaleDateString()} • Km: {parseFloat(exp.km).toFixed(3)} • Vmax: {parseFloat(exp.vmax).toExponential(2)}
                    </p>
                  </div>
                </div>
                <button onClick={(e) => handleDelete(e, exp.id)} className="p-2 text-slate-300 hover:text-red-500 transition"><Trash2 size={18} /></button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (!results) return null;

  // --- CHART DATA GENERATION ---
  const maxS = Math.max(...results.data.map(d => d.S)) * 1.2;
  const mmCurveData = [];
  for (let s = 0; s <= maxS; s += maxS/50) {
      mmCurveData.push({ x: s, y: (results.vmax * s) / (results.km + s) });
  }

  const mmChartData = {
    datasets: [
      { label: 'Observed V₀', data: results.data.map(r => ({ x: r.S, y: r.V0 })), backgroundColor: '#6366f1', pointRadius: 6 },
      { label: 'M-M Curve', data: mmCurveData, type: 'line', borderColor: '#8b5cf6', borderWidth: 2, pointRadius: 0, tension: 0.4 },
      { label: 'Vmax', data: [{x: 0, y: results.vmax}, {x: maxS, y: results.vmax}], type: 'line', borderColor: '#ef4444', borderWidth: 1, borderDash: [5, 5], pointRadius: 0 },
      { label: 'Km & ½Vmax', data: [{x: 0, y: results.vmax / 2}, {x: results.km, y: results.vmax / 2}, {x: results.km, y: 0}], type: 'line', borderColor: '#f59e0b', borderWidth: 2, borderDash: [4, 4], pointRadius: [0, 5, 0], pointBackgroundColor: '#f59e0b' }
    ]
  };

  const lbLineData = [
      { x: -1/results.km, y: 0 },
      { x: Math.max(...results.data.map(d => d.invS)) * 1.1, y: results.slope * (Math.max(...results.data.map(d => d.invS)) * 1.1) + results.yIntercept }
  ];

  const lbChartData = {
    datasets: [
      { label: '1/V₀ vs 1/[S]', data: results.data.map(r => ({ x: r.invS, y: r.invV0 })), backgroundColor: '#10b981', pointRadius: 6 },
      { label: 'L-B Trendline', data: lbLineData, type: 'line', borderColor: '#10b981', borderWidth: 2, pointRadius: 0 },
      { label: 'Y-Intercept (1/Vmax)', data: [{x: 0, y: results.yIntercept}], type: 'scatter', backgroundColor: '#ef4444', pointRadius: 8, pointStyle: 'triangle', rotation: 180 },
      { label: 'X-Intercept (-1/Km)', data: [{x: -1/results.km, y: 0}], type: 'scatter', backgroundColor: '#3b82f6', pointRadius: 7, pointStyle: 'rectRot' }
    ]
  };

  return (
    <div className="space-y-6 animate-in zoom-in-95">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button onClick={() => setView('add')} className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 font-bold text-xs uppercase tracking-widest transition-colors"><ArrowLeft size={14} /> Edit Data</button>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {saveSuccess && <span className="text-emerald-500 text-xs font-bold animate-pulse w-full sm:w-auto mb-2 sm:mb-0">✓ Saved!</span>}
          
          {/* EXPORT BUTTONS */}
          <button onClick={handleExcelExport} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-xl hover:bg-emerald-100 transition"><FileSpreadsheet size={16} /> Excel</button>
          <button onClick={handlePDFExport} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition"><FileText size={16} /> PDF</button>
          
          {!isSavedRecord && (
              <button onClick={saveToDB} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg hover:bg-indigo-700 transition"><Save size={16} /> Save</button>
          )}
        </div>
      </div>

      <div ref={reportRef} className="bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800">
        <h3 className="text-2xl sm:text-3xl font-black dark:text-white mb-8 border-l-8 border-violet-500 pl-4 break-words">{title || "Enzyme Kinetics"}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="p-6 bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-800 rounded-3xl">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Maximum Velocity (Vmax)</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-red-600">{results.vmax.toExponential(3)}</span>
                <span className="text-xs font-bold text-red-400 italic">mM/min</span>
              </div>
              <p className="text-[10px] text-red-400/70 font-mono mt-3 font-bold">Vmax = 1 / y-intercept</p>
            </div>
            
            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-800 rounded-3xl">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Michaelis Constant (Km)</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-emerald-600">{results.km.toFixed(4)}</span>
                <span className="text-xs font-bold text-emerald-500 italic">mM</span>
              </div>
              <p className="text-[10px] text-emerald-500/70 font-mono mt-3 font-bold">Km = slope × Vmax</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-10">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-100 overflow-x-auto">
             <h4 className="text-center text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Michaelis-Menten</h4>
            <div className="h-64 min-w-[300px]">
                <Scatter ref={mmChartRef} data={mmChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: '[S] (mM)' } }, y: { title: { display: true, text: 'V₀ (mM/min)' } } } }} />
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-100 overflow-x-auto">
             <h4 className="text-center text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Lineweaver-Burk</h4>
            <div className="h-64 min-w-[300px]">
                <Scatter 
                    ref={lbChartRef}
                    data={lbChartData} 
                    options={{ 
                        maintainAspectRatio: false, 
                        plugins: { legend: { display: false } }, 
                        scales: { 
                            x: { 
                                title: { display: true, text: '1/[S]' },
                                grid: {
                                    color: (ctx) => ctx.tick?.value === 0 ? '#64748b' : '#e2e8f0',
                                    lineWidth: (ctx) => ctx.tick?.value === 0 ? 2 : 1
                                }
                            }, 
                            y: { 
                                title: { display: true, text: '1/V₀' },
                                grid: {
                                    color: (ctx) => ctx.tick?.value === 0 ? '#64748b' : '#e2e8f0',
                                    lineWidth: (ctx) => ctx.tick?.value === 0 ? 2 : 1
                                }
                            } 
                        } 
                    }} 
                />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-10">
            <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Data Transformation Steps</h4>
            <div className="text-xs text-slate-700 space-y-3 font-medium">
                <p><strong>1. Velocity Conversion:</strong> Raw OD values were converted to initial velocity (V<sub>0</sub>) using the Beer-Lambert law: <span className="font-mono bg-white px-2 py-1 rounded border">V<sub>0</sub> = OD / (ε × l × t)</span></p>
                <p><strong>2. Double Reciprocal:</strong> Substrate concentrations and V<sub>0</sub> were inverted to generate the linear Lineweaver-Burk equation: <span className="font-mono bg-white px-2 py-1 rounded border">1/V<sub>0</sub> = (Km/Vmax)(1/[S]) + 1/Vmax</span></p>
                <p><strong>3. Regression:</strong> Linear regression on the double-reciprocal plot yielded a slope of <strong>{results.slope.toFixed(4)}</strong> and a y-intercept of <strong>{results.yIntercept.toFixed(4)}</strong>.</p>
            </div>
        </div>

      </div>
    </div>
  );
}