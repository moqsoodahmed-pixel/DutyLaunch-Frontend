/**
 * Abstract layout previews for the CV formats DutyLaunch writes in.
 *
 * These are drawn as SVG structure — rules, blocks and column shapes — rather
 * than rendered sample CVs. That is deliberate: a gallery of realistic-looking
 * resumes would mean inventing candidate names, employers and achievements,
 * and putting invented logos on the page. The shape of the document is the
 * part that is actually being chosen here, so the shape is what is shown.
 *
 * Every layout below is single-column in its text flow (the "sidebar" variants
 * keep body content in one parseable column) because multi-column text is the
 * most common reason a CV is mis-read by an applicant tracking system.
 */

const INK = 'var(--tpl-ink, #0f1f3d)';
const ACCENT = 'var(--tpl-accent, #2563eb)';
const MUTED = 'var(--tpl-muted, #cbd5e1)';
const FAINT = 'var(--tpl-faint, #e2e8f0)';

/** A run of body-copy rules. */
function Lines({ x, y, width, count = 3, gap = 7, color = MUTED, last = 0.62 }) {
  return Array.from({ length: count }).map((_, i) => (
    <rect
      key={i}
      x={x}
      y={y + i * gap}
      width={i === count - 1 ? width * last : width}
      height={2.6}
      rx={1.3}
      fill={color}
    />
  ));
}

/** A section heading rule plus its underline. */
function Heading({ x, y, width = 40, color = INK, rule = false, ruleWidth }) {
  return (
    <>
      <rect x={x} y={y} width={width} height={4} rx={2} fill={color} />
      {rule && <rect x={x} y={y + 7} width={ruleWidth ?? width * 2.6} height={1} fill={FAINT} />}
    </>
  );
}

function Classic() {
  return (
    <>
      <rect x={22} y={18} width={76} height={7} rx={3.5} fill={INK} />
      <rect x={22} y={30} width={52} height={3.5} rx={1.75} fill={ACCENT} />
      <rect x={22} y={40} width={116} height={1} fill={FAINT} />
      <Heading x={22} y={50} rule ruleWidth={116} />
      <Lines x={22} y={64} width={116} count={3} />
      <Heading x={22} y={92} rule ruleWidth={116} />
      <Lines x={22} y={106} width={116} count={4} />
      <Heading x={22} y={142} rule ruleWidth={116} />
      <Lines x={22} y={156} width={116} count={3} />
    </>
  );
}

function SidebarLeft() {
  return (
    <>
      <rect x={0} y={0} width={54} height={220} fill={INK} />
      <circle cx={27} cy={30} r={12} fill="#ffffff" opacity={0.18} />
      <Lines x={12} y={52} width={30} count={2} color="#ffffff" />
      <rect x={12} y={74} width={22} height={3} rx={1.5} fill={ACCENT} />
      <Lines x={12} y={84} width={30} count={4} color="#ffffff" />
      <rect x={12} y={120} width={22} height={3} rx={1.5} fill={ACCENT} />
      <Lines x={12} y={130} width={30} count={3} color="#ffffff" />

      <rect x={68} y={20} width={70} height={7} rx={3.5} fill={INK} />
      <rect x={68} y={32} width={48} height={3.5} rx={1.75} fill={ACCENT} />
      <Heading x={68} y={48} rule ruleWidth={72} />
      <Lines x={68} y={62} width={72} count={3} />
      <Heading x={68} y={90} rule ruleWidth={72} />
      <Lines x={68} y={104} width={72} count={4} />
      <Heading x={68} y={140} rule ruleWidth={72} />
      <Lines x={68} y={154} width={72} count={3} />
    </>
  );
}

function Banner() {
  return (
    <>
      <rect x={0} y={0} width={160} height={46} fill={INK} />
      <rect x={20} y={14} width={72} height={7} rx={3.5} fill="#ffffff" />
      <rect x={20} y={26} width={50} height={3.5} rx={1.75} fill={ACCENT} />
      <Heading x={20} y={62} rule ruleWidth={120} />
      <Lines x={20} y={76} width={120} count={3} />
      <Heading x={20} y={104} rule ruleWidth={120} />
      <Lines x={20} y={118} width={120} count={4} />
      <Heading x={20} y={154} rule ruleWidth={120} />
      <Lines x={20} y={168} width={120} count={2} />
    </>
  );
}

function TwoTone() {
  return (
    <>
      <rect x={0} y={0} width={160} height={4} fill={ACCENT} />
      <rect x={20} y={20} width={80} height={7} rx={3.5} fill={INK} />
      <rect x={20} y={32} width={54} height={3.5} rx={1.75} fill={ACCENT} />
      <rect x={20} y={46} width={120} height={22} rx={3} fill={FAINT} opacity={0.75} />
      <Heading x={20} y={82} />
      <Lines x={20} y={94} width={120} count={4} />
      <rect x={20} y={130} width={58} height={34} rx={3} fill={FAINT} opacity={0.6} />
      <rect x={82} y={130} width={58} height={34} rx={3} fill={FAINT} opacity={0.6} />
      <Lines x={20} y={174} width={120} count={2} />
    </>
  );
}

function Compact() {
  return (
    <>
      <rect x={20} y={18} width={66} height={6} rx={3} fill={INK} />
      <rect x={20} y={28} width={44} height={3} rx={1.5} fill={ACCENT} />
      <rect x={20} y={38} width={120} height={1} fill={FAINT} />
      <Heading x={20} y={46} width={32} />
      <Lines x={20} y={56} width={120} count={2} gap={6} />
      <Heading x={20} y={76} width={32} />
      <Lines x={20} y={86} width={120} count={3} gap={6} />
      <Heading x={20} y={112} width={32} />
      <Lines x={20} y={122} width={120} count={3} gap={6} />
      <Heading x={20} y={148} width={32} />
      <Lines x={20} y={158} width={120} count={3} gap={6} />
    </>
  );
}

function Executive() {
  return (
    <>
      <rect x={20} y={18} width={90} height={8} rx={4} fill={INK} />
      <rect x={20} y={31} width={60} height={3.5} rx={1.75} fill={ACCENT} />
      <rect x={20} y={44} width={120} height={2} fill={INK} />
      <rect x={20} y={54} width={120} height={26} rx={3} fill={FAINT} opacity={0.7} />
      <Heading x={20} y={92} width={44} rule ruleWidth={120} />
      <Lines x={20} y={106} width={120} count={3} />
      <rect x={20} y={136} width={4} height={38} rx={2} fill={ACCENT} />
      <Lines x={32} y={138} width={108} count={4} />
    </>
  );
}

const LAYOUTS = {
  classic: Classic,
  sidebar: SidebarLeft,
  banner: Banner,
  twoTone: TwoTone,
  compact: Compact,
  executive: Executive,
};

export function ResumeTemplatePreview({ layout = 'classic', className }) {
  const Layout = LAYOUTS[layout] || Classic;
  return (
    <svg
      viewBox="0 0 160 220"
      role="img"
      aria-label={`${layout} CV layout preview`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect width={160} height={220} fill="#ffffff" />
      <Layout />
    </svg>
  );
}

export const TEMPLATE_LAYOUTS = Object.keys(LAYOUTS);