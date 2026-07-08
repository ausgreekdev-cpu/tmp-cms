import React, { useState, useEffect } from 'react';
import { getEmailConfig, updateEmailConfig, testEmail, getEmailLog } from '../api.js';

export default function EmailSettings() {
  const [config, setConfig] = useState({ provider: 'smtp', host: '', port: 587, username: '', password: '', sender_name: 'TMP CMS', sender_email: '', secure: false, enabled: false });
  const [log, setLog] = useState([]);
  const [saving, setSaving] = useState(false);
  const [testTo, setTestTo] = useState('');
  const [testResult, setTestResult] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getEmailConfig().then(c => { if (c && c.id) setConfig(c); });
    getEmailLog().then(setLog);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateEmailConfig(config);
      setConfig({ ...config, ...updated });
      setMessage('Settings saved');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleTest = async () => {
    if (!testTo) return;
    setTestResult('Sending...');
    const r = await testEmail(testTo);
    setTestResult(r.status === 'queued' ? 'Test email queued — check your inbox' : `Failed: ${r.error}`);
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role !== 'admin') return <p className="text-red-500">Access denied. Admin only.</p>;

  const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400";

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Email Settings</h2>

      {message && <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2.5 rounded-lg text-sm mb-4">{message}</div>}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold dark:text-white">Configuration</h3>
          <label className="flex items-center gap-2 text-sm dark:text-gray-300 cursor-pointer">
            <input type="checkbox" checked={config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} className="rounded" />
            Enabled
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Provider</label>
            <select value={config.provider} onChange={e => setConfig({...config, provider: e.target.value})} className={inputClass}>
              <option value="smtp">SMTP (Generic)</option>
              <option value="gmail">Gmail</option>
              <option value="outlook">Outlook / Office 365</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Sender Name</label>
            <input value={config.sender_name || ''} onChange={e => setConfig({...config, sender_name: e.target.value})} className={inputClass} />
          </div>
        </div>

        {config.provider === 'smtp' && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">SMTP Host</label>
              <input value={config.host || ''} onChange={e => setConfig({...config, host: e.target.value})} className={inputClass} placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Port</label>
              <input type="number" value={config.port || 587} onChange={e => setConfig({...config, port: parseInt(e.target.value) || 587})} className={inputClass} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
              {config.provider === 'gmail' ? 'Gmail Address' : config.provider === 'outlook' ? 'Outlook Email' : 'Username'}
            </label>
            <input value={config.username || ''} onChange={e => setConfig({...config, username: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
              {config.provider === 'gmail' ? 'App Password' : config.provider === 'outlook' ? 'Password / App Password' : 'Password'}
            </label>
            <input type="password" value={config.password || ''} onChange={e => setConfig({...config, password: e.target.value})} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Sender Email</label>
            <input value={config.sender_email || ''} onChange={e => setConfig({...config, sender_email: e.target.value})} className={inputClass} placeholder="noreply@example.com" />
          </div>
          {config.provider === 'smtp' && (
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Secure (TLS)</label>
              <select value={config.secure ? 'true' : 'false'} onChange={e => setConfig({...config, secure: e.target.value === 'true'})} className={inputClass}>
                <option value="true">Yes (TLS/SSL)</option>
                <option value="false">No</option>
              </select>
            </div>
          )}
        </div>

        <button onClick={handleSave} disabled={saving}
          className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm cursor-pointer disabled:opacity-60 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {config.enabled && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <h3 className="text-sm font-semibold mb-4 dark:text-white">Test Email</h3>
          <div className="flex gap-3">
            <input type="email" placeholder="Send test to..." value={testTo} onChange={e => setTestTo(e.target.value)}
              className="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900" />
            <button onClick={handleTest}
              className="border border-gray-300 dark:border-gray-600 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Send Test
            </button>
          </div>
          {testResult && <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">{testResult}</p>}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold mb-4 dark:text-white">Email Log (last 50)</h3>
        {log.length === 0 ? <p className="text-gray-400 dark:text-gray-500 text-sm">No emails sent yet</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2 pr-3">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2 pr-3">Recipient</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2 pr-3">Subject</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2 pr-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2">Error</th>
                </tr>
              </thead>
              <tbody>
                {log.map(l => (
                  <tr key={l.id} className="border-t border-gray-100 dark:border-gray-700/50">
                    <td className="py-2 pr-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{l.sent_at?.slice(0,16)}</td>
                    <td className="py-2 pr-3 dark:text-gray-300">{l.recipient}</td>
                    <td className="py-2 pr-3 dark:text-gray-300 max-w-[200px] truncate">{l.subject}</td>
                    <td className="py-2 pr-3"><span className={`${l.status === 'sent' ? 'bg-green-500' : 'bg-red-500'} text-white px-2 py-0.5 rounded text-xs font-semibold inline-block`}>{l.status}</span></td>
                    <td className="py-2 text-xs text-red-500 max-w-[200px] truncate">{l.error || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
