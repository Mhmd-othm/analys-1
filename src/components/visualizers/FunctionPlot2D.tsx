import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Pin, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

export interface PlotCurve {
  fn: (x: number) => number;
  color: string;
  label?: string;
  dashed?: boolean;
  strokeWidth?: number;
}

export type LabelPlacement = 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';

export interface PlotPoint {
  x: number;
  y: number;
  color: string;
  label?: string;
  hollow?: boolean;
  labelPlacement?: LabelPlacement;
}

export interface PlotVerticalLine {
  x: number;
  color?: string;
  label?: string;
  dashed?: boolean;
}

export interface PlotHorizontalLine {
  y: number;
  color?: string;
  label?: string;
  dashed?: boolean;
}

export interface PlotTransform {
  width: number;
  height: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  toSvgX: (x: number) => number;
  toSvgY: (y: number) => number;
  toMathX: (sx: number) => number;
  toMathY: (sy: number) => number;
}

interface FunctionPlot2DProps {
  curves?: PlotCurve[];
  points?: PlotPoint[];
  verticalLines?: PlotVerticalLine[];
  horizontalLines?: PlotHorizontalLine[];
  initialXRange?: [number, number];
  initialYRange?: [number, number];
  aspectSquare?: boolean;
  piTicks?: boolean;
  width?: number;
  height?: number;
  title?: string;
  samples?: number;
  extraSvg?: (transform: PlotTransform) => React.ReactNode;
}

function niceStep(span: number, targetTicks = 7): number {
  if (span <= 0 || !Number.isFinite(span)) return 1;
  const rough = span / targetTicks;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  if (norm < 1.5) return 1 * pow;
  if (norm < 3.2) return 2 * pow;
  if (norm < 7) return 5 * pow;
  return 10 * pow;
}

function nicePiStep(span: number): number | null {
  const candidates = [Math.PI / 4, Math.PI / 2, Math.PI, 2 * Math.PI, 4 * Math.PI];
  for (const c of candidates) {
    const count = span / c;
    if (count >= 3 && count <= 9) return c;
  }
  return null;
}

function formatTick(val: number, step: number): string {
  if (Math.abs(val) < step * 1e-6) return '0';
  if (Math.abs(val) >= 10000 || (Math.abs(val) > 0 && Math.abs(val) < 0.0005)) {
    return val.toExponential(1);
  }
  const decimals = step < 1 ? Math.min(4, Math.max(1, -Math.floor(Math.log10(step)) + 1)) : 0;
  const rounded = Number(val.toFixed(decimals));
  return String(rounded).replace('.', ',');
}

function formatPiTick(val: number): string {
  const k = Math.round((val / Math.PI) * 4);
  if (k === 0) return '0';
  const sign = k < 0 ? '-' : '';
  const absK = Math.abs(k);
  if (absK % 4 === 0) {
    const m = absK / 4;
    return `${sign}${m === 1 ? '' : m}π`;
  }
  if (absK % 2 === 0) {
    const m = absK / 2;
    return `${sign}${m === 1 ? '' : m}π/2`;
  }
  return `${sign}${absK === 1 ? '' : absK}π/4`;
}

interface LabelBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function overlapsAny(box: LabelBox, existing: LabelBox[]): boolean {
  return existing.some(
    (b) => !(box.x2 < b.x1 || box.x1 > b.x2 || box.y2 < b.y1 || box.y1 > b.y2),
  );
}

export const FunctionPlot2D: React.FC<FunctionPlot2DProps> = ({
  curves = [],
  points = [],
  verticalLines = [],
  horizontalLines = [],
  initialXRange = [-6, 6],
  initialYRange = [-4, 4],
  aspectSquare = false,
  piTicks = false,
  width = 560,
  height = 360,
  title,
  samples = 360,
  extraSvg,
}) => {
  const clipId = useId().replace(/:/g, '_');
  const [xRange, setXRange] = useState<[number, number]>(initialXRange);
  const [yRange, setYRange] = useState<[number, number]>(initialYRange);
  const [pinned, setPinned] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    xRange: [number, number];
    yRange: [number, number];
  } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;

  const initialSpan = Math.max(1e-6, initialXRange[1] - initialXRange[0]);
  const currentSpan = Math.max(1e-6, xMax - xMin);
  const zoomRatio = initialSpan / currentSpan;
  const isDefaultView =
    Math.abs(xMin - initialXRange[0]) < 1e-4 &&
    Math.abs(xMax - initialXRange[1]) < 1e-4 &&
    Math.abs(yMin - initialYRange[0]) < 1e-4 &&
    Math.abs(yMax - initialYRange[1]) < 1e-4;

  const effectiveYRange = useMemo<[number, number]>(() => {
    if (!aspectSquare) return [yMin, yMax];
    const xSpan = xMax - xMin;
    const desiredYSpan = xSpan * (height / width);
    const yMid = (yMin + yMax) / 2;
    return [yMid - desiredYSpan / 2, yMid + desiredYSpan / 2];
  }, [aspectSquare, height, width, xMax, xMin, yMax, yMin]);

  const effYMin = effectiveYRange[0];
  const effYMax = effectiveYRange[1];

  const transform: PlotTransform = useMemo(() => {
    const xSpan = Math.max(1e-9, xMax - xMin);
    const ySpan = Math.max(1e-9, effYMax - effYMin);
    return {
      width,
      height,
      xMin,
      xMax,
      yMin: effYMin,
      yMax: effYMax,
      toSvgX: (x: number) => ((x - xMin) / xSpan) * width,
      toSvgY: (y: number) => height - ((y - effYMin) / ySpan) * height,
      toMathX: (sx: number) => xMin + (sx / width) * xSpan,
      toMathY: (sy: number) => effYMin + ((height - sy) / height) * ySpan,
    };
  }, [effYMax, effYMin, height, width, xMax, xMin]);

  const zoomBy = (factor: number) => {
    if (pinned) return;
    const xMid = (xMin + xMax) / 2;
    const yMid = (yMin + yMax) / 2;
    const xHalf = Math.max(0.05, Math.min(500, ((xMax - xMin) / 2) * factor));
    const yHalf = Math.max(0.05, Math.min(500, ((yMax - yMin) / 2) * factor));
    setXRange([xMid - xHalf, xMid + xHalf]);
    setYRange([yMid - yHalf, yMid + yHalf]);
  };

  const resetView = () => {
    setXRange(initialXRange);
    setYRange(initialYRange);
  };

  useEffect(() => {
    const el = svgRef.current;
    if (!el || pinned) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.15 : 0.87;
      setXRange(([prevMin, prevMax]) => {
        const mid = (prevMin + prevMax) / 2;
        const half = Math.max(0.05, Math.min(500, ((prevMax - prevMin) / 2) * factor));
        return [mid - half, mid + half];
      });
      setYRange(([prevMin, prevMax]) => {
        const mid = (prevMin + prevMax) / 2;
        const half = Math.max(0.05, Math.min(500, ((prevMax - prevMin) / 2) * factor));
        return [mid - half, mid + half];
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [pinned]);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (pinned) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      xRange: [xMin, xMax],
      yRange: [yMin, yMax],
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging || !dragStartRef.current || pinned) return;
    const rect = svgRef.current?.getBoundingClientRect();
    const pxW = rect?.width || width;
    const pxH = rect?.height || height;
    const dxPx = e.clientX - dragStartRef.current.clientX;
    const dyPx = e.clientY - dragStartRef.current.clientY;
    const startXSpan = dragStartRef.current.xRange[1] - dragStartRef.current.xRange[0];
    const startYSpan =
      aspectSquare
        ? startXSpan * (height / width)
        : dragStartRef.current.yRange[1] - dragStartRef.current.yRange[0];
    const dxMath = (dxPx / pxW) * startXSpan;
    const dyMath = (dyPx / pxH) * startYSpan;
    setXRange([
      dragStartRef.current.xRange[0] - dxMath,
      dragStartRef.current.xRange[1] - dxMath,
    ]);
    setYRange([
      dragStartRef.current.yRange[0] + dyMath,
      dragStartRef.current.yRange[1] + dyMath,
    ]);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture already released
      }
    }
    setDragging(false);
    dragStartRef.current = null;
  };

  // Adaptive grid steps (separately checked for pixel collisions)
  const xSpan = xMax - xMin;
  const ySpan = effYMax - effYMin;
  const maybePiStep = piTicks ? nicePiStep(xSpan) : null;
  const xStep = maybePiStep ?? niceStep(xSpan, 7);
  const yStep = niceStep(ySpan, 6);
  const usePiFormatter = maybePiStep !== null;

  const xGridValues: number[] = [];
  const xStart = Math.ceil(xMin / xStep) * xStep;
  for (let v = xStart; v <= xMax + xStep * 1e-6; v += xStep) {
    xGridValues.push(v);
    if (xGridValues.length > 36) break;
  }

  const yGridValues: number[] = [];
  const yStart = Math.ceil(effYMin / yStep) * yStep;
  for (let v = yStart; v <= effYMax + yStep * 1e-6; v += yStep) {
    yGridValues.push(v);
    if (yGridValues.length > 36) break;
  }

  const axisX = transform.toSvgY(0);
  const axisY = transform.toSvgX(0);
  const clampedAxisX = Math.max(12, Math.min(height - 12, axisX));
  const clampedAxisY = Math.max(12, Math.min(width - 12, axisY));
  const xAxisTickY = Math.min(height - 10, Math.max(16, clampedAxisX + 14));
  const yAxisTickX = Math.max(26, Math.min(width - 8, clampedAxisY - 7));

  // Filter X/Y tick labels by pixel distance so numbers never overlap on zoom
  const visibleXTicks: { sx: number; txt: string }[] = [];
  let lastXTicksPx = -Infinity;
  for (const xv of xGridValues) {
    if (Math.abs(xv) < xStep * 1e-4) continue;
    const sx = transform.toSvgX(xv);
    if (sx < 22 || sx > width - 28) continue;
    if (Math.abs(sx - clampedAxisY) < 20) continue;
    if (sx - lastXTicksPx < 48) continue;
    const txt = usePiFormatter ? formatPiTick(xv) : formatTick(xv, xStep);
    visibleXTicks.push({ sx, txt });
    lastXTicksPx = sx;
  }

  const visibleYTicks: { sy: number; txt: string }[] = [];
  let lastYTicksPx = Infinity;
  for (const yv of yGridValues) {
    if (Math.abs(yv) < yStep * 1e-4) continue;
    const sy = transform.toSvgY(yv);
    if (sy < 24 || sy > height - 14) continue;
    if (Math.abs(sy - clampedAxisX) < 16) continue;
    if (Math.abs(lastYTicksPx - sy) < 24) continue;
    visibleYTicks.push({ sy, txt: formatTick(yv, yStep) });
    lastYTicksPx = sy;
  }

  // Sample curves into SVG path segments (splitting at discontinuities)
  const curvePaths = useMemo(() => {
    const safeYSpan = Math.max(1e-6, effYMax - effYMin);
    return curves.map((curve) => {
      const segments: string[] = [];
      let currentPath = '';
      let prevY: number | null = null;

      for (let i = 0; i <= samples; i++) {
        const x = xMin + (i / samples) * (xMax - xMin);
        let y: number;
        try {
          y = curve.fn(x);
        } catch {
          y = NaN;
        }
        const valid = Number.isFinite(y) && Math.abs(y) < 1e7;
        if (!valid) {
          if (currentPath) {
            segments.push(currentPath);
            currentPath = '';
          }
          prevY = null;
          continue;
        }

        const jumpTooBig = prevY !== null && Math.abs(y - prevY) > safeYSpan * 1.15;
        const clampedY = Math.max(effYMin - safeYSpan * 2, Math.min(effYMax + safeYSpan * 2, y));
        const sx = transform.toSvgX(x);
        const sy = transform.toSvgY(clampedY);

        if (!currentPath || jumpTooBig) {
          if (currentPath) segments.push(currentPath);
          currentPath = `M ${sx.toFixed(2)} ${sy.toFixed(2)}`;
        } else {
          currentPath += ` L ${sx.toFixed(2)} ${sy.toFixed(2)}`;
        }
        prevY = y;
      }

      if (currentPath) segments.push(currentPath);
      return { curve, segments };
    });
  }, [curves, effYMax, effYMin, samples, transform, xMax, xMin]);

  // Compute collision-free placements for point labels
  const placedPointLabels = useMemo(() => {
    const boxes: LabelBox[] = [];
    return points.map((pt) => {
      if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y)) {
        return { pt, sx: 0, sy: 0, valid: false, tx: 0, ty: 0, anchor: 'start' as const };
      }
      const sx = transform.toSvgX(pt.x);
      const sy = transform.toSvgY(pt.y);
      if (!pt.label) {
        return { pt, sx, sy, valid: true, tx: sx, ty: sy, anchor: 'start' as const };
      }

      const labelW = Math.max(28, pt.label.length * 6.8);
      const labelH = 15;
      const order: LabelPlacement[] = pt.labelPlacement
        ? [
            pt.labelPlacement,
            'bottom-right',
            'top-left',
            'bottom-left',
            'top-right',
          ]
        : ['top-right', 'bottom-right', 'top-left', 'bottom-left'];

      let chosen: { tx: number; ty: number; anchor: 'start' | 'end'; box: LabelBox } | null = null;
      for (const candidate of order) {
        const isRight = candidate.includes('right');
        const isTop = candidate.includes('top');
        const tx = Math.max(10, Math.min(width - 10, isRight ? sx + 8 : sx - 8));
        const ty = Math.max(15, Math.min(height - 8, isTop ? sy - 8 : sy + 16));
        const anchor = isRight && tx + labelW < width - 6 ? 'start' : 'end';
        const box: LabelBox =
          anchor === 'start'
            ? { x1: tx - 2, y1: ty - labelH + 2, x2: tx + labelW + 2, y2: ty + 3 }
            : { x1: tx - labelW - 2, y1: ty - labelH + 2, x2: tx + 2, y2: ty + 3 };

        if (!overlapsAny(box, boxes)) {
          chosen = { tx, ty, anchor, box };
          break;
        }
      }

      if (!chosen) {
        const ty = Math.min(height - 8, sy + 18 + boxes.length * 4);
        const tx = Math.min(width - 10, sx + 8);
        chosen = {
          tx,
          ty,
          anchor: 'start',
          box: { x1: tx, y1: ty - labelH, x2: tx + labelW, y2: ty },
        };
      }
      boxes.push(chosen.box);
      return { pt, sx, sy, valid: true, tx: chosen.tx, ty: chosen.ty, anchor: chosen.anchor };
    });
  }, [height, points, transform, width]);

  const labeledCurves = curves.filter((c) => Boolean(c.label));
  const axisVisibleX = axisX >= -2 && axisX <= height + 2;
  const axisVisibleY = axisY >= -2 && axisY <= width + 2;

  return (
    <div className="svg-card">
      {title && (
        <div
          style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '0.25rem',
          }}
        >
          {title}
        </div>
      )}

      <div className="space-between" style={{ marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {pinned
            ? 'Vyn är fäst (flytt och zoom låst)'
            : 'Skrolla för att zooma · Dra för att flytta'}
        </span>
        <div className="row-wrap" style={{ gap: '0.35rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${pinned ? 'btn-primary' : 'btn-secondary'}`}
            aria-pressed={pinned}
            onClick={() => setPinned((p) => !p)}
            aria-label={pinned ? 'Lås upp 2D-vy' : 'Fäst 2D-vy (låser flytt och zoom)'}
            title={pinned ? 'Lås upp vy' : 'Fäst vy (låser flytt och zoom)'}
          >
            <Pin size={14} />
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={pinned}
            onClick={() => zoomBy(1.25)}
            aria-label="Zooma ut"
            title="Zooma ut"
          >
            <ZoomOut size={14} />
          </button>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              minWidth: '3.2rem',
              textAlign: 'center',
            }}
          >
            {Math.round(zoomRatio * 100)} %
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={pinned}
            onClick={() => zoomBy(0.8)}
            aria-label="Zooma in"
            title="Zooma in"
          >
            <ZoomIn size={14} />
          </button>
          {!isDefaultView && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={pinned}
              onClick={resetView}
              aria-label="Återställ zoom och vy"
              title="Återställ vy"
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          background: 'var(--svg-bg)',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          cursor: pinned ? 'default' : dragging ? 'grabbing' : 'grab',
          touchAction: pinned ? 'auto' : 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="img"
        aria-label={title ?? 'Tvådimensionellt koordinatsystem'}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={0} y={0} width={width} height={height} />
          </clipPath>
          <marker
            id={`${clipId}_arrow`}
            markerWidth="7"
            markerHeight="7"
            refX="6"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0.8, 7 3.5, 0 6.2" fill="var(--svg-axis)" />
          </marker>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          {/* Grid */}
          {xGridValues.map((xv, idx) => {
            const sx = transform.toSvgX(xv);
            return (
              <line
                key={`gx-${idx}`}
                x1={sx}
                y1={0}
                x2={sx}
                y2={height}
                stroke="var(--svg-grid)"
                strokeWidth={1}
              />
            );
          })}
          {yGridValues.map((yv, idx) => {
            const sy = transform.toSvgY(yv);
            return (
              <line
                key={`gy-${idx}`}
                x1={0}
                y1={sy}
                x2={width}
                y2={sy}
                stroke="var(--svg-grid)"
                strokeWidth={1}
              />
            );
          })}

          {/* Axes with arrowheads */}
          {axisVisibleX && (
            <line
              x1={0}
              y1={axisX}
              x2={width - 2}
              y2={axisX}
              stroke="var(--svg-axis)"
              strokeWidth={1.6}
              markerEnd={`url(#${clipId}_arrow)`}
            />
          )}
          {axisVisibleY && (
            <line
              x1={axisY}
              y1={height}
              x2={axisY}
              y2={2}
              stroke="var(--svg-axis)"
              strokeWidth={1.6}
              markerEnd={`url(#${clipId}_arrow)`}
            />
          )}

          {/* Axis symbols x & y */}
          <text
            x={width - 14}
            y={Math.max(15, Math.min(height - 10, clampedAxisX - 8))}
            fontSize={12.5}
            fontWeight={700}
            fontStyle="italic"
            fill="var(--text-secondary)"
            style={{ paintOrder: 'stroke', stroke: 'var(--svg-bg)', strokeWidth: 3 }}
          >
            x
          </text>
          <text
            x={Math.max(10, Math.min(width - 18, clampedAxisY + 11))}
            y={17}
            fontSize={12.5}
            fontWeight={700}
            fontStyle="italic"
            fill="var(--text-secondary)"
            style={{ paintOrder: 'stroke', stroke: 'var(--svg-bg)', strokeWidth: 3 }}
          >
            y
          </text>

          {/* Collision-filtered tick labels */}
          {visibleXTicks.map(({ sx, txt }, idx) => (
            <text
              key={`tx-${idx}`}
              x={sx}
              y={xAxisTickY}
              fontSize={10.5}
              textAnchor="middle"
              fill="var(--text-muted)"
              style={{ paintOrder: 'stroke', stroke: 'var(--svg-bg)', strokeWidth: 3 }}
            >
              {txt}
            </text>
          ))}

          {visibleYTicks.map(({ sy, txt }, idx) => (
            <text
              key={`ty-${idx}`}
              x={yAxisTickX}
              y={sy + 3.5}
              fontSize={10.5}
              textAnchor="end"
              fill="var(--text-muted)"
              style={{ paintOrder: 'stroke', stroke: 'var(--svg-bg)', strokeWidth: 3 }}
            >
              {txt}
            </text>
          ))}

          {/* Horizontal reference lines */}
          {horizontalLines.map((hl, idx) => {
            const sy = transform.toSvgY(hl.y);
            return (
              <g key={`hl-${idx}`}>
                <line
                  x1={0}
                  y1={sy}
                  x2={width}
                  y2={sy}
                  stroke={hl.color ?? 'var(--amber)'}
                  strokeWidth={1.5}
                  strokeDasharray={hl.dashed === false ? undefined : '6 4'}
                />
                {hl.label && (
                  <text
                    x={width - 12}
                    y={Math.max(15, sy - 6)}
                    fontSize={11}
                    fontWeight={600}
                    textAnchor="end"
                    fill={hl.color ?? 'var(--amber)'}
                    style={{ paintOrder: 'stroke', stroke: 'var(--svg-bg)', strokeWidth: 3 }}
                  >
                    {hl.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Vertical reference lines / asymptotes */}
          {verticalLines.map((vl, idx) => {
            const sx = transform.toSvgX(vl.x);
            return (
              <g key={`vl-${idx}`}>
                <line
                  x1={sx}
                  y1={0}
                  x2={sx}
                  y2={height}
                  stroke={vl.color ?? 'var(--amber)'}
                  strokeWidth={1.5}
                  strokeDasharray={vl.dashed === false ? undefined : '6 4'}
                />
                {vl.label && (
                  <text
                    x={Math.min(width - 44, sx + 6)}
                    y={16 + idx * 14}
                    fontSize={11}
                    fontWeight={600}
                    fill={vl.color ?? 'var(--amber)'}
                    style={{ paintOrder: 'stroke', stroke: 'var(--svg-bg)', strokeWidth: 3 }}
                  >
                    {vl.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Custom shapes */}
          {extraSvg && extraSvg(transform)}

          {/* Curves */}
          {curvePaths.map(({ curve, segments }, cIdx) =>
            segments.map((d, sIdx) => (
              <path
                key={`curve-${cIdx}-${sIdx}`}
                d={d}
                fill="none"
                stroke={curve.color}
                strokeWidth={curve.strokeWidth ?? 2.4}
                strokeDasharray={curve.dashed ? '6 4' : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )),
          )}

          {/* Points & staggered labels */}
          {placedPointLabels.map(({ pt, sx, sy, valid, tx, ty, anchor }, idx) => {
            if (!valid) return null;
            return (
              <g key={`pt-${idx}`}>
                <circle
                  cx={sx}
                  cy={sy}
                  r={pt.hollow ? 5 : 4.6}
                  fill={pt.hollow ? 'var(--svg-bg)' : pt.color}
                  stroke={pt.color}
                  strokeWidth={2.2}
                />
                {pt.label && (
                  <text
                    x={tx}
                    y={ty}
                    fontSize={11.5}
                    fontWeight={600}
                    textAnchor={anchor}
                    fill={pt.color}
                    style={{ paintOrder: 'stroke', stroke: 'var(--svg-bg)', strokeWidth: 3.5 }}
                  >
                    {pt.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {labeledCurves.length > 0 && (
        <div className="svg-legend" style={{ marginTop: '0.55rem' }}>
          {labeledCurves.map((c, idx) => (
            <span key={idx} className="legend-item">
              <span
                className="legend-swatch"
                style={{
                  background: c.dashed ? 'transparent' : c.color,
                  border: c.dashed ? `2px dashed ${c.color}` : 'none',
                }}
              />
              {c.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
