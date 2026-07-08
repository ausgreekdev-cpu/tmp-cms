import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getTMP, deleteTMP, updateTMP, sendTMPEmail } from '../api.js';
import { SkeletonCard } from '../components/Skeleton.jsx';

const statusColors = {
  draft: 'bg-gray-500', submitted: 'bg-amber-500', review: 'bg-orange-500',
  approved: 'bg-green-500', active: 'bg-blue-500', completed: 'bg-violet-500', cancelled: 'bg-red-500'
};

const transitions = {
  draft: ['submitted','cancelled'], submitted: ['review','cancelled'],
  review: ['approved','draft','cancelled'], approved: ['active','cancelled'],
  active: ['completed','cancelled'], completed: [], cancelled: []
};

export default function TMPDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tmp, setTmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailNote, setEmailNote] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState('');

  useEffect(() => { getTMP(id).then(setTmp).finally(() => setLoading(false)); }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this TMP?')) return;
    await deleteTMP(id); navigate('/tmps');
  };

  const handleStatus = async (status) => {
    await updateTMP(id, { ...tmp, status });
    setTmp({ ...tmp, status });
  };

  const handleSendEmail = async () => {
    if (!emailTo) return;
    setEmailSending(true); setEmailResult('');
    try {
      const r = await sendTMPEmail(id, emailTo, emailNote);
      setEmailResult(r.status === 'queued' ? 'Email queued for delivery' : `Failed: ${r.error}`);
      if (r.status === 'queued') { setShowEmail(false); setEmailTo(''); setEmailNote(''); }
    } catch (err) {
      setEmailResult(`Error: ${err.message}`);
    } finally {
      setEmailSending(false);
    }
  };

  if (loading) return <div className="space-y-6"><div className="flex gap-4"><SkeletonCard lines={2} className="flex-1" /><SkeletonCard lines={1} className="w-32" /></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><SkeletonCard lines={10} /><SkeletonCard lines={4} /></div></div>;
  if (!tmp) return <p className="text-red-500">Not found</p>;

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link to="/tmps" className="text-gray-500 dark:text-gray-400 text-sm hover:underline">&larr; Back</Link>
            <span className={`${statusColors[tmp.status]||'bg-gray-500'} text-white px-2.5 py-0.5 rounded text-xs font-semibold`}>{tmp.status}</span>
          </div>
          <h2 className="text-2xl font-bold dark:text-white">{tmp.title}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{tmp.reference}</p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/export/tmps/${id}/pdf`} target="_blank" className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg text-sm font-medium dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">📄 PDF</a>
          <button onClick={() => setShowEmail(true)} className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg text-sm font-medium dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">📧 Email</button>
          <Link to={`/tmps/${id}/edit`} className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg text-sm font-medium dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Edit</Link>
          <button onClick={handleDelete} className="border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Delete</button>
        </div>
      </div>

      {transitions[tmp.status]?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6 items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Transition to:</span>
          {transitions[tmp.status].map(s => (
            <button key={s} onClick={() => handleStatus(s)}
              className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer text-xs font-medium capitalize hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">Details</h3>
          <div className="space-y-2 text-sm">
            {[
              ['Plan Type', tmp.plan_type],
              ['Description', tmp.description || '-'],
              ['Project', tmp.project_name ? <Link key="p" to={`/projects/${tmp.project_id}`} className="text-blue-500 hover:underline">{tmp.project_name}</Link> : '-'],
              ['Site', tmp.site_name ? <Link key="s" to={`/sites/${tmp.site_id}`} className="text-blue-500 hover:underline">{tmp.site_name}</Link> : '-'],
              ['Client', tmp.client_name || '-'],
              ['Created By', tmp.created_by_name || '-'],
              ['Start Date', tmp.start_date || '-'],
              ['End Date', tmp.end_date || '-'],
              ['Created', tmp.created_at?.slice(0,10)],
              ['Updated', tmp.updated_at?.slice(0,10)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-gray-100 dark:border-gray-700/50 pb-1 last:border-0">
                <span className="text-gray-500 dark:text-gray-400 font-medium text-xs">{label}</span>
                <span className="capitalize text-sm dark:text-gray-200">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">Traffic Notes</h3>
          <p className={`text-sm whitespace-pre-wrap ${tmp.traffic_notes ? 'dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>{tmp.traffic_notes || 'No traffic notes'}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">Documents ({tmp.documents?.length || 0})</h3>
        {tmp.documents?.length === 0 ? <p className="text-gray-400 dark:text-gray-500 text-sm">No documents attached</p> : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2 pr-3">Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2 pr-3">Type</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2 pr-3">Size</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {tmp.documents?.map(d => (
                <tr key={d.id} className="border-t border-gray-100 dark:border-gray-700/50">
                  <td className="py-2 pr-3 text-sm dark:text-gray-300">{d.name}</td>
                  <td className="py-2 pr-3 text-xs text-gray-600 dark:text-gray-400">{d.file_type}</td>
                  <td className="py-2 pr-3 text-xs text-gray-600 dark:text-gray-400">{d.file_size ? `${(d.file_size/1024).toFixed(0)} KB` : '-'}</td>
                  <td className="py-2 text-xs text-gray-500 dark:text-gray-400">{d.created_at?.slice(0,10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">Activity Log</h3>
        {tmp.activities?.length === 0 ? <p className="text-gray-400 dark:text-gray-500 text-sm">No activity recorded</p> : (
          <div className="space-y-2">
            {tmp.activities?.map(a => (
              <div key={a.id} className="text-sm py-1.5 border-b border-gray-100 dark:border-gray-700/50 last:border-0 dark:text-gray-300">
                <span className="font-semibold dark:text-gray-200">{a.user_name}</span> — {a.description}
                <span className="text-gray-400 dark:text-gray-500 ml-2 text-xs">{a.created_at}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEmail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowEmail(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Email TMP</h3>
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Recipient *</label>
              <input type="email" value={emailTo} onChange={e => setEmailTo(e.target.value)} placeholder="email@example.com"
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Note (optional)</label>
              <textarea value={emailNote} onChange={e => setEmailNote(e.target.value)} rows={3} placeholder="Add a message..."
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 resize-y" />
            </div>
            {emailResult && <div className={`text-sm mb-3 ${emailResult.includes('queued') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{emailResult}</div>}
            <div className="flex gap-2.5">
              <button onClick={handleSendEmail} disabled={emailSending || !emailTo}
                className="bg-gray-900 dark:bg-gray-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm cursor-pointer disabled:opacity-60 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">
                {emailSending ? 'Sending...' : 'Send Email'}
              </button>
              <button onClick={() => setShowEmail(false)}
                className="border border-gray-300 dark:border-gray-600 px-5 py-2.5 rounded-lg font-medium text-sm cursor-pointer bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
