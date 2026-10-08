import { CareerToolPage } from './CareerToolPage.jsx';
import { InterviewStep } from '../../components/studio/StudioSteps.jsx';

export default function InterviewPrep() {
  return (
    <CareerToolPage title="Interview prep" description="Get the 10 questions you are most likely to be asked for a job, with model answers built from your own experience.">
      {({ refreshKey, onDone }) => <InterviewStep refreshKey={refreshKey} onDone={onDone} />}
    </CareerToolPage>
  );
}
