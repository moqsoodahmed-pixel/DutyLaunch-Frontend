import AppShell from './AppShell.jsx';

const groups = [
  {
    title: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: 'LayoutDashboard', end: true }],
  },
  {
    title: 'Enquiries',
    items: [
      { to: '/admin/consultations', label: 'Consultations', icon: 'CalendarCheck' },
      { to: '/admin/messages', label: 'Messages', icon: 'Mail' },
    ],
  },
  {
    title: 'Marketplace',
    items: [
      { to: '/admin/jobs', label: 'Jobs', icon: 'Briefcase' },
      { to: '/admin/applications', label: 'Applications', icon: 'FileStack' },
      { to: '/admin/users', label: 'Users', icon: 'Users' },
    ],
  },
  {
    title: 'Content',
    items: [
      { to: '/admin/blogs', label: 'Articles', icon: 'Newspaper' },
      { to: '/admin/courses', label: 'Courses', icon: 'GraduationCap' },
      { to: '/admin/faqs', label: 'FAQs', icon: 'HelpCircle' },
      { to: '/admin/testimonials', label: 'Testimonials', icon: 'Quote' },
    ],
  },
];

export default function AdminLayout() {
  return <AppShell groups={groups} title="Admin" />;
}
