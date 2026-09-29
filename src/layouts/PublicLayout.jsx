import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { PageFallback } from '../components/ui/PageFallback.jsx';
import { Navbar } from '../components/layout/Navbar.jsx';
import { AnnouncementBar } from '../components/layout/AnnouncementBar.jsx';
import { FloatingContact } from '../components/marketing/FloatingContact.jsx';
import { Footer } from '../components/layout/Footer.jsx';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-glacier-100">
      <AnnouncementBar />
      <Navbar />
      <main id="main" className="flex-1">
        {/* Only the page waits while its code loads; the navbar stays
            mounted, so its menus are never cut off mid-close. */}
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
}