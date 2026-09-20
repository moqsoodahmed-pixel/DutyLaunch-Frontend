/**
 * Two small charts drawn as plain SVG. A charting library would add ~90kB to
 * the bundle for two figures that need no interactivity, so they are hand
 * drawn and given text alternatives for screen readers.
 */
import { formatDate } from '../../utils/format.js';

export function TrendChart({ data = [], label = 'Trend', height = 140 }) {
  if (!data.length) {
    return (
      <p className="flex h-[140px] items-center justify-center text-small text-slate-500">
        No data in this period yet.
      </p>
    );
  }

  const width = 560;
  const pad = { top: 12, right: 4, bottom: 20, left: 4 };
  const max = Math.max(...data.map((d) => d.count), 1);
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => [pad.left + i * step, pad.top + innerH - (d.count / max) * innerH]);
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${points[points.length - 1][0].toFixed(1)} ${pad.top + innerH} L${points[0][0].toFixed(1)} ${
    pad.top + innerH
  } Z`;

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <figure>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[140px] w-full"
        role="img"
        aria-label={`${label}: ${total} in total over ${data.length} days, peak ${max} in a day.`}
        preserveAspectRatio="none"
      >
        <line
          x1={pad.left}
          x2={width - pad.right}
          y1={pad.top + innerH}
          y2={pad.top + innerH}
          stroke="#E2E8F1"
          strokeWidth="1"
        />
        <path d={area} fill="#1E45B8" fillOpacity="0.07" />
        <path d={line} fill="none" stroke="#1E45B8" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.length <= 31 &&
          points.map(([x, y], i) => (
            <circle key={data[i].date} cx={x} cy={y} r="2.5" fill="#1E45B8">
              <title>{`${formatDate(data[i].date)} · ${data[i].count}`}</title>
            </circle>
          ))}
      </svg>
      <figcaption className="mt-2 flex justify-between text-caption text-slate-500">
        <span>{formatDate(data[0].date)}</span>
        <span className="tabular font-semibold text-ink">{total} total</span>
        <span>{formatDate(data[data.length - 1].date)}</span>
      </figcaption>
    </figure>
  );
}

const BAR_COLORS = {
  submitted: '#4A78F5',
  'under-review': '#D98A15',
  shortlisted: '#1E45B8',
  interviewing: '#17369A',
  offered: '#0F7A5A',
  rejected: '#B3261E',
  withdrawn: '#93A1B5',
};

export function BreakdownBars({ data = [], labelKey = 'status', emptyLabel = 'Nothing recorded yet.' }) {
  if (!data.length) return <p className="py-6 text-small text-slate-500">{emptyLabel}</p>;
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <ul className="space-y-3">
      {data.map((row) => {
        const name = row[labelKey] || 'Uncategorised';
        return (
          <li key={name}>
            <div className="flex items-baseline justify-between gap-3 text-small">
              <span className="capitalize text-slate-700">{String(name).replace(/-/g, ' ')}</span>
              <span className="tabular font-semibold text-ink">{row.count}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-xs bg-slate-100">
              <div
                className="h-full rounded-xs"
                style={{
                  width: `${Math.max((row.count / max) * 100, 2)}%`,
                  background: BAR_COLORS[name] || '#2B4870',
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
