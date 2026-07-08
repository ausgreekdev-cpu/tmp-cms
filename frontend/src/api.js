const API = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (res.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const login = (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getMe = () => request('/auth/me');
export const getDashboard = () => request('/dashboard');
export const getUsers = () => request('/users');
export const createUser = (data) => request('/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUser = (id) => request(`/users/${id}`, { method: 'DELETE' });
export const getClients = () => request('/clients');
export const getClient = (id) => request(`/clients/${id}`);
export const createClient = (data) => request('/clients', { method: 'POST', body: JSON.stringify(data) });
export const updateClient = (id, data) => request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteClient = (id) => request(`/clients/${id}`, { method: 'DELETE' });
export const getSites = () => request('/sites');
export const getSite = (id) => request(`/sites/${id}`);
export const createSite = (data) => request('/sites', { method: 'POST', body: JSON.stringify(data) });
export const updateSite = (id, data) => request(`/sites/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSite = (id) => request(`/sites/${id}`, { method: 'DELETE' });
export const getProjects = () => request('/projects');
export const getProject = (id) => request(`/projects/${id}`);
export const createProject = (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) });
export const updateProject = (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProject = (id) => request(`/projects/${id}`, { method: 'DELETE' });
export const getTMPs = (status) => request(`/tmps${status ? `?status=${status}` : ''}`);
export const getTMP = (id) => request(`/tmps/${id}`);
export const createTMP = (data) => request('/tmps', { method: 'POST', body: JSON.stringify(data) });
export const updateTMP = (id, data) => request(`/tmps/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTMP = (id) => request(`/tmps/${id}`, { method: 'DELETE' });
export const getDocuments = () => request('/documents');
export const uploadDocument = (formData) => {
  const token = localStorage.getItem('token');
  return fetch(`${API}/documents/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData }).then(r => r.json());
};
export const deleteDocument = (id) => request(`/documents/${id}`, { method: 'DELETE' });
export const getEmailConfig = () => request('/email/config');
export const updateEmailConfig = (data) => request('/email/config', { method: 'PUT', body: JSON.stringify(data) });
export const testEmail = (to) => request('/email/test', { method: 'POST', body: JSON.stringify({ to }) });
export const sendTMPEmail = (tmp_id, recipient, note) => request('/email/send-tmp', { method: 'POST', body: JSON.stringify({ tmp_id, recipient, note }) });
export const getEmailLog = () => request('/email/log');
