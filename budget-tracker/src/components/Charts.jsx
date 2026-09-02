import { formatKSh } from '@/lib/format';

export function DonutChart({ data, size = 200, thickness = 28, centerLabel, centerValue }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (total === 0) {
    return (
      <div className="donut-empty" style={{ width: size, height: size }}>
        <div>
          <div className="donut-empty-value">KSh 0</div>
          <div className="donut-empty-label">No spending yet</div>
        </div>
      </div>
    );
  }

  return (
    <div className="donut-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
        {data.map((d, i) => {
          const length = (d.value / total) * circumference;
          const dash = `${length} ${circumference - length}`;
          const seg = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              style={{ transition: 'all 0.7s' }}
            />
          );
          offset += length;
          return seg;
        })}
      </svg>
      {(centerLabel || centerValue) && (
        <div className="donut-center">
          {centerLabel && <span className="donut-center-label">{centerLabel}</span>}
          {centerValue && <span className="donut-center-value">{centerValue}</span>}
        </div>
      )}
    </div>
  );
}

export function BarChart({ data, formatValue = formatKSh }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="bar-chart">
      {data.map((d, i) => {
        const heightPct = (d.value / max) * 100;
        return (
          <div key={i} className="bar-col">
            <div className="bar-wrapper">
              <div className="bar" style={{ height: `${Math.max(heightPct, 4)}%` }}>
                <div className="bar-tooltip">{formatValue(d.value)}</div>
              </div>
            </div>
            <span className="bar-label">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
