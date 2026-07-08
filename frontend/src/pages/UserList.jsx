import React, { useState, useEffect } from 'react';
import { getUsers, createUser, deleteUser } from '../api.js';
import { SkeletonTable } from '../components/Skeleton.jsx';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'planner' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const perPage = 15;

  useEffect(() => { getUsers().then(setUsers).finally(() => setLoading(false)); }, []);

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );
  const pageCount = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  const handleCreate = async (e) => {
    e.preventDefault();
    const u = await createUser(form);
    setUsers([...users, u]);
    setShowForm(false);
    setForm({ name: '', email: '', password: '', role: 'planner' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    await deleteUser(id);
    setUsers(users.filter(u => u.id !== id));
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role !== 'admin') return <p className="text-red-500">Access denied. Admin only.</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Users</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">+ New User</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 mb-5">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white" />
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white" />
            <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white" />
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white">
              <option value="planner">Planner</option><option value="admin">Admin</option><option value="viewer">Viewer</option>
            </select>
          </div>
          <button type="submit" className="bg-gray-900 dark:bg-gray-700 text-white px-5 py-2 rounded-lg font-semibold text-sm cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-600">Create User</button>
        </form>
      )}

      <div className="flex mb-4">
        <input type="text" placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400 w-48 ml-auto" />
      </div>

      {loading ? <SkeletonTable rows={5} cols={4} /> : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-3">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-3">Email</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-3">Role</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-3">Created</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {paged.map(u => (
                  <tr key={u.id} className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-3 px-3 font-semibold text-sm dark:text-gray-200">{u.name}</td>
                    <td className="py-3 px-3 text-sm dark:text-gray-300">{u.email}</td>
                    <td className="py-3 px-3"><span className={`${u.role === 'admin' ? 'bg-violet-500' : u.role === 'planner' ? 'bg-blue-500' : 'bg-gray-500'} text-white px-2 py-0.5 rounded text-xs font-semibold inline-block capitalize`}>{u.role}</span></td>
                    <td className="py-3 px-3 text-xs text-gray-500 dark:text-gray-400">{u.created_at?.slice(0,10)}</td>
                    <td className="py-3 px-3"><button onClick={() => handleDelete(u.id)} className="text-red-500 text-sm font-medium bg-transparent border-none cursor-pointer hover:underline">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pageCount > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: pageCount }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${page === i ? 'bg-gray-900 dark:bg-gray-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
