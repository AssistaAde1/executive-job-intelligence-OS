/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
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
      setJobs([]);
      setIsConnected(false);
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

      const data = {
        job: {
          id: Date.now(),
          title,
          description,
          company_name: companyName,
          geography,
          job_source: jobSource,
          role_category: roleCategory,
          created_at: new Date().toISOString(),
        },
        connected: false,
      };

      setTitle('');
      setCompanyName('');
      setGeography('');
      setJobSource('');
      setRoleCategory('');
      setDescription('');

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
      
      {/* Left Sidebar */}
      <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
        
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>

            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Stored Intelligence
            </h2>
          </div>

          <p className="text-sm text-slate-400">
            Internal Job Repository
          </p>
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
                <div
                  key={job.id}
                  className="p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200"
                >
                  <h3 className="text-sm font-medium text-slate-700">
                    {job.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    {job.company_name
                      ? `${job.company_name} • `
                      : ''}
                    {formatDate(job.created_at)}
                  </p>

                  <div className="mt-2 text-xs text-slate-600 whitespace-pre-wrap">
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
              Status: Local Memory Mode
            </span>

            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>

          </div>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">

        <header className="h-16 px-8 flex items-center justify-between border-b border-slate-200 bg-white">
          
          <h1 className="text-lg font-semibold tracking-tight text-slate-800">
            Executive Job Intelligence
            <span className="text-blue-600 font-mono text-sm ml-1">
              v1.0
            </span>
          </h1>

        </header>

        <div className="flex-1 p-8 flex flex-col gap-8 overflow-y-auto w-full max-w-4xl mx-auto">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col gap-4">

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <div>

                <label
                  htmlFor="title"
                  className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2"
                >
                  Job Title
                </label>

                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mb-4 p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm"
                  placeholder="e.g. VP of Product"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm"
                    placeholder="Company Name"
                  />

                  <input
                    type="text"
                    value={geography}
                    onChange={(e) => setGeography(e.target.value)}
                    className="w-full p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm"
                    placeholder="Geography"
                  />

                  <input
                    type="text"
                    value={jobSource}
                    onChange={(e) => setJobSource(e.target.value)}
                    className="w-full p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm"
                    placeholder="Job Source"
                  />

                  <input
                    type="text"
                    value={roleCategory}
                    onChange={(e) => setRoleCategory(e.target.value)}
                    className="w-full p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm"
                    placeholder="Role Category"
                  />

                </div>

                <textarea
                  id="description"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-64 p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm resize-none"
                  placeholder="Paste job description here..."
                ></textarea>

              </div>

              <div className="flex justify-end mt-2">

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg"
                >
                  {submitting ? 'Ingesting...' : 'Ingest to Intelligence OS'}
                </button>

              </div>

            </form>

          </section>

        </div>

      </main>

    </div>
  );
}
