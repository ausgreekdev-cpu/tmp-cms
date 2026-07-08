import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTMP, createTMP, updateTMP, getProjects, getSites } from '../api.js';
import { SkeletonCard } from '../components/Skeleton.jsx';

export default function TMPForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [form, setForm] = useState({
    title: '', project_id: '', site_id: '', plan_type: 'temporary',
    description: '', start_date: '', end_date: '', traffic_notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      const [p, s] = await Promise.all([getProjects(), getSites()]);
      setProjects(p); setSites(s);
      if (isEdit) {
        const tmp = await getTMP(id);
        setForm({
          title: tmp.title, project_id: tmp.project_id, site_id: tmp.site_id||'',
          plan_type: tmp.plan_type, description: tmp.description||'',
          start_date: tmp.start_date||'', end_date: tmp.end_date||'',
          traffic_notes: tmp.traffic_notes||''
        });
      }
      setLoadingData(false);
    };
    load();
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.title?.trim()) e.title = 'Title is required';
    if (!form.project_id) e.project_id = 'Project is required';
    if (form.start_date && form.end_date && form.start_date > form.end_date) {
      e.end_date = 'End date must be after start date';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit) {
        await updateTMP(id, form);
        navigate(`/tmps/${id}`);
      } else {
        const tmp = await createTMP(form);
        navigate(`/tmps/${tmp.id}`);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 ${
      errors[field] ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
    }`;

  if (loadingData) return <SkeletonCard lines={12} />;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">{isEdit ? 'Edit TMP' : 'New TMP'}</h2>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Title *</label>
          <input name="title" value={form.title} onChange={handleChange} className={inputClass('title')} />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Project *</label>
            <select name="project_id" value={form.project_id} onChange={handleChange} className={inputClass('project_id')}>
              <option value="">Select project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {errors.project_id && <p className="text-red-500 text-xs mt-1">{errors.project_id}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Site</label>
            <select name="site_id" value={form.site_id} onChange={handleChange} className={inputClass('site_id')}>
              <option value="">Select site</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Plan Type</label>
            <select name="plan_type" value={form.plan_type} onChange={handleChange} className={inputClass('plan_type')}>
              <option value="temporary">Temporary</option><option value="permanent">Permanent</option><option value="event">Event</option><option value="emergency">Emergency</option>
            </select>
          </div>
          <div></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Start Date</label>
            <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className={inputClass('start_date')} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">End Date</label>
            <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className={inputClass('end_date')} />
            {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputClass('description')} />
        </div>
        <div className="mb-5">
          <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Traffic Notes</label>
          <textarea name="traffic_notes" value={form.traffic_notes} onChange={handleChange} rows={4} className={inputClass('traffic_notes')} />
        </div>
        <div className="flex gap-2.5">
          <button type="submit" disabled={loading}
            className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm cursor-pointer disabled:opacity-60 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">
            {loading ? 'Saving...' : isEdit ? 'Update TMP' : 'Create TMP'}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="border border-gray-300 dark:border-gray-600 px-6 py-2.5 rounded-lg font-medium text-sm cursor-pointer bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
