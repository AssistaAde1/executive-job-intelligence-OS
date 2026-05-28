import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

type Job = {
  id: string;
  title: string;
  description: string;
  company_name?: string;
  geography?: string;
  job_source?: string;
  role_category?: string;
  created_at: string;
  match_score?: number | null;
  ats_score?: number | null;
  leadership_score?: number | null;
  risk_score?: number | null;
  recommendation?: string | null;
  analysis?: string | null;
  status?: string | null;
};

type Profile = {
  id: string;
  profile_name: string;
  summary?: string;
  executive_summary?: string;
  industries?: string;
  skills?: string;
  leadership_themes?: string;
  achievements?: string;
  constraints?: string;
  preferred_geographies?: string;
  work_modes?: string;
  associated_titles?: string;
  strategic_keywords?: string;
  primary_function?: string;
  adjacency_functions?: string;
  created_at?: string;
};

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [analyzingJobId, setAnalyzingJobId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [geography, setGeography] = useState('');
  const [jobSource, setJobSource] = useState('');
  const [roleCategory, setRoleCategory] = useState('');
  const [description, setDescription] = useState('');
  const [resumeText, setResumeText] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);

      if (!supabase) {
        throw new Error('Supabase environment variables are missing.');
      }

      const jobsResult = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobsResult.error) throw jobsResult.error;

      const profilesResult = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesResult.error) throw profilesResult.error;

      setJobs(jobsResult.data || []);
      setProfiles(profilesResult.data || []);

      if (profilesResult.data && profilesResult.data.length > 0) {
        setSelectedProfileId(profilesResult.data[0].id);
      }

      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) return;

    try {
      setSubmitting(true);

      if (!supabase) {
        throw new Error('Supabase environment variables are missing.');
      }

      const { data, error } = await supabase
        .from('jobs')
        .insert([
          {
            title,
            description,
            company_name: companyName,
            geography,
            job_source: jobSource,
            role_category: roleCategory,
            status: 'Ingested',
          },
        ])
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

  const analyzeJob = async (job: Job) => {
    try {
      if (!supabase) {
        throw new Error('Supabase environment variables are missing.');
      }

      const selectedProfile = profiles.find(
        (profile) => profile.id === selectedProfileId
      );

      if (!selectedProfile) {
        throw new Error('Please select a profile first.');
      }

      if (!resumeText.trim()) {
        throw new Error('Please paste resume evidence before analyzing.');
      }

      setAnalyzingJobId(job.id);

      const { data, error } = await supabase.functions.invoke('analyze-job', {
        body: {
          job_id: job.id,
          title: job.title,
          company_name: job.company_name || '',
          geography: job.geography || '',
          role_category: job.role_category || '',
          job_source: job.job_source || '',
          description: job.description || '',
          profile: selectedProfile,
          resume_text: resumeText,
        },
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Analysis failed.');
      }

      const result = data.result;

      const { data: updatedJob, error: updateError } = await supabase
        .from('jobs')
        .update({
          match_score: result.match_score,
          ats_score: result.ats_score,
          leadership_score: result.leadership_score,
          risk_score: result.risk_score,
          recommendation: result.recommendation,
          analysis: result.analysis,
          status:
            result.match_score >= 80
              ? 'Strong Match'
              : result.match_score >= 70
              ? 'Eligible'
              : 'Scored',
        })
        .eq('id', job.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setJobs((prev) =>
        prev.map((item) => (item.id === job.id ? updatedJob : item))
      );

      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze job.');
    } finally {
      setAnalyzingJobId(null);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(isoString));
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Stored Intelligence
          </h2>
          <p className="text-sm text-slate-400">Internal Job Repository</p>

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Candidate Intelligence Vault
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Profiles loaded: {profiles.length}
            </p>

            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="mt-2 w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-xs"
            >
              {profiles.length === 0 ? (
                <option value="">No profiles found</option>
              ) : (
                profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.profile_name || 'Unnamed Profile'}
                  </option>
                ))
              )}
            </select>
          </div>
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
                <h3 className="text-sm font-medium text-slate-700">
                  {job.title}
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  {job.company_name ? `${job.company_name} • ` : ''}
                  {formatDate(job.created_at)}
                </p>

                {job.match_score !== null && job.match_score !== undefined && (
                  <div className="mt-3 rounded-md bg-slate-50 border border-slate-200 p-2">
                    <p className="text-xs font-semibold text-slate-800">
                      Match: {job.match_score}% · {job.recommendation || 'Scored'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      ATS: {job.ats_score ?? '-'} · Leadership:{' '}
                      {job.leadership_score ?? '-'} · Risk:{' '}
                      {job.risk_score ?? '-'}
                    </p>
                  </div>
                )}

                {job.analysis && (
                  <p className="mt-2 text-[11px] text-slate-600 leading-relaxed">
                    {job.analysis}
                  </p>
                )}

                <p className="mt-2 text-xs text-slate-600 whitespace-pre-wrap">
                  {job.description}
                </p>

                <button
                  type="button"
                  onClick={() => analyzeJob(job)}
                  disabled={analyzingJobId === job.id || profiles.length === 0}
                  className="mt-3 w-full rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {analyzingJobId === job.id ? 'Analyzing...' : 'Analyze Match'}
                </button>
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
              v2.2-resume-evidence
            </span>
          </h1>
        </header>

        <div className="flex-1 p-8 flex flex-col gap-8 overflow-y-auto w-full max-w-5xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                Job Ingestion
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Paste the job description first. Save it into the intelligence repository.
              </p>
            </div>

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
                className="w-full h-52 p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm resize-none"
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

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                Resume Evidence
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Paste the canonical resume evidence here before running Analyze Match.
              </p>
            </div>

            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full h-72 p-4 rounded-lg border border-slate-200 bg-slate-50 text-sm resize-none"
              placeholder="Paste resume text here..."
            />

            <p className="text-xs text-slate-400 mt-2">
              Current evidence length: {resumeText.trim().length} characters
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
