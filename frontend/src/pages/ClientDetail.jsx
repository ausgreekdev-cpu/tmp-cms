import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getClient, updateClient, deleteClient } from '../api.js';
import { SkeletonCard } from '../components/Skeleton.jsx';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    getClient(id).then(c => { setClient(c); setForm(c); }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    const updated = await updateClient(id, form);
    setClient(updated); setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this client?')) return;
    await deleteClient(id); navigate('/clients');
  };

  if (loading) return <div className="space-y-6"><div className="flex gap-4"><SkeletonCard lines={2} className="flex-1" /><SkeletonCard lines={1} className="w-32" /></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><SkeletonCard lines={4} /><SkeletonCard lines={3} /></div></div>;
  if (!client) return <p className="text-red-500">Not found</p>;

  const inputClass = "px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400";

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link to="/clients" className="text-gray-500 dark:text-gray-400 text-sm hover:underline block mb-1">&larr; Back to Clients</Link>
          {editing ? (
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="text-2xl font-bold border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 py-1.5 w-full bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900" />
          ) : <h2 className="text-2xl font-bold dark:text-white">{client.name}</h2>}
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={handleSave} className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">Save</button>
              <button onClick={() => setEditing(false)} className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Edit</button>
              <button onClick={handleDelete} className="border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Delete</button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">Contact Info</h3>
          <div className="space-y-2 text-sm">
            {[
              ['Company', 'company'], ['Email', 'email'], ['Phone', 'phone'], ['Address', 'address'],
            ].map(([label, field]) => (
              <div key={field} className="flex justify-between border-b border-gray-100 dark:border-gray-700/50 pb-1">
                <span className="text-gray-500 dark:text-gray-400 font-medium text-xs">{label}</span>
                {editing ? (
                  <input value={form[field]||''} onChange={e => setForm({...form, [field]: e.target.value})} className={inputClass} />
                ) : <span className="dark:text-gray-200">{client[field] || '-'}</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">Notes</h3>
          {editing ? (
            <textarea value={form.notes||''} onChange={e => setForm({...form, notes: e.target.value})} rows={4}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 resize-y" />
          ) : <p className={`text-sm ${client.notes ? 'dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>{client.notes || 'No notes'}</p>}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">Projects ({client.projects?.length || 0})</h3>
        {client.projects?.length === 0 ? <p className="text-gray-400 dark:text-gray-500 text-sm">No projects for this client</p> : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2 pr-3">Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2 pr-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2 pr-3">Start</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2 pr-3">End</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {client.projects?.map(p => (
                <tr key={p.id} className="border-t border-gray-100 dark:border-gray-700/50">
                  <td className="py-2 pr-3 font-semibold text-sm dark:text-gray-200">{p.name}</td>
                  <td className="py-2 pr-3"><span className={`${p.status === 'active' ? 'bg-green-500' : 'bg-gray-500'} text-white px-2 py-0.5 rounded text-xs font-semibold inline-block`}>{p.status}</span></td>
                  <td className="py-2 pr-3 text-xs text-gray-500 dark:text-gray-400">{p.start_date || '-'}</td>
                  <td className="py-2 pr-3 text-xs text-gray-500 dark:text-gray-400">{p.end_date || '-'}</td>
                  <td className="py-2"><Link to={`/projects/${p.id}`} className="text-blue-500 text-sm hover:underline">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
