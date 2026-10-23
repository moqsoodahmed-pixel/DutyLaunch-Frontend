import { useEffect } from 'react';
import AppShell from './AppShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { partnerService } from '../services/contentService.js';

export default function DashboardLayout() {
  const { isEmployer, isInstitute } = useAuth();
  const { data: partnerProfile, refetch: refetchPartner } = useApi(
    () => (isInstitute ? partnerService.mine() : Promise.resolve(null)),
    [isInstitute]
  );
  const profile = partnerProfile?._id
    ? partnerProfile
    : partnerProfile?.data?._id
    ? partnerProfile.data
    : null;
  const orgType = profile?.orgType;

  useEffect(() => {
    if (!isInstitute) return;
    const onFocus = () => refetchPartner();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isInstitute, refetchPartner]);

  // Partner institutes navigation
  if (isInstitute) {
    const partnerNavItems = [
      { to: '/partner', label: 'Overview', icon: 'LayoutDashboard', end: true },
      { to: '/partner/profile', label: 'Organization profile', icon: 'Building2', end: true },
      { to: '/partner/higher-education', label: 'Higher Education', icon: 'GraduationCap', end: true },
      { to: '/partner/courses', label: 'Courses & Training', icon: 'BookOpen', end: true },
      { to: '/partner/enrolments', label: 'Enrolments & Orders', icon: 'Users', end: true },
      { to: '/partner/settlements', label: 'Settlements & Payouts', icon: 'Landmark', end: true },
    ];

    return (
      <AppShell
        title="Partner Portal"
        groups={[
          {
            title: 'Partner Portal',
            items: partnerNavItems,
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
        { to: '/profile', label: isEmployer ? 'Employer profile' : 'Profile & resume', icon: 'UserRound' },
        { to: '/payments', label: 'My payments', icon: 'CreditCard' },
        ...(!isEmployer ? [{ to: '/enrolments', label: 'My enrolments', icon: 'GraduationCap' }] : []),
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
            { to: '/resume-builder', label: 'Resume builder', icon: 'FileCheck2' },
            { to: '/resume-templates', label: 'CV Templates', icon: 'LayoutTemplate' },
            { to: '/cover-letter', label: 'Cover letter', icon: 'Mail' },
            { to: '/interview-prep', label: 'Interview prep', icon: 'Lightbulb' },
            { to: '/mock-interview', label: 'Mock interview', icon: 'MessagesSquare' },
            { to: '/my-resumes', label: 'My resumes', icon: 'FileText' },
            { to: '/applications', label: 'Applications', icon: 'FileStack' },
            { to: '/saved-jobs', label: 'Saved jobs', icon: 'Bookmark' },
            { to: '/jobs', label: 'Browse jobs', icon: 'Search' },
            { to: '/assistant', label: 'AI Career Assistant', icon: 'Compass' },
          ],
        },
  ];

  return <AppShell groups={groups} title={isEmployer ? 'Employer' : 'Dashboard'} />;
}