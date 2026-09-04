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

export function BarsChart({ data, height = 200 }) {
    return (<div className="bars-chart" style={{ height }}>
      {data.map((d) => (<div className="col" key={d.label}>
          <div className="b" style={{ height: `${d.pct}%`, opacity: d.dim ? 0.35 : 1 }}/>
          <div className="cap">{d.label}</div>
        </div>))}
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

