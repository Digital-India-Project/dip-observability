import { useState } from 'react';
import { MetricPoint } from '../types/observability';

interface SparklineChartProps {
  title: string;
  subtitle: string;
  currentValue: string;
  unit: string;
  data: MetricPoint[];
  strokeColor: string;
  fillColor: string;
}

export function SparklineChart({
  title,
  subtitle,
  currentValue,
  unit,
  data,
  strokeColor,
  fillColor,
}: SparklineChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 560;
  const height = 164;
  const padLeft = 8;
  const padRight = 8;
  const padTop = 14;
  const padBottom = 24;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const points = data.map((d, i) => {
    const x = padLeft + (i / Math.max(data.length - 1, 1)) * innerW;
    const y = padTop + innerH - ((d.value - min) / range) * innerH;
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(
    padTop + innerH
  ).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`;

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <div className="text-right">
          <div className="font-mono text-xl font-semibold text-slate-900 tabular-nums dark:text-slate-100">
            {activePoint ? `${activePoint.value}${unit}` : currentValue}
          </div>
          <div className="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
            {activePoint ? `at ${activePoint.label}` : 'Current window'}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-40 w-full overflow-visible"
          onMouseLeave={() => setHoveredIdx(null)}
          role="img"
          aria-label={`${title} chart`}
        >
          {[0, 0.5, 1].map((ratio) => {
            const y = padTop + ratio * innerH;
            return (
              <line
                key={ratio}
                x1={padLeft}
                x2={width - padRight}
                y1={y}
                y2={y}
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="1"
              />
            );
          })}

          <path d={areaPath} fill={fillColor} />
          <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />

          {activePoint && (
            <line
              x1={activePoint.x}
              x2={activePoint.x}
              y1={padTop}
              y2={padTop + innerH}
              stroke="currentColor"
              className="text-slate-300 dark:text-slate-700"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          )}

          {points.map((p, idx) => (
            <g key={p.label}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? 4.5 : 2.5}
                fill={hoveredIdx === idx ? strokeColor : '#ffffff'}
                stroke={strokeColor}
                strokeWidth="2"
              />
              <rect
                x={p.x - innerW / (points.length * 2)}
                y={0}
                width={innerW / points.length}
                height={height}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredIdx(idx)}
              />
              <text
                x={p.x}
                y={height - 4}
                textAnchor={idx === 0 ? 'start' : idx === points.length - 1 ? 'end' : 'middle'}
                className="fill-slate-400 font-mono text-[10px] tabular-nums dark:fill-slate-500"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
