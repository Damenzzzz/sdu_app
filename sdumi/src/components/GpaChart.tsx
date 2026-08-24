import type { TermGPA } from "../sdu/grades";

// Compact GPA-over-terms line chart (SVG, single series, 0–4 scale).
export function GpaChart({ data }: { data: TermGPA[] }) {
  const w = 560;
  const h = 180;
  const padX = 34;
  const padY = 24;
  const min = 0;
  const max = 4;

  const x = (i: number) => padX + (i * (w - 2 * padX)) / Math.max(1, data.length - 1);
  const y = (g: number) => h - padY - ((g - min) / (max - min)) * (h - 2 * padY);

  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.gpa)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${h - padY} L${x(0)},${h - padY} Z`;
  const shortLabel = (l: string) => l.replace(/[()]/g, "").replace(/\s+/g, " ").trim().slice(0, 12);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label="GPA by term">
      <defs>
        <linearGradient id="gpaLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-2)" />
        </linearGradient>
        <linearGradient id="gpaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(124,108,255,0.28)" />
          <stop offset="100%" stopColor="rgba(124,108,255,0)" />
        </linearGradient>
      </defs>

      {/* gridlines + y labels */}
      {[0, 1, 2, 3, 4].map((g) => (
        <g key={g}>
          <line x1={padX} y1={y(g)} x2={w - padX} y2={y(g)} stroke="var(--border-soft)" strokeWidth="1" />
          <text x={padX - 8} y={y(g) + 3} textAnchor="end" fontSize="10" fill="var(--text-faint)">{g}</text>
        </g>
      ))}

      {data.length > 1 && <path d={area} fill="url(#gpaFill)" />}
      {data.length > 1 && <path d={line} fill="none" stroke="url(#gpaLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

      {data.map((d, i) => (
        <g key={d.term}>
          <circle cx={x(i)} cy={y(d.gpa)} r="4" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2.5" />
          <text x={x(i)} y={y(d.gpa) - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">
            {d.gpa.toFixed(2)}
          </text>
          <text x={x(i)} y={h - padY + 15} textAnchor="middle" fontSize="10" fill="var(--text-dim)">
            {shortLabel(d.label)}
          </text>
        </g>
      ))}
    </svg>
  );
}
