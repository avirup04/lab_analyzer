import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // 1. Check if 'user' exists in localStorage
  const user = localStorage.getItem('user');

  // 2. If NO user is found, teleport them to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If a user IS found, show them the page they wanted (the 'children')
  return children;
}