import { useEffect, useMemo, useState } from 'react';
import { Download, Check } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Field.jsx';
import { careerService } from '../../services/careerService.js';
import { printResumeSheet } from '../../utils/printResume.js';
import { cn } from '../../utils/cn.js';
import { COVER_TEMPLATES, DEFAULT_COVER_TEMPLATE, CoverLetterPage, ScaledPage } from './CoverLetterTemplates.jsx';

const STORE_KEY = 'dl_cover_template';

/**
 * "Choose a design" for a generated cover letter: every template shows the
 * candidate's own letter; the chosen one downloads as a one-page A4 PDF.
 */
export function CoverLetterDesigner({ content, company, jobTitle }) {
  const [template, setTemplate] = useState(() => {
    try {
      return localStorage.getItem(STORE_KEY) || DEFAULT_COVER_TEMPLATE;
    } catch {
      return DEFAULT_COVER_TEMPLATE;
    }
  });
  const [personal, setPersonal] = useState({});
  const [hiringManager, setHiringManager] = useState('');
  const [fits, setFits] = useState(true);

  useEffect(() => {
    let active = true;
    careerService
      .getProfile()
      .then((res) => active && setPersonal(res?.master?.personal || {}))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, template);
    } catch {
      /* ignore */
    }
  }, [template]);

  const data = useMemo(
    () => ({
      name: personal.name || '',
      headline: personal.headline || '',
      email: personal.email || '',
      phone: personal.phone || '',
      location: personal.location || '',
      linkedin: personal.linkedin || '',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      company: company || '',
      jobTitle: jobTitle || '',
      hiringManager: hiringManager.trim(),
      // Use the manager's name in the greeting too, if one was entered.
      content: hiringManager.trim() ? content.replace(/^Dear Hiring Manager,/i, `Dear ${hiringManager.trim()},`) : content,
    }),
    [personal, company, jobTitle, hiringManager, content]
  );

  const current = COVER_TEMPLATES.find((t) => t.id === template) || COVER_TEMPLATES[0];
  // Leftover placeholders such as "[Your Name]" or "[Company]".
  const placeholders = [...new Set(String(content || '').match(/\[[^\][\n]{2,40}\]/g) || [])];
  const download = () => printResumeSheet(`Cover_Letter_${(company || data.name || 'DutyLaunch').replace(/[^\w-]+/g, '_')}`);

  return (
    <section aria-label="Cover letter design">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-small text-slate-600">
          Pick a template on the left — the preview on the right shows your letter exactly as it will download.
        </p>
        <Input
          className="w-full sm:w-64"
          label="Hiring manager's name (optional)"
          placeholder="e.g. Ms. Priya Rao"
          value={hiringManager}
          onChange={(e) => setHiringManager(e.target.value)}
        />
      </div>

      {placeholders.length > 0 && (
        <p role="alert" className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-small text-amber-900">
          <strong>Your letter still has text to replace:</strong> {placeholders.slice(0, 4).join(', ')}. Go back to <strong>Write &amp; edit</strong> and replace it before downloading.
        </p>
      )}

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_minmax(0,26rem)]">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4" role="radiogroup" aria-label="Cover letter templates">
          {COVER_TEMPLATES.map((t) => {
            const on = t.id === template;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={`${t.name} template — ${t.note}`}
                onClick={() => setTemplate(t.id)}
                className={cn('group rounded-xl border-2 bg-white p-1.5 text-left transition-all', on ? 'border-azure shadow-crystal' : 'border-line hover:border-azure-300')}
              >
                <div className="overflow-hidden rounded-lg border border-line" aria-hidden="true">
                  <ScaledPage>
                    <CoverLetterPage template={t.id} data={data} />
                  </ScaledPage>
                </div>
                <div className="flex items-center justify-between px-1 pt-1.5">
                  <span className="text-small font-bold text-ink">{t.name}</span>
                  {on && <Check className="h-4 w-4 text-azure" aria-hidden />}
                </div>
                <span className="block px-1 text-caption text-slate-500">{t.note}</span>
              </button>
            );
          })}
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="overflow-hidden rounded-xl border border-line bg-white shadow-crystal">
            <ScaledPage>
              <CoverLetterPage template={current.id} data={data} asSheet onFit={setFits} />
            </ScaledPage>
          </div>
          {!fits && (
            <p role="alert" className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-small text-amber-900">
              Your letter is too long for one page. Shorten it a little in the editor above (aim for 250–400 words).
            </p>
          )}
          <Button className="mt-4" size="lg" fullWidth onClick={download}>
            <Download className="h-5 w-5" aria-hidden /> Download {current.name} PDF
          </Button>
          <p className="mt-2 text-caption text-slate-500">
            In the print window, choose <strong>Save as PDF</strong>. Your name and contact details come from your saved resume — update them in the Resume Builder.
          </p>
        </div>
      </div>
    </section>
  );
}