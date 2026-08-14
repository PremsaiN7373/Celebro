interface MiniBarChartProps {
  data: { label: string; value: number }[];
  color?: string;
}

export default function MiniBarChart({ data, color = "#d8542e" }: MiniBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const width = 280;
  const height = 120;
  const barWidth = width / data.length - 12;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32">
      {data.map((d, i) => {
        const barHeight = (d.value / max) * (height - 24);
        const x = i * (width / data.length) + 6;
        const y = height - barHeight - 18;
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={4}
              fill={color}
              opacity={0.85}
            />
            <text
              x={x + barWidth / 2}
              y={height - 4}
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              className="fill-ink-400 dark:fill-ink-500"
            >
              {d.label}
            </text>
            <text
              x={x + barWidth / 2}
              y={y - 4}
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fill="currentColor"
              className="fill-ink-700 dark:fill-ink-200"
            >
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
