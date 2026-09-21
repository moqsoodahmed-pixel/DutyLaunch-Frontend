import { useState } from 'react';
import { Seo } from '../../components/ui/Seo.jsx';
import { Container, Section } from '../../components/ui/Container.jsx';
import { PageHero } from '../../components/marketing/PageHero.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';

const BANKS = {
  general: [
    'Tell me about yourself.',
    'Why are you looking to leave your current role?',
    'Describe a time you disagreed with your manager.',
    'What is your biggest professional weakness?',
    'Where do you see yourself in three years?',
  ],
  operations: [
    'Walk me through how you would improve a process that keeps missing deadlines.',
    'Tell me about a time you had to manage conflicting priorities across teams.',
    'How do you decide what to escalate versus resolve yourself?',
  ],
  technology: [
    'Walk me through the architecture of a project you are proud of.',
    'How do you approach debugging a production issue under time pressure?',
    'Tell me about a time you disagreed with a technical decision.',
  ],
  sales: [
    'Walk me through how you built and managed a sales pipeline.',
    'Tell me about a deal you lost and what you learned.',
    'How do you handle a prospect who has gone quiet?',
  ],
};

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'operations', label: 'Operations' },
  { value: 'technology', label: 'Technology' },
  { value: 'sales', label: 'Sales' },
];

export default function InterviewCoach() {
  const [category, setCategory] = useState('general');
  const [open, setOpen] = useState(null);

  return (
    <>
      <Seo title="AI Interview Coach" description="Practice questions by role, with guidance on how to structure a strong answer." />
      <PageHero
        eyebrow="Career Tools"
        title="AI Interview Coach"
        lead="A practice bank of the questions candidates in these roles are actually asked, with structure notes — not scripted answers to memorise."
        breadcrumb={[{ label: 'Career Tools', to: '/ats-resume-checker' }, { label: 'Interview Coach' }]}
      />

      <Section tone="white">
        <Container>
          <Tabs options={CATEGORIES} value={category} onChange={setCategory} label="Filter by role" />

          <ul className="mt-8 space-y-3">
            {BANKS[category].map((q, i) => (
              <li key={q} className="tile overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="text-body font-semibold text-ink">{q}</span>
                  <span className="shrink-0 text-caption font-bold text-azure-600">{open === i ? 'Hide tip' : 'Show tip'}</span>
                </button>
                {open === i && (
                  <p className="border-t border-line bg-paper px-5 py-4 text-small text-slate-600">
                    Structure your answer as: the situation, the action you specifically took, and the measurable
                    result — then connect it back to why it's relevant to the role you're interviewing for.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
