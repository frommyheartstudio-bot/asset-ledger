// ======================================================
// File Name : Icon.jsx
// Purpose   : One shared set of crisp SVG icons (arrows, chevrons, etc.).
//             Replaces text glyphs such as ← → ▾ ▴ ▲ ▼ ‹ › which render
//             at different sizes / baselines depending on the font, so
//             they looked uneven next to button text. SVG icons scale
//             with the surrounding font size (1em) and align with text.
// ======================================================

// ======================================================
// START: Icon Definitions
// ======================================================

// Each entry: stroke paths drawn on a 24x24 grid. `fill: true` = solid shape.
const PATHS = {
    arrowLeft: ['M19 12H5', 'M12 19l-7-7 7-7'],
    arrowRight: ['M5 12h14', 'M12 5l7 7-7 7'],
    chevronDown: ['M6 9l6 6 6-6'],
    chevronUp: ['M18 15l-6-6-6 6'],
    chevronLeft: ['M15 18l-6-6 6-6'],
    chevronRight: ['M9 18l6-6-6-6'],
    triUp: { fill: true, d: ['M12 5l8 13H4z'] },
    triDown: { fill: true, d: ['M12 19L4 6h16z'] },
    refresh: ['M21 12a9 9 0 1 1-2.64-6.36', 'M21 4v5h-5'],
    upload: ['M12 16V4', 'M7 9l5-5 5 5', 'M4 20h16'],
    search: ['M21 21l-4.3-4.3', 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z'],
    close: ['M18 6L6 18', 'M6 6l12 12'],
    menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
    help: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7', 'M12 17h.01'],
    logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9']
};

// ======================================================
// END: Icon Definitions
// ======================================================

// ======================================================
// Function : isIconName
// Purpose  : True when `name` is one of the icons above (used by nav items
//            whose `icon` can be either an icon name or a plain glyph).
// ======================================================

export function isIconName(name) {
    return typeof name === 'string' && Object.prototype.hasOwnProperty.call(PATHS, name);
}

// ======================================================
// Function : Icon
// Purpose  : Renders one SVG icon by name. Size defaults to 1em so it
//            follows the font size of the button / text around it.
// ======================================================

export function Icon({ name, size = '1em', strokeWidth = 2, style, className, ...rest }) {
    const def = PATHS[name];
    if (!def) return null;
    const solid = !Array.isArray(def) && def.fill;
    const paths = Array.isArray(def) ? def : def.d;
    return (<svg
      width={size} height={size} viewBox="0 0 24 24"
      fill={solid ? 'currentColor' : 'none'} stroke={solid ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false"
      className={className}
      style={{ flexShrink: 0, display: 'inline-block', verticalAlign: '-0.14em', ...style }}
      {...rest}
    >
      {paths.map((d) => (<path key={d} d={d}/>))}
    </svg>);
}

// ======================================================
// Function : GlyphOrIcon
// Purpose  : Renders an Icon when `icon` is an icon name, otherwise the
//            plain text/emoji glyph as-is (nav + stat cards use both).
// ======================================================

export function GlyphOrIcon({ icon, size }) {
    return isIconName(icon) ? <Icon name={icon} size={size}/> : <>{icon}</>;
}

// ======================================================
// END OF FILE : Icon.jsx
// ======================================================
