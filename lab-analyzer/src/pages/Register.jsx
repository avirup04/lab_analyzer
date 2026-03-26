import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE_URL}/register.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName,
          rollNo: rollNo,
          email: email,
          password: password
        }),
      });

      // 1. READ AS RAW TEXT FIRST
      const rawText = await response.text();
      console.log("RAW PHP OUTPUT:", rawText); // This prints to your F12 Console

      // 2. NOW TRY TO CONVERT TO JSON
      try {
        const data = JSON.parse(rawText);
        
        if (data.status === "success") {
          alert("Success: " + data.message);
          setFullName(''); setRollNo(''); setEmail(''); setPassword('');
        } else {
          alert("Error: " + data.message);
        }
      } catch (parseError) {
        // IF IT FAILS, SHOW US THE EXACT RAW TEXT THAT BROKE IT
        alert("React expected JSON, but PHP sent this instead:\n\n" + rawText);
      }

    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Actual Fetch Error: " + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-white">Register as Researcher</h2>
      
      <form className="space-y-4" onSubmit={handleRegister}>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Full Name</label>
          <input type="text" placeholder="Your Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition text-slate-900 dark:text-white" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">College Roll No.</label>
          <input type="text" placeholder="e.g., LSUG/124/25" value={rollNo} onChange={(e) => setRollNo(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition text-slate-900 dark:text-white" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Email Address</label>
          <input type="email" placeholder="email@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition text-slate-900 dark:text-white" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Password</label>
          <input type="password" placeholder="Create a secure password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition text-slate-900 dark:text-white" required />
        </div>

        <button type="submit" className="w-full bg-emerald-600 dark:bg-emerald-500 text-white font-bold py-3 rounded-lg hover:opacity-90 transition mt-6">
          Create Account
        </button>
      </form>
    </div>
  );
}