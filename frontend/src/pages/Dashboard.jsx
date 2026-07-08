import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api.js';
import { SkeletonStats, SkeletonCard } from '../components/Skeleton.jsx';

const statusColors = {
  draft: 'bg-gray-500', submitted: 'bg-amber-500', review: 'bg-orange-500',
  approved: 'bg-green-500', active: 'bg-blue-500', completed: 'bg-violet-500', cancelled: 'bg-red-500'
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getDashboard().then(setData).finally(() => setLoading(false)); }, []);

  if (loading) return <div><SkeletonStats /><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><SkeletonCard lines={4} /><SkeletonCard lines={6} /></div></div>;
  if (!data) return <p className="text-red-500">Failed to load dashboard</p>;

  const { stats, recent_plans, recent_activity } = data;

  const cards = [
    { label: 'Total Plans', value: stats.total_plans, color: 'text-blue-500' },
    { label: 'Active/Approved', value: stats.active_plans, color: 'text-green-500' },
    { label: 'Drafts', value: stats.draft_plans, color: 'text-amber-500' },
    { label: 'Active Projects', value: stats.active_projects, color: 'text-violet-500' },
    { label: 'Clients', value: stats.total_clients, color: 'text-cyan-500' },
    { label: 'Sites', value: stats.total_sites, color: 'text-orange-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Dashboard</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">{c.label}</p>
            <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold mb-4 dark:text-white">Recent TMPs</h3>
          {recent_plans.length === 0 ? <p className="text-gray-400 dark:text-gray-500 text-sm">No plans yet</p> : (
            <table className="w-full">
              <thead>
                <tr><th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-2 pr-3">Reference</th><th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-2 pr-3">Title</th><th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-2 pr-3">Status</th><th className="pb-2"></th></tr>
              </thead>
              <tbody>
                {recent_plans.map(p => (
                  <tr key={p.id} className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-2 pr-3 text-sm font-semibold dark:text-gray-200">{p.reference}</td>
                    <td className="py-2 pr-3 text-sm dark:text-gray-300">{p.title}</td>
                    <td className="py-2 pr-3"><span className={`${statusColors[p.status]||'bg-gray-500'} text-white px-2 py-0.5 rounded text-xs font-semibold inline-block`}>{p.status}</span></td>
                    <td className="py-2"><Link to={`/tmps/${p.id}`} className="text-blue-500 text-sm hover:underline">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold mb-4 dark:text-white">Recent Activity</h3>
          {recent_activity.length === 0 ? <p className="text-gray-400 dark:text-gray-500 text-sm">No activity yet</p> : (
            <div className="space-y-3">
              {recent_activity.map(a => (
                <div key={a.id} className="text-sm py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0 dark:text-gray-300">
                  <span className="font-semibold dark:text-gray-200">{a.user_name || 'Unknown'}</span>
                  {' '}{a.description || a.action}
                  <span className="text-gray-400 dark:text-gray-500 ml-2 text-xs">{a.created_at?.slice(0,10)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
