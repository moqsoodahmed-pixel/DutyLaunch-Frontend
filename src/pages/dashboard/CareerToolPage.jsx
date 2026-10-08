import { useState } from 'react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { LoadingBlock, EmptyState } from '../../components/ui/States.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useApi } from '../../hooks/useApi.js';
import { careerService } from '../../services/careerService.js';

/**
 * Shared shell for Cover letter and Interview prep. Both work from the
 * resume the candidate saved to their profile in the Resume Builder.
 */
export function CareerToolPage({ title, description, children }) {
  const { data, loading } = useApi(() => careerService.getProfile(), []);
  const [refreshKey, setRefreshKey] = useState(0);
  const hasProfile = Boolean(data?.exists && data?.master);

  return (
    <>
      <PanelHeader title={title} description={description} />
      {loading && <LoadingBlock label="Loading your profile" />}
      {!loading && !hasProfile && (
        <EmptyState
          title="Build your resume first"
          description="This tool writes from your saved resume. Build it in the Resume Builder, then choose “Save to my profile” on the last step."
          action={<Button to="/resume-builder">Build my resume</Button>}
        />
      )}
      {!loading && hasProfile && children({ refreshKey, onDone: () => setRefreshKey((k) => k + 1) })}
    </>
  );
}
