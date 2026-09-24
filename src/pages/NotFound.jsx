import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { Button } from '../components/ui/Button.jsx';
import { images } from '../data/images.js';
import { SiteImage } from '../components/ui/SiteImage.jsx';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" description="The page you are looking for does not exist." />
      <Section tone="white">
        <Container className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center sm:py-20">
          {/* Width is set on the wrapper: SiteImage's inline max-width (the
              file's native size) would override a max-w class on it. */}
          <div className="mb-8 w-full max-w-[30rem]">
            <SiteImage image={images.notFound} priority />
          </div>
          <p className="text-caption font-semibold text-azure">404</p>
          <h1 className="mt-3 text-h1 font-extrabold text-ink">That page has moved or never existed.</h1>
          <p className="mt-3 max-w-md text-lead text-slate-600">
            Check the address, or head back to the homepage and find your way from there.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/">Go to homepage</Button>
            <Button to="/contact" variant="outline">Contact us</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}