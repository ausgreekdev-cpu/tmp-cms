import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TMPList from './pages/TMPList.jsx';
import TMPDetail from './pages/TMPDetail.jsx';
import TMPForm from './pages/TMPForm.jsx';
import ProjectList from './pages/ProjectList.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import ClientList from './pages/ClientList.jsx';
import ClientDetail from './pages/ClientDetail.jsx';
import SiteList from './pages/SiteList.jsx';
import SiteDetail from './pages/SiteDetail.jsx';
import UserList from './pages/UserList.jsx';
import EmailSettings from './pages/EmailSettings.jsx';

function ProtectedRoute({ children }) {
  const user = localStorage.getItem('user');
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  useEffect(() => {
    const u = localStorage.getItem('user');
    setUser(u ? JSON.parse(u) : null);
  }, []);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={setUser} />} />
      <Route path="/" element={<ProtectedRoute><Layout user={user} setUser={setUser} /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="tmps" element={<TMPList />} />
        <Route path="tmps/new" element={<TMPForm />} />
        <Route path="tmps/:id" element={<TMPDetail />} />
        <Route path="tmps/:id/edit" element={<TMPForm />} />
        <Route path="projects" element={<ProjectList />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="clients" element={<ClientList />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="sites" element={<SiteList />} />
        <Route path="sites/:id" element={<SiteDetail />} />
        <Route path="users" element={<UserList />} />
        <Route path="settings/email" element={<EmailSettings />} />
      </Route>
    </Routes>
  );
}
