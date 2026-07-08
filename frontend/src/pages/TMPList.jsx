import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getTMPs } from '../api.js';
import { SkeletonTable } from '../components/Skeleton.jsx';

const statusColors = {
  draft: 'bg-gray-500', submitted: 'bg-amber-500', review: 'bg-orange-500',
  approved: 'bg-green-500', active: 'bg-blue-500', completed: 'bg-violet-500', cancelled: 'bg-red-500'
};

const statuses = ['all', 'draft', 'submitted', 'review', 'approved', 'active', 'completed', 'cancelled'];

export default function TMPList() {
  const [tmps, setTmps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const perPage = 15;
  const filter = searchParams.get('status') || '';

  useEffect(() => {
    setLoading(true);
    setPage(0);
    getTMPs(filter || undefined).then(setTmps).finally(() => setLoading(false));
  }, [filter]);

  const filtered = tmps.filter(t =>
    !search ||
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.reference?.toLowerCase().includes(search.toLowerCase()) ||
    t.project_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.site_name?.toLowerCase().includes(search.toLowerCase())
  );

  const pageCount = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Traffic Management Plans</h2>
        <Link to="/tmps/new" className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">+ New TMP</Link>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4 items-center">
        {statuses.map(s => (
          <button key={s} onClick={() => setSearchParams(s === 'all' ? {} : { status: s })}
            className={`px-3 py-1.5 rounded-md border text-xs font-medium capitalize cursor-pointer transition-colors ${
              (filter === s || (!filter && s === 'all'))
                ? 'bg-gray-900 dark:bg-gray-700 text-white border-gray-900 dark:border-gray-700'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}>
            {s}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          className="ml-auto px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400 w-48"
        />
      </div>
      {loading ? <SkeletonTable rows={8} cols={7} /> : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl py-10 text-center border border-gray-200 dark:border-gray-700">
          <p className="text-gray-400 dark:text-gray-500 text-sm">No TMPs found</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-3">Reference</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-3">Title</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-3">Project</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-3">Site</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-3">Type</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-3">Created</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {paged.map(t => (
                  <tr key={t.id} className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-3 px-3 text-sm font-semibold dark:text-gray-200">{t.reference}</td>
                    <td className="py-3 px-3 text-sm dark:text-gray-300">{t.title}</td>
                    <td className="py-3 px-3 text-sm text-gray-600 dark:text-gray-400">{t.project_name || '-'}</td>
                    <td className="py-3 px-3 text-sm text-gray-600 dark:text-gray-400">{t.site_name || '-'}</td>
                    <td className="py-3 px-3 text-xs capitalize text-gray-600 dark:text-gray-400">{t.plan_type}</td>
                    <td className="py-3 px-3"><span className={`${statusColors[t.status]||'bg-gray-500'} text-white px-2 py-0.5 rounded text-xs font-semibold inline-block`}>{t.status}</span></td>
                    <td className="py-3 px-3 text-xs text-gray-500 dark:text-gray-400">{t.created_at?.slice(0,10)}</td>
                    <td className="py-3 px-3"><Link to={`/tmps/${t.id}`} className="text-blue-500 text-sm font-medium hover:underline">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pageCount > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: pageCount }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                    page === i ? 'bg-gray-900 dark:bg-gray-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}>
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
