import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProject, deleteProject } from '../api.js';
import { SkeletonCard } from '../components/Skeleton.jsx';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getProject(id).then(setProject).finally(() => setLoading(false)); }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this project?')) return;
    await deleteProject(id); navigate('/projects');
  };

  if (loading) return <div className="space-y-6"><SkeletonCard lines={5} /><SkeletonCard lines={3} /></div>;
  if (!project) return <p className="text-red-500">Not found</p>;

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link to="/projects" className="text-gray-500 dark:text-gray-400 text-sm hover:underline block mb-1">&larr; Back to Projects</Link>
          <h2 className="text-2xl font-bold dark:text-white">{project.name}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{project.description || 'No description'}</p>
        </div>
        <button onClick={handleDelete} className="border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Delete</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">Details</h3>
          <div className="space-y-2 text-sm">
            {[
              ['Status', <span key="s" className={`${project.status === 'active' ? 'bg-green-500' : project.status === 'completed' ? 'bg-violet-500' : 'bg-red-500'} text-white px-2 py-0.5 rounded text-xs font-semibold inline-block`}>{project.status}</span>],
              ['Client', project.client_name ? <Link key="c" to={`/clients/${project.client_id}`} className="text-blue-500 hover:underline">{project.client_name}</Link> : '-'],
              ['Start Date', project.start_date || '-'],
              ['End Date', project.end_date || '-'],
              ['Created', project.created_at?.slice(0,10)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-gray-100 dark:border-gray-700/50 pb-1">
                <span className="text-gray-500 dark:text-gray-400 font-medium text-xs">{label}</span>
                <span className="dark:text-gray-200">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">Plans ({project.plans?.length || 0})</h3>
        {project.plans?.length === 0 ? <p className="text-gray-400 dark:text-gray-500 text-sm">No plans for this project</p> : (
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
              {project.plans?.map(t => (
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
