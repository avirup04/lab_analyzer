import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function Login() {
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // This lets us redirect the user after they log in

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      // Connect to the new login.php script
      const response = await fetch(`${API_BASE_URL}/login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rollNo: rollNo,
          password: password
        }),
      });

      // Read the response safely
      const rawText = await response.text();
      
      try {
        const data = JSON.parse(rawText);
        
        if (data.status === "success") {
          // 1. SAVE the user data into the browser's memory
          localStorage.setItem('user', JSON.stringify(data.user)); 
          
          alert(data.message);
          navigate('/lab-analyzer');
        } else {
          alert("Error: " + data.message);
        }
      } catch (parseError) {
        alert("Server error:\n\n" + rawText);
      }

    } catch (error) {
      alert("Failed to connect to the server. Is XAMPP running?");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-white">Lab Login</h2>
      
      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">College Roll No.</label>
          <input 
            type="text" 
            placeholder="e.g., LSUG/124/25" 
            value={rollNo} 
            onChange={(e) => setRollNo(e.target.value)} 
            className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-900 dark:text-white"
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-900 dark:text-white"
            required 
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-indigo-600 dark:bg-cyan-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition mt-6"
        >
          Authenticate
        </button>
      </form>
    </div>
  );
}