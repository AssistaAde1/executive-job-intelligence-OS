export interface Job {
  id: number;
  title: string;
  company_name?: string;
  geography?: string;
  job_source?: string;
  role_category?: string;
  description: string;
  created_at: string;
}
