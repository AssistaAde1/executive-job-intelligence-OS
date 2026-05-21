/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Briefcase, Loader2, Database, AlertCircle } from 'lucide-react';
import { Job } from './types.ts';

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [geography, setGeography] = useState('');
  const [jobSource, setJobSource] = useState('');
  const [roleCategory, setRoleCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch jobs');
      }

      setJobs(data.jobs);
      setIsConnected(data.connected);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description, 
          company_name: companyName,
          geography,
          job_source: jobSource,
          role_category: roleCategory
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add job');
      }

      setTitle('');
      setCompanyName('');
      setGeography('');
      setJobSource('');
      setRoleCategory('');
      setDescription('');
      
      // Update local state and connection status
      setJobs((prev) => [data.job, ...prev]);
      setIsConnected(data.connected);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Left Sidebar: Job Library */}
      <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Stored Intelligence</h2>
          </div>
          <p className="text-sm text-slate-400">Internal Job Repository</p>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="space-y-1">
            {loading ? (
              <div className="py-8 flex justify-center text-slate-400">
                <Loader2 size={16} className="animate-spin" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No job profiles stored yet.
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-colors group">
                  <h3 className="text-sm font-medium text-slate-700">{job.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {job.company_name ? `${job.company_name} • ` : ''}{formatDate(job.created_at)}
                  </p>
                  {(job.role_category || job.geography || job.job_source) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.role_category && <span className="px-1.5 py-0.5 bg-slate-100 text-[10px] text-slate-600 rounded">{job.role_category}</span>}
                      {job.geography && <span className="px-1.5 py-0.5 bg-slate-100 text-[10px] text-slate-600 rounded">{job.geography}</span>}
                      {job.job_source && <span className="px-1.5 py-0.5 bg-slate-100 text-[10px] text-slate-600 rounded">{job.job_source}</span>}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-slate-600 line-clamp-3 hidden group-hover:line-clamp-none group-hover:block whitespace-pre-wrap">
                    {job.description}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
              Status: {isConnected ? 'Connected to Supabase' : 'Local Memory Mode'}
            </span>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
          </div>
        </div>
      </aside>

      {/* Main Content: Intake & Editor */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 px-8 flex items-center justify-between border-b border-slate-200 bg-white min-h-[64px] shrink-0">
          <h1 className="text-lg font-semibold tracking-tight text-slate-800">
            Executive Job Intelligence <span className="text-blue-600 font-mono text-sm ml-1">v1.0</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-slate-100 rounded text-[11px] font-medium text-slate-600 uppercase tracking-wide">Phase 1 Minimal</div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 flex flex-col gap-8 overflow-y-auto w-full max-w-4xl mx-auto">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Input Form */}
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col gap-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="title" className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Job Title</label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mb-4 p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g. VP of Product"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="companyName" className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Company Name</label>
                    <input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div>
                    <label htmlFor="geography" className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Geography</label>
                    <input
                      id="geography"
                      type="text"
                      value={geography}
                      onChange={(e) => setGeography(e.target.value)}
                      className="w-full p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                  <div>
                    <label htmlFor="jobSource" className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Job Source</label>
                    <input
                      id="jobSource"
                      type="text"
                      value={jobSource}
                      onChange={(e) => setJobSource(e.target.value)}
                      className="w-full p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="e.g. LinkedIn"
                    />
                  </div>
                  <div>
                    <label htmlFor="roleCategory" className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Role Category</label>
                    <input
                      id="roleCategory"
                      type="text"
                      value={roleCategory}
                      onChange={(e) => setRoleCategory(e.target.value)}
                      className="w-full p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="e.g. Engineering"
                    />
                  </div>
                </div>

                <label htmlFor="description" className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Paste Job Description</label>
                <textarea 
                  id="description"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-64 p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none leading-relaxed"
                  placeholder="Paste raw text from LinkedIn, Indeed, or PDF here..."
                ></textarea>
              </div>
              <div className="flex justify-end mt-2">
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  {submitting ? 'Ingesting...' : 'Ingest to Intelligence OS'}
                </button>
              </div>
            </form>
          </section>

          {/* Setup Instruction Widget (shown when NOT connected) */}
          {!isConnected && !loading && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border border-slate-200 rounded-lg bg-white">
                <h4 className="text-[10px] font-mono text-blue-600 uppercase mb-2">Step 1</h4>
                <p className="text-xs font-medium text-slate-800">Setup Supabase</p>
                <p className="text-[11px] text-slate-500 mt-1">Create a table named "jobs" with columns: id, title, description, created_at.</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg bg-white">
                <h4 className="text-[10px] font-mono text-blue-600 uppercase mb-2">Step 2</h4>
                <p className="text-xs font-medium text-slate-800">Link Environment</p>
                <p className="text-[11px] text-slate-500 mt-1">Add your SUPABASE_URL and SUPABASE_ANON_KEY to the AI Studio Secrets panel.</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg bg-white">
                <h4 className="text-[10px] font-mono text-blue-600 uppercase mb-2">Step 3</h4>
                <p className="text-xs font-medium text-slate-800">Restart Server</p>
                <p className="text-[11px] text-slate-500 mt-1">Restart your backend server to securely connect to the remote database.</p>
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
