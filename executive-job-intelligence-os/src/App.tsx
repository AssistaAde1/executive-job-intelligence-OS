import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Job } from './types.ts';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);

      if (!supabase) {
        throw new Error('Supabase environment variables are missing.');
      }

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setJobs(data || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs.');
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

      if (!supabase) {
        throw new Error('Supabase environment variables are missing.');
      }

      const newJob = {
        title,
        description,
        company_name: companyName,
        geography,
        job_source: jobSource,
        role_category: roleCategory,
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert([newJob])
        .select()
        .single();

      if (error) throw error;

      setJobs((prev) => [data, ...prev]);

      setTitle('');
      setCompanyName('');
      setGeography('');
      setJobSource('');
      setRoleCategory('');
      setDescription('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to save job.');
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
      <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Stored Intelligence
          </h2>
          <p className="text-sm text-slate-400">Internal Job Repository</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
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
              <div key={job.id} className="p-3 rounded-lg border mb-2 bg-white">
                <h3 className="text-sm font-medium text-slate-700">{job.title}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {job.company_name ? `${job.company_name} • ` : ''}
                  {formatDate(job.created_at)}
                </p>
                <div className="mt-2 text-xs text-slate-600 whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
            Status: Connected to Supabase
          </span>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-8 flex items-center border-b border-slate-200 bg-white">
          <h1 className="text-lg font-semibold tracking-tight text-slate-800">
            Executive Job Intelligence
            <span className="text-blue-600 font-mono text-sm ml-1">
              v2.0-supabase
            </span>
          </h1>
        </header>

        <div className="flex-1 p-8 flex flex-col gap-8 overflow-y-auto w-full max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm"
                placeholder="Job Title"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-64 p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm resize-none"
                placeholder="Paste job description here..."
              />

              <button
                type="submit"
                disabled={submitting}
                className="self-end px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Ingest to Intelligence OS'}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
