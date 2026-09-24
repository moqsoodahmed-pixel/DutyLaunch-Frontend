import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Briefcase, CheckCircle2, Users, FileText } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { PageHero, HeroActions } from '../components/marketing/PageHero.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { DataTable } from '../components/admin/DataTable.jsx';
import { StatusBadge } from '../components/ui/Badge.jsx';
import { Input, Textarea, FormField } from '../components/ui/Field.jsx';
import { useApi } from '../hooks/useApi.js';
import { employerService } from '../services/jobService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { relativeTime } from '../utils/format.js';
import { images } from '../data/images.js';
import { SiteImage } from '../components/ui/SiteImage.jsx';

const benefits = [
  { icon: Briefcase, title: 'Post roles directly', body: 'No approval delay for routine listings once your account is verified.' },
  { icon: Users, title: 'Manage applicants in one place', body: 'Review CVs, move candidates through stages, and message shortlisted people.' },
  { icon: FileText, title: 'Download candidate resumes', body: 'Every application arrives with a resume file you can open or download.' },
];

function EmployerInfo({ isAuthenticated }) {
  return (
    <>
      <PageHero
        eyebrow="Employer"
        title="Post roles. Review candidates. Hire."
        lead="Register as an employer to publish openings directly to job seekers already working with DutyLaunch on their careers."
        breadcrumb={[{ label: 'Employer' }]}
        actions={
          <HeroActions
            primary={{ label: 'Create an employer account', to: '/register' }}
            // A signed-in visitor is already authenticated, so "Already
            // registered? Sign in" would be redundant — HeroActions already
            // skips rendering a falsy `secondary` cleanly, no empty gap.
            secondary={isAuthenticated ? undefined : { label: 'Already registered? Sign in', to: '/login' }}
          />
        }
        aside={<SiteImage image={images.hiring} priority className="mx-auto lg:ml-auto lg:mr-0" />}
      />
      <Section tone="white">
        <Container>
          <SectionHeader label="Why employers use DutyLaunch" title="A smaller, more prepared candidate pool." />
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="tile p-6">
                <b.icon className="h-6 w-6 text-azure" aria-hidden />
                <h3 className="mt-4 text-body font-bold text-ink">{b.title}</h3>
                <p className="mt-2 text-small text-slate-600">{b.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
      <CTASection
        title="Have a role open right now?"
        body="Register an employer account and post your first listing in a few minutes."
        primary={{ label: 'Create an employer account', to: '/register' }}
        secondary={{ label: 'Contact us instead', to: '/contact' }}
      />
    </>
  );
}

function JobFormModal({ open, onClose, onSaved, job }) {
  const toast = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: job || {
      title: '', company: '', location: '', jobType: 'Full-time', workMode: 'On-site',
      experience: '', category: '', description: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        responsibilities: values.responsibilities ? values.responsibilities.split('\n').filter(Boolean) : [],
        requirements: values.requirements ? values.requirements.split('\n').filter(Boolean) : [],
      };
      if (job?._id) await employerService.updateJob(job._id, payload);
      else await employerService.createJob(payload);
      toast.success(job?._id ? 'Job updated.' : 'Job submitted.');
      reset();
      onSaved();
    } catch (err) {
      toast.error(err?.message || 'Could not save the job.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={job?._id ? 'Edit role' : 'Post a new role'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Job title" required {...register('title', { required: true })} error={errors.title && 'Required'} />
          <Input label="Company" required {...register('company', { required: true })} error={errors.company && 'Required'} />
          <Input label="Location" required {...register('location', { required: true })} error={errors.location && 'Required'} />
          <Input label="Category" {...register('category')} />
        </div>
        <Textarea label="Description" required rows={5} {...register('description', { required: true })} error={errors.description && 'Required'} />
        <Textarea label="Responsibilities (one per line)" {...register('responsibilities')} />
        <Textarea label="Requirements (one per line)" {...register('requirements')} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save role'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function EmployerDashboard() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { data: jobs, loading, error, refetch } = useApi(() => employerService.listJobs(), []);

  return (
    <>
      <PageHero
        eyebrow="Employer"
        title="Your postings"
        lead="Manage the roles you have listed and see how many applications each has received."
        actions={<Button onClick={() => { setEditing(null); setFormOpen(true); }}>Post a new role</Button>}
      />
      <Section tone="white">
        <Container>
          <DataTable
            loading={loading}
            error={error}
            onRetry={refetch}
            rows={jobs}
            empty={{ title: 'No roles posted yet', description: 'Post your first opening to start receiving applications.' }}
            columns={[
              { key: 'title', header: 'Role', primary: true, render: (r) => <span className="font-semibold text-ink">{r.title}</span> },
              { key: 'location', header: 'Location' },
              { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              { key: 'applicationsCount', header: 'Applicants', render: (r) => r.applicationsCount ?? 0 },
              { key: 'createdAt', header: 'Posted', render: (r) => relativeTime(r.createdAt) },
              {
                key: 'actions', header: '', className: 'text-right',
                render: (r) => (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setFormOpen(true); }}>Edit</Button>
                  </div>
                ),
              },
            ]}
          />
        </Container>
      </Section>
      <JobFormModal open={formOpen} job={editing} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); refetch(); }} />
    </>
  );
}

export default function Employer() {
  const { isAuthenticated, isEmployer } = useAuth();

  return (
    <>
      <Seo title="Employer" description="Post job openings and manage applicants on DutyLaunch." />
      {isAuthenticated && isEmployer ? (
        <EmployerDashboard />
      ) : (
        <EmployerInfo isAuthenticated={isAuthenticated} />
      )}
    </>
  );
}