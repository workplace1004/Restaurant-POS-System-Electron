import React from 'react';

const ROSE_500 = '#f43f5e';
const YELLOW_400 = '#facc15';
const GREEN_500 = '#22c55e';

export function getTableFill(hasOpenOrders, wasPaidRecently) {
  if (hasOpenOrders) return ROSE_500;
  return GREEN_500;
}

export function Table4Svg({ tableFill = GREEN_500, className, idPrefix = 't4' }) {
  const filterId = `soft-4-${idPrefix}`;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 227" fill="none" className={className}>
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.18" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        <circle cx="95" cy="63" r="18" fill="#D8DEE6" />
        <circle cx="95" cy="145" r="18" fill="#D8DEE6" />
        <circle cx="54" cy="104" r="18" fill="#D8DEE6" />
        <circle cx="136" cy="104" r="18" fill="#D8DEE6" />
      </g>
      <rect x="49" y="58" width="92" height="92" rx="6" fill={tableFill} />
    </svg>
  );
}

export function Table5Svg({ tableFill = GREEN_500, className, idPrefix = 't5' }) {
  const filterId = `soft-5-${idPrefix}`;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 227" fill="none" className={className}>
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.18" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        <circle cx="95" cy="58" r="18" fill="#D8DEE6" />
        <circle cx="50" cy="90" r="18" fill="#D8DEE6" />
        <circle cx="140" cy="90" r="18" fill="#D8DEE6" />
        <circle cx="68" cy="144" r="18" fill="#D8DEE6" />
        <circle cx="122" cy="144" r="18" fill="#D8DEE6" />
      </g>
      <circle cx="95" cy="104" r="45" fill={tableFill} />
    </svg>
  );
}

export function Table6Svg({ tableFill = GREEN_500, className, idPrefix = 't6' }) {
  const filterId = `soft-6-${idPrefix}`;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 227" fill="none" className={className}>
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.18" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        <circle cx="54" cy="72" r="18" fill="#D8DEE6" />
        <circle cx="95" cy="72" r="18" fill="#D8DEE6" />
        <circle cx="136" cy="72" r="18" fill="#D8DEE6" />
        <circle cx="54" cy="136" r="18" fill="#D8DEE6" />
        <circle cx="95" cy="136" r="18" fill="#D8DEE6" />
        <circle cx="136" cy="136" r="18" fill="#D8DEE6" />
      </g>
      <rect x="21" y="68.5" width="148" height="72" rx="6" fill={tableFill} />
    </svg>
  );
}

const TABLE_SVG_MAP = {
  '4table': Table4Svg,
  '5table': Table5Svg,
  '6table': Table6Svg
};

export function TableShapeSvg({ templateType = '4table', tableFill, className, idPrefix }) {
  const Comp = TABLE_SVG_MAP[templateType] || Table4Svg;
  return <Comp tableFill={tableFill} className={className} idPrefix={idPrefix} />;
}
