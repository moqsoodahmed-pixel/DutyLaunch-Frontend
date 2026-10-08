import { CareerToolPage } from './CareerToolPage.jsx';
import { CoverLetterStep } from '../../components/studio/StudioSteps.jsx';

export default function CoverLetter() {
  return (
    <CareerToolPage title="Cover letter" description="Write a cover letter for a specific job, from your saved resume. Edit it, save versions and download it.">
      {({ refreshKey, onDone }) => <CoverLetterStep refreshKey={refreshKey} onDone={onDone} />}
    </CareerToolPage>
  );
}
