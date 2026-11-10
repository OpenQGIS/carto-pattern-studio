import React, { useRef, useLayoutEffect, useState } from 'react';

interface AutoSvgIconProps {
  svgContent: string;
  className?: string;
  color?: string;
  viewBox?: string;
  defaultViewBox?: string;
}

export const AutoSvgIcon: React.FC<AutoSvgIconProps> = ({
  svgContent,
  className = 'w-5 h-5',
  color = 'currentColor',
  viewBox: explicitViewBox,
  defaultViewBox = '0 0 16 16',
}) => {
  const gRef = useRef<SVGGElement>(null);
  const [viewBox, setViewBox] = useState<string>(explicitViewBox || defaultViewBox);

  useLayoutEffect(() => {
    if (explicitViewBox) {
      setViewBox(explicitViewBox);
      return;
    }
    if (!gRef.current) return;
    try {
      const bb = gRef.current.getBBox();
      if (bb.width > 0 && bb.height > 0) {
        const pad = Math.max(0.5, Math.min(bb.width, bb.height) * 0.05);
        const xs = Math.floor(bb.x - pad);
        const ys = Math.floor(bb.y - pad);
        const w = Math.ceil(bb.width + pad * 2);
        const h = Math.ceil(bb.height + pad * 2);
        setViewBox(`${xs} ${ys} ${w} ${h}`);
      }
    } catch (e) {
      // Fallback
    }
  }, [svgContent, explicitViewBox]);

  return (
    <svg
      viewBox={explicitViewBox || viewBox}
      className={`${className} fill-current`}
      style={{ color }}
    >
      <g ref={gRef} dangerouslySetInnerHTML={{ __html: svgContent }} />
    </svg>
  );
};
