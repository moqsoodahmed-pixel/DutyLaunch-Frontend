import { useState } from 'react';
import { Copy } from 'lucide-react';
import { Seo } from '../../components/ui/Seo.jsx';
import { Container, Section } from '../../components/ui/Container.jsx';
import { PageHero } from '../../components/marketing/PageHero.jsx';
import { Input } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

/** Builds a draft from the candidate's own profile fields — never invents experience. */
function buildDraft({ name, currentRole, years, skills, company, role }) {
  const skillLine = skills ? skills.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3).join(', ') : null;
  return `Dear Hiring Manager,

I am writing to apply for the ${role || '[Role]'} position at ${company || '[Company]'}. ${
    currentRole ? `I currently work as a ${currentRole}${years ? ` with ${years} years of experience` : ''}, ` : ''
  }and I believe my background is well suited to this role.

${
    skillLine
      ? `Over the course of my career I have developed strong skills in ${skillLine}, which I have applied directly to the kind of work this role involves.`
      : 'Over the course of my career I have built skills directly relevant to the kind of work this role involves.'
  } I am particularly drawn to ${company || 'this company'} because of the opportunity to take on greater responsibility and contribute from day one.

I would welcome the opportunity to discuss how my experience aligns with your team's needs. Thank you for considering my application.

Sincerely,
${name || '[Your name]'}`;
}

export default function CoverLetter() {
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user?.name || '',
    currentRole: user?.profile?.currentRole || '',
    years: user?.profile?.experienceYears || '',
    skills: (user?.profile?.skills || []).join(', '),
    company: '',
    role: '',
  });
  const [draft, setDraft] = useState('');

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <>
      <Seo title="Cover Letter Assistant" description="Generate a first draft cover letter from your profile and a target role." />
      <PageHero
        eyebrow="Career Tools"
        title="Cover Letter Assistant"
        lead="A first draft built from your own profile details and a role you paste in — adjust it before you send it, this is a starting point, not a finished letter."
        breadcrumb={[{ label: 'Career Tools', to: '/ats-resume-checker' }, { label: 'Cover Letter' }]}
      />

      <Section tone="white">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12">
            <form
              className="tile space-y-5 p-6 lg:col-span-5"
              onSubmit={(e) => {
                e.preventDefault();
                setDraft(buildDraft(form));
              }}
            >
              <Input label="Your name" value={form.name} onChange={update('name')} />
              <Input label="Current role" value={form.currentRole} onChange={update('currentRole')} />
              <Input label="Years of experience" type="number" min="0" value={form.years} onChange={update('years')} />
              <Input label="Key skills" hint="Comma separated" value={form.skills} onChange={update('skills')} />
              <Input label="Target company" value={form.company} onChange={update('company')} />
              <Input label="Target role" value={form.role} onChange={update('role')} />
              <Button type="submit" fullWidth>
                Generate draft
              </Button>
            </form>

            <div className="lg:col-span-7">
              {!draft && (
                <div className="tile p-6 text-small text-slate-600">
                  Fill in the form and your draft cover letter will appear here.
                </div>
              )}
              {draft && (
                <div className="tile p-6">
                  <div className="flex items-center justify-between">
                    <p className="eyebrow">Draft</p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(draft);
                        toast?.success ? toast.success('Copied to clipboard') : null;
                      }}
                      className="inline-flex items-center gap-1.5 text-caption font-semibold text-azure-600 hover:underline"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                      Copy
                    </button>
                  </div>
                  <pre className="mt-4 whitespace-pre-wrap font-sans text-small leading-relaxed text-slate-700">{draft}</pre>
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
