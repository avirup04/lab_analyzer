import React, { useState, useRef, useEffect } from 'react';
import { Save, FileSpreadsheet, FileText, ChartLine, ArrowLeft, History, Table as TableIcon, Trash2 } from 'lucide-react';
import { 
  Chart as ChartJS, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Tooltip, 
  Legend, 
  LineController,
  CategoryScale 
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { API_BASE_URL } from '../config';
import { exportToEnzymeExcel } from '../utils/enzymeExcelExporter';
import { exportToEnzymePDF } from '../utils/enzymePdfExporter';

// Registering all necessary components
ChartJS.register(LinearScale, CategoryScale, PointElement, LineElement, Tooltip, Legend, LineController);

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
      title: title || "Kinetics Assay",
      researcher: user.name || "Unknown Researcher", // <-- Fixed name fallback
      rollNo: user.roll_no || "N/A",                 // <-- Fixed roll number fallback
      results, epsilon, pathLength, time,
      mmChartImage: mmBase64,
      lbChartImage: lbBase64
    });
  };

  const handlePDFExport = async () => {
    let mmBase64 = null;
    let lbBase64 = null;
    if (mmChartRef.current) mmBase64 = mmChartRef.current.toBase64Image();
    if (lbChartRef.current) lbBase64 = lbChartRef.current.toBase64Image();

    try {
      await exportToEnzymePDF({
        title: title || "Kinetics Assay",
        researcher: user.name || "Unknown Researcher", // <-- Fixed name fallback
        rollNo: user.roll_no || "N/A",                 // <-- Fixed roll number fallback
        results, epsilon, pathLength, time,
        mmChartImage: mmBase64,
        lbChartImage: lbBase64
      });
    } catch (error) { alert("Failed to generate PDF."); }
  };

  const handleOpen = (exp) => {
    const points = Array.isArray(exp.data_points) ? exp.data_points : JSON.parse(exp.data_points);
    setResults({
      slope: parseFloat(exp.km / exp.vmax),
      yIntercept: 1 / exp.vmax,
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
      }
    } catch (err) { alert("Network Error."); }
  };

  // --- THE MATH ENGINE ---
  const runAnalysis = () => {
    const validRows = rows.filter(r => r.conc !== '' && r.abs !== '');
    if (validRows.length < 3) return alert("Min 3 data points required for kinetics.");
    if (!epsilon) return alert("Please enter the Molar Extinction Coefficient (ε).");

    const eps = parseFloat(epsilon);
    const l = parseFloat(pathLength);
    const t = parseFloat(time);

    const processedData = validRows.map(r => {
      const S = parseFloat(r.conc);
      const OD = parseFloat(r.abs);
      const V0 = OD / (eps * l * t);
      return { 
        S, OD, V0, 
        invS: S > 0 ? 1 / S : null, 
        invV0: V0 > 0 ? 1 / V0 : null 
      };
    });

    const regressionPoints = processedData.filter(d => d.invS !== null && d.invV0 !== null);
    if (regressionPoints.length < 2) return alert("Requires at least 2 non-zero concentrations for Lineweaver-Burk.");

    const x = regressionPoints.map(d => d.invS);
    const y = regressionPoints.map(d => d.invV0);
    const n = x.length;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((prev, curr, i) => prev + (curr * y[i]), 0);
    const sumXX = x.reduce((a, b) => a + (b * b), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const yIntercept = (sumY - slope * sumX) / n;

    const vmax = 1 / yIntercept;
    const km = slope * vmax;

    setResults({ slope, yIntercept, vmax, km, data: processedData });
    setIsSavedRecord(false);
    setSaveSuccess(false);
    setView('result');
  };

  if (!results && view === 'result') return null;

  // --- CHART DATA GENERATION ---
  let mmChartData = {};
  let lbChartData = {};

  if (results) {
    const maxS = Math.max(...results.data.map(d => d.S)) * 1.2;
    const mmCurveData = [];
    for (let s = 0; s <= maxS; s += maxS/50) {
        mmCurveData.push({ x: s, y: (results.vmax * s) / (results.km + s) });
    }

    // Advanced M-M Chart with Vmax Asymptote and Km mapping
    mmChartData = {
      datasets: [
        { label: 'Observed V₀', data: results.data.map(r => ({ x: r.S, y: r.V0 })), backgroundColor: '#6366f1', pointRadius: 6 },
        { label: 'M-M Curve', data: mmCurveData, type: 'line', borderColor: '#8b5cf6', borderWidth: 2, pointRadius: 0, tension: 0.4 },
        { label: 'Vmax Asymptote', data: [{x: 0, y: results.vmax}, {x: maxS, y: results.vmax}], type: 'line', borderColor: '#ef4444', borderWidth: 2, borderDash: [5, 5], pointRadius: 0 },
        { label: 'Km & ½Vmax', data: [{x: 0, y: results.vmax / 2}, {x: results.km, y: results.vmax / 2}, {x: results.km, y: 0}], type: 'line', borderColor: '#f59e0b', borderWidth: 2, borderDash: [4, 4], pointRadius: [0, 5, 0], pointBackgroundColor: '#f59e0b' }
      ]
    };

    const validLBPoints = results.data.filter(d => d.invS !== null && d.invV0 !== null);
    
    // Extended L-B Line to intercept the negative X-axis
    const lbLineData = [
      { x: -1 / results.km, y: 0 },
      { x: Math.max(...validLBPoints.map(d => d.invS)) * 1.1, y: results.slope * (Math.max(...validLBPoints.map(d => d.invS)) * 1.1) + results.yIntercept }
    ];

    lbChartData = {
      datasets: [
        { label: '1/V₀ vs 1/[S]', data: validLBPoints.map(r => ({ x: r.invS, y: r.invV0 })), backgroundColor: '#10b981', pointRadius: 6 },
        { label: 'L-B Trendline', data: lbLineData, type: 'line', borderColor: '#10b981', borderWidth: 2, pointRadius: 0 },
        { label: '1/Vmax (Y-Int)', data: [{x: 0, y: results.yIntercept}], type: 'scatter', backgroundColor: '#ef4444', pointRadius: 8, pointStyle: 'triangle', rotation: 180 },
        { label: '-1/Km (X-Int)', data: [{x: -1/results.km, y: 0}], type: 'scatter', backgroundColor: '#3b82f6', pointRadius: 7, pointStyle: 'rectRot' }
      ]
    };
  }

  // --- UI RENDER ---

  if (view === 'list') {
    return (
      <div className="space-y-4 px-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs"><History size={18} /> Kinetics Archives</h2>
          <button onClick={() => { setResults(null); setView('add'); setTitle(''); setRows([{ conc: '', abs: '' }, { conc: '', abs: '' }, { conc: '', abs: '' }, { conc: '', abs: '' }, { conc: '', abs: '' }]); }} className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition">
            + New Kinetics Assay
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {experiments.map((exp) => (
            <div key={exp.id} onClick={() => handleOpen(exp)} className="group flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-500 cursor-pointer transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-indigo-500 transition-colors"><ChartLine size={18} /></div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm truncate max-w-37.5">{exp.title}</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                    {new Date(exp.created_at).toLocaleDateString()} • Km: {parseFloat(exp.km).toFixed(3)}
                  </p>
                </div>
              </div>
              <button onClick={(e) => handleDelete(e, exp.id)} className="p-2 text-slate-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'add') {
    return (
      <div className="max-w-3xl mx-auto px-2">
        <button onClick={() => setView('list')} className="text-slate-400 hover:text-indigo-600 mb-6 flex items-center gap-1 text-xs font-bold transition-colors"><ArrowLeft size={14} /> Back to Archives</button>
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-10 rounded-4xl sm:rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <input type="text" placeholder="Experiment Title..." className="text-xl sm:text-2xl font-black w-full bg-transparent border-b-2 border-slate-100 dark:border-slate-800 focus:border-indigo-500 outline-none pb-2 dark:text-white mb-8" value={title} onChange={(e) => setTitle(e.target.value)} />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
             <div className="flex flex-col">
               <label className="text-[9px] font-black text-indigo-500 uppercase mb-1 tracking-wider">Epsilon (ε)</label>
               <input type="number" placeholder="1.5e3" className="p-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg dark:text-white text-xs outline-none focus:ring-1 focus:ring-indigo-500" value={epsilon} onChange={(e)=>setEpsilon(e.target.value)} />
             </div>
             <div className="flex flex-col">
               <label className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-wider">Path (cm)</label>
               <input type="number" className="p-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg dark:text-white text-xs outline-none focus:ring-1 focus:ring-indigo-500" value={pathLength} onChange={(e)=>setPathLength(e.target.value)} />
             </div>
             <div className="flex flex-col">
               <label className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-wider">Time (mins)</label>
               <input type="number" className="p-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg dark:text-white text-xs outline-none focus:ring-1 focus:ring-indigo-500" value={time} onChange={(e)=>setTime(e.target.value)} />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 text-center">
            <span>[S] (mM)</span>
            <span>Abs (OD)</span>
          </div>

          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 sm:gap-4 mb-2 animate-in fade-in">
              <input type="number" step="any" placeholder="0.00" className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={row.conc} onChange={(e) => { const r = [...rows]; r[i].conc = e.target.value; setRows(r); }} />
              <input type="number" step="any" placeholder="0.00" className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" value={row.abs} onChange={(e) => { const r = [...rows]; r[i].abs = e.target.value; setRows(r); }} />
            </div>
          ))}
          <button onClick={() => setRows([...rows, { conc: '', abs: '' }])} className="text-indigo-500 font-black text-[10px] mt-2 tracking-widest hover:underline">+ ADD TUBE</button>
          
          <div className="mt-8 pt-6 border-t dark:border-slate-800">
            <button onClick={runAnalysis} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition">PLOT KINETICS</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 animate-in zoom-in-95">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button onClick={() => setView('add')} className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 font-bold text-xs uppercase tracking-widest transition-colors"><ArrowLeft size={14} /> Edit Data</button>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {saveSuccess && <span className="text-emerald-500 text-[10px] font-bold animate-pulse w-full sm:w-auto">✓ Saved!</span>}
          <button onClick={handleExcelExport} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 font-bold text-xs rounded-xl transition-all hover:bg-emerald-100"><FileSpreadsheet size={16} /> Excel</button>
          <button onClick={handlePDFExport} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 font-bold text-xs rounded-xl transition-all hover:bg-red-100"><FileText size={16} /> PDF</button>
          {!isSavedRecord && <button onClick={saveToDB} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg transition hover:bg-indigo-700"><Save size={16} /> Save</button>}
        </div>
      </div>

      <div ref={reportRef} className="bg-white dark:bg-slate-900 p-5 sm:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800">
        <h3 className="text-xl sm:text-3xl font-black dark:text-white mb-8 border-l-8 border-violet-500 pl-4">{title || "Enzyme Kinetics"}</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
           <div className="p-6 bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-800 rounded-3xl">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Max Velocity (Vmax)</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black dark:text-white">{results.vmax.toExponential(3)}</span>
                <span className="text-[10px] font-bold text-red-400 italic">mM/min</span>
              </div>
           </div>
           <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-800 rounded-3xl">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Michaelis Constant (Km)</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black dark:text-white">{results.km.toFixed(4)}</span>
                <span className="text-[10px] font-bold text-emerald-500 italic">mM</span>
              </div>
           </div>
        </div>

        {/* Side-by-Side Graph Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-10">
           
           {/* Michaelis-Menten Plot */}
           <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-x-auto">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest px-2">Michaelis-Menten Plot [V0 vs S]</p>
              <div className="h-64 sm:h-80 min-w-100">
                <Scatter ref={mmChartRef} data={mmChartData} options={{ 
                  maintainAspectRatio: false, 
                  plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: {size: 10} } } }, 
                  scales: { 
                    x: { title: { display: true, text: '[S] (mM)' } }, 
                    y: { title: { display: true, text: 'V0 (mM/min)' } } 
                  } 
                }} />
              </div>
           </div>

           {/* Lineweaver-Burk Plot */}
           <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-x-auto">
              <p className="text-[10px] font-black uppercase text-indigo-500 mb-4 tracking-widest px-2">Lineweaver-Burk Double Reciprocal</p>
              <div className="h-64 sm:h-80 min-w-100">
                <Scatter ref={lbChartRef} data={lbChartData} options={{ 
                  maintainAspectRatio: false, 
                  plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: {size: 10} } } }, 
                  scales: { 
                    x: { 
                      title: { display: true, text: '1/[S] (mM⁻¹)' },
                      grid: { color: (ctx) => ctx.tick?.value === 0 ? '#64748b' : '#e2e8f0', lineWidth: (ctx) => ctx.tick?.value === 0 ? 2 : 1 }
                    }, 
                    y: { 
                      title: { display: true, text: '1/V0 (min/mM)' },
                      grid: { color: (ctx) => ctx.tick?.value === 0 ? '#64748b' : '#e2e8f0', lineWidth: (ctx) => ctx.tick?.value === 0 ? 2 : 1 }
                    } 
                  } 
                }} />
              </div>
           </div>
        </div>

        {/* Data Transformation & Derivations Section */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Data Transformation & Derivations</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 font-medium">
                
                {/* Velocity Conversion */}
                <div className="space-y-3">
                    <p className="font-bold text-slate-800 dark:text-white">1. Initial Velocity (V₀) Conversion</p>
                    <p>Raw Absorbance (OD) was converted to reaction velocity using the Beer-Lambert law, incorporating molar extinction (ε), path length (l), and incubation time (t).</p>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border dark:border-slate-800 text-center shadow-inner">
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">V₀ = OD / (ε × l × t)</span>
                    </div>
                </div>

                {/* Regression Logic */}
                <div className="space-y-3">
                    <p className="font-bold text-slate-800 dark:text-white">2. Lineweaver-Burk Derivation</p>
                    <p>Taking the double reciprocal transforms the hyperbola into a linear equation:</p>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border dark:border-slate-800 text-center shadow-inner">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">1/V₀ = (Km/Vmax)(1/[S]) + 1/Vmax</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-center">
                            <span className="block text-[9px] text-slate-500 uppercase">Y-Intercept</span>
                            <span className="font-bold">1 / Vmax = {results.yIntercept.toFixed(4)}</span>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-center">
                            <span className="block text-[9px] text-slate-500 uppercase">X-Intercept</span>
                            <span className="font-bold">-1 / Km = {(-1/results.km).toFixed(4)}</span>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
      </div>
    </div>
  );
}