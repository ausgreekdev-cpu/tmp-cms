import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSite, updateSite, deleteSite } from '../api.js';
import { SkeletonCard } from '../components/Skeleton.jsx';

export default function SiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    getSite(id).then(s => { setSite(s); setForm(s); }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    const updated = await updateSite(id, form);
    setSite(updated); setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this site?')) return;
    await deleteSite(id); navigate('/sites');
  };

  if (loading) return <div className="space-y-6"><div className="flex gap-4"><SkeletonCard lines={2} className="flex-1" /><SkeletonCard lines={1} className="w-32" /></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><SkeletonCard lines={5} /><SkeletonCard lines={3} /></div></div>;
  if (!site) return <p className="text-red-500">Not found</p>;

  const inputClass = "px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400";

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link to="/sites" className="text-gray-500 dark:text-gray-400 text-sm hover:underline block mb-1">&larr; Back to Sites</Link>
          {editing ? (
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="text-2xl font-bold border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 py-1.5 w-full bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900" />
          ) : <h2 className="text-2xl font-bold dark:text-white">{site.name}</h2>}
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
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">Location Details</h3>
          <div className="space-y-2 text-sm">
            {[
              ['Road Name', 'road_name'], ['Location', 'location'], ['Suburb', 'suburb'], ['State', 'state'], ['Postcode', 'postcode'],
            ].map(([label, field]) => (
              <div key={field} className="flex justify-between border-b border-gray-100 dark:border-gray-700/50 pb-1">
                <span className="text-gray-500 dark:text-gray-400 font-medium text-xs">{label}</span>
                {editing ? (
                  <input value={form[field]||''} onChange={e => setForm({...form, [field]: e.target.value})} className={inputClass} />
                ) : <span className="dark:text-gray-200">{site[field] || '-'}</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">Description</h3>
          {editing ? (
            <textarea value={form.description||''} onChange={e => setForm({...form, description: e.target.value})} rows={4}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 resize-y" />
          ) : <p className={`text-sm ${site.description ? 'dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>{site.description || 'No description'}</p>}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">Plans ({site.plans?.length || 0})</h3>
        {site.plans?.length === 0 ? <p className="text-gray-400 dark:text-gray-500 text-sm">No plans for this site</p> : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2 pr-3">Reference</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2 pr-3">Title</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2 pr-3">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {site.plans?.map(t => (
                <tr key={t.id} className="border-t border-gray-100 dark:border-gray-700/50">
                  <td className="py-2 pr-3 text-sm font-semibold dark:text-gray-200">{t.reference}</td>
                  <td className="py-2 pr-3 text-sm dark:text-gray-300">{t.title}</td>
                  <td className="py-2 pr-3"><span className="bg-gray-500 text-white px-2 py-0.5 rounded text-xs font-semibold inline-block">{t.status}</span></td>
                  <td className="py-2"><Link to={`/tmps/${t.id}`} className="text-blue-500 text-sm hover:underline">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
