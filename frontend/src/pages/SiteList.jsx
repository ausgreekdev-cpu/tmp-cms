import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSites, createSite } from '../api.js';
import { SkeletonTable } from '../components/Skeleton.jsx';

export default function SiteList() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', road_name: '', suburb: '', state: '' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const perPage = 15;

  useEffect(() => { getSites().then(setSites).finally(() => setLoading(false)); }, []);

  const filtered = sites.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.road_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.suburb?.toLowerCase().includes(search.toLowerCase())
  );
  const pageCount = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  const handleCreate = async (e) => {
    e.preventDefault();
    const s = await createSite(form);
    setSites([s, ...sites]);
    setShowForm(false);
    setForm({ name: '', road_name: '', suburb: '', state: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Sites</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">+ New Site</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 mb-5">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input placeholder="Site name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white" />
            <input placeholder="Road name" value={form.road_name} onChange={e => setForm({...form, road_name: e.target.value})} className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white" />
            <input placeholder="Suburb" value={form.suburb} onChange={e => setForm({...form, suburb: e.target.value})} className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white" />
            <input placeholder="State" value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white" />
          </div>
          <button type="submit" className="bg-gray-900 dark:bg-gray-700 text-white px-5 py-2 rounded-lg font-semibold text-sm cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-600">Create</button>
        </form>
      )}

      <div className="flex mb-4">
        <input type="text" placeholder="Search sites..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400 w-48 ml-auto" />
      </div>

      {loading ? <SkeletonTable rows={5} cols={4} /> : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl py-10 text-center border border-gray-200 dark:border-gray-700">
          <p className="text-gray-400 dark:text-gray-500 text-sm">No sites found</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-3">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-3">Road</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-3">Suburb</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-3">State</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {paged.map(s => (
                  <tr key={s.id} className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-3 px-3 font-semibold text-sm dark:text-gray-200">{s.name}</td>
                    <td className="py-3 px-3 text-sm text-gray-600 dark:text-gray-400">{s.road_name || '-'}</td>
                    <td className="py-3 px-3 text-sm text-gray-600 dark:text-gray-400">{s.suburb || '-'}</td>
                    <td className="py-3 px-3 text-sm text-gray-600 dark:text-gray-400">{s.state || '-'}</td>
                    <td className="py-3 px-3"><Link to={`/sites/${s.id}`} className="text-blue-500 text-sm font-medium hover:underline">View</Link></td>
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
