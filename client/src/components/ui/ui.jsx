// ======================================================
// File Name : ui.jsx
// Purpose   : Reusable UI component: ui
// ======================================================


// ======================================================
// START: Component Functions
// ======================================================

// ======================================================
// Function : StatCard
// Purpose  : React component that renders the 'StatCard' UI
// ======================================================

export function StatCard({ label, value, icoClass, icon, delta, deltaDirection }) {
    return (<div className="card card-pad stat">
      <div className="top">
        <span className="label">{label}</span>
        {icon && <span className={`ico-box ${icoClass ?? ''}`}>{icon}</span>}
      </div>
      <div className="value">{value}</div>
      {delta && <div className={`delta ${deltaDirection ?? ''}`}>{delta}</div>}
    </div>);
}

// ======================================================
// END: StatCard
// ======================================================
// ======================================================
// Function : Pill
// Purpose  : React component that renders the 'Pill' UI
// ======================================================

export function Pill({ tone, children }) {
    return <span className={`pill pill-${tone}`}>{children}</span>;
}

// ======================================================
// END: Pill
// ======================================================
// ======================================================
// Function : BarsChart
// Purpose  : React component that renders the 'BarsChart' UI
// ======================================================

const FILL_BASE_COLOR = '#2563eb';

// mix base hex color with white according to weight (0 = white, 1 = full base color)
function mixWithWhite(hex, weight) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const wr = Math.round(r * weight + 255 * (1 - weight));
    const wg = Math.round(g * weight + 255 * (1 - weight));
    const wb = Math.round(b * weight + 255 * (1 - weight));
    return `rgb(${wr}, ${wg}, ${wb})`;
}

export function BarsChart({ data, height = 200 }) {
        if (!data || data.length === 0) return null;

        // Normalize each month's fill against the highest value in the
        // current data set, so the boxes visibly rise and fall as the
        // underlying numbers change (instead of against gross cost, which
        // made every fill amount to a fraction of a percent and rendered
        // as near-invisible bars).
        const maxValue = Math.max(...data.map((d) => Number(d.value) || 0), 0.0001);

        return (<div className="bars-chart" style={{ height }}>
            {data.map((d) => {
                    const value = Number(d.value) || 0;
                    // 0 when there's no data for the month, rising toward 1 as that
                    // month's value approaches the highest month in the set.
                    const ratio = Math.max(0, Math.min(1, value / maxValue));
                    const fillPct = value > 0 ? Math.round(Math.max(4, ratio * 100)) : 0;
                    const dimFactor = d.dim ? 0.5 : 1; // projected months are lighter
                    // Color rises (gets darker/more saturated) the more that month's
                    // data is worth, staying pale near zero instead of jumping straight
                    // to full color.
                    const fillColor = mixWithWhite(FILL_BASE_COLOR, Math.max(0.18, ratio));
                    return (<div className="col" key={d.month}>
                        <div className="box" style={{ opacity: dimFactor }}>
                            <div
                                className="fill"
                                style={{ height: `${fillPct}%`, background: fillColor }}
                            />
                        </div>
                        <div className="cap">{d.month}</div>
                    </div>);
                })}
        </div>);
}

// ======================================================
// END: BarsChart
// ======================================================
// ======================================================
// Function : Donut
// Purpose  : React component that renders the 'Donut' UI
// ======================================================

export function Donut({ segments, size = 150 }) {
    let acc = 0;
    const stops = segments
        .map((s) => {
        const start = acc;
        acc += s.pct;
        return `${s.color} ${start}% ${acc}%`;
    })
        .join(', ');
    return (<div style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: `conic-gradient(${stops})`
        }}/>);
}

// ======================================================
// END: Donut
// ======================================================

// ======================================================
// END: Component Functions
// ======================================================

