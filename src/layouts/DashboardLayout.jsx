import AppShell from './AppShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardLayout() {
  const { isEmployer, isInstitute } = useAuth();

  // Partner institutes only manage their listing — no job-search or hiring menus.
  if (isInstitute) {
    return (
      <AppShell
        title="Partner"
        groups={[
          {
            title: 'Partner account',
            items: [{ to: '/partner', label: 'Partner profile', icon: 'Building2', end: true }],
          },
        ]}
      />
    );
  }

  const groups = [
    {
      title: 'Your account',
      items: [
        { to: '/dashboard', label: 'Overview', icon: 'LayoutDashboard', end: true },
        { to: '/profile', label: 'Profile & resume', icon: 'UserRound' },
      ],
    },
    isEmployer
      ? {
          title: 'Hiring',
          items: [
            { to: '/employer/jobs', label: 'Your job posts', icon: 'Briefcase' },
            { to: '/employer/jobs/new', label: 'Post a job', icon: 'PlusCircle' },
            { to: '/employer/applications', label: 'Applicants', icon: 'Users' },
          ],
        }
      : {
          title: 'Job search',
          items: [
            { to: '/applications', label: 'Applications', icon: 'FileStack' },
            { to: '/saved-jobs', label: 'Saved jobs', icon: 'Bookmark' },
            { to: '/jobs', label: 'Browse jobs', icon: 'Search' },
            { to: '/assistant', label: 'AI Career Assistant', icon: 'Sparkles' },
          ],
        },
  ];

  return <AppShell groups={groups} title={isEmployer ? 'Employer' : 'Dashboard'} />;
}
