import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { Seo } from '../../components/ui/Seo.jsx';
import { TemplateGallery } from '../../components/cv/TemplateGallery.jsx';
import { CvBuildingExplainer } from '../../components/cv/CvBuildingExplainer.jsx';

/**
 * Authenticated candidate route (/resume-templates) — a dedicated CV
 * Templates workspace in the dashboard, separate from the public marketing
 * page at /cv-templates (which stays untouched; see AppRoutes.jsx).
 *
 * Deliberately reuses the existing <TemplateGallery> component wholesale
 * rather than rebuilding filtering, search, preview or the free/premium
 * payment flow — all of that already exists, is already correct, and
 * duplicating it here would risk a second, divergent implementation of the
 * same access rules. This page only adds the page chrome (header, back
 * link) and the five-step explainer above it.
 */
export default function CvTemplatesPage() {
  return (
    <>
      <Seo title="CV Templates · DutyLaunch" description="Choose a professional, ATS-friendly template for your next application." />

      <PanelHeader
        title="CV Templates"
        description="Choose a professional, ATS-friendly template for your next application."
        actions={
          <Link
            to="/resume-builder"
            className="inline-flex items-center gap-1.5 text-small font-semibold text-azure hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Resume Builder
          </Link>
        }
      />

      <div className="rounded-2xl border border-line bg-white p-6 shadow-crystal sm:p-8">
        <CvBuildingExplainer />
      </div>

      <div className="mt-10">
        <TemplateGallery tone="paper" label="Your templates" title="Pick a template to start your resume." />
      </div>
    </>
  );
}