import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { JobCard } from '../../components/jobs/JobCard.jsx';
import { CardSkeleton, EmptyState, ErrorState } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { jobService } from '../../services/jobService.js';

export default function SavedJobs() {
  const { data, loading, error, refetch } = useApi(() => jobService.savedJobs(), []);
  const toast = useToast();

  const unsave = async (job) => {
    try {
      await jobService.toggleSaved(job._id);
      toast.success('Removed from saved jobs');
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <PanelHeader title="Saved jobs" description="Roles you have bookmarked to come back to." />

      {loading && <CardSkeleton count={3} />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && !error && !data?.length && (
        <EmptyState
          title="Nothing saved yet"
          description="Bookmark a role from its listing and it will show up here."
          icon={Bookmark}
          action={
            <Link to="/jobs" className="text-small font-semibold text-azure hover:underline">
              Browse jobs
            </Link>
          }
        />
      )}
      {!loading && data?.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((job) => (
            <JobCard key={job._id} job={job} saved onToggleSave={unsave} />
          ))}
        </div>
      )}
    </>
  );
}
