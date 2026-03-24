import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
//import Login from './pages/Login';
//import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/*<Route path="login" element={<Login />} />*/}
          {/*<Route path="register" element={<Register />} />*/}
          {/* Temporary placeholder for the lab page */}
          <Route path="lab-analyzer" element={
            <div className="p-10 text-center text-xl font-bold dark:text-cyan-400">
              Lab Workspace Module (Authentication Required)
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}