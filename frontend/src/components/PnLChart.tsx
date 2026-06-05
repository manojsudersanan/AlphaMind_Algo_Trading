"use client"

import { useState, useMemo, useRef } from "react"
import { TrendingUp, TrendingDown, Clock, Activity } from "lucide-react"
import { parseDate } from "@/lib/utils"

interface Transaction {
  id: string
  amount: string | number
  type: string
  description?: string
  created_at: string
  running_pnl?: string | number
}

interface PnLChartProps {
  transactions: Transaction[]
  variant?: "preview" | "detailed"
  interactive?: boolean
  sessionsList?: any[]
}

export default function PnLChart({
  transactions,
  variant = "preview",
  interactive = true,
  sessionsList = [],
}: PnLChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 1. Process transactions to compile chronological PnL data
  const chartData = useMemo(() => {
    // Determine if we should filter transactions to only the latest session
    let filteredTxs = transactions
    if (sessionsList && sessionsList.length > 0) {
      const latestSession = sessionsList[0]
      const sessionStartTime = parseDate(latestSession.start_time).getTime()
      filteredTxs = transactions.filter(tx => parseDate(tx.created_at).getTime() >= sessionStartTime)
    }

    // Filter for trade transactions (profit and loss realized)
    const trades = filteredTxs.filter((tx) => {
      const type = tx.type?.toLowerCase() || ""
      return type.includes("profit") || type.includes("loss")
    })

    // Sort chronologically (oldest first)
    const sortedTrades = [...trades].sort(
      (a, b) => parseDate(a.created_at).getTime() - parseDate(b.created_at).getTime()
    )

    let runningPnL = 0
    const rawPoints = sortedTrades.map((tx) => {
      const isProfit = tx.type?.toLowerCase().includes("profit")
      const amt = Number(tx.amount) || 0
      if (tx.running_pnl !== undefined && tx.running_pnl !== null) {
        runningPnL = Number(tx.running_pnl)
      } else {
        runningPnL = isProfit ? runningPnL + amt : runningPnL - amt
      }
      return {
        pnl: runningPnL,
        time: parseDate(tx.created_at),
        tx,
      }
    })

    // If we don't have enough points, return a flat line at zero
    if (rawPoints.length < 2) {
      const now = Date.now()
      return [
        { pnl: 0, time: new Date(now - 60000), tx: null },
        { pnl: 0, time: new Date(now), tx: null },
      ]
    }

    // Prepend a starting point to look smooth and reflect correct baseline
    const firstTime = rawPoints[0].time.getTime()
    const firstTx = rawPoints[0].tx
    let startingPnL = 0
    if (firstTx) {
      const firstIsProfit = firstTx.type?.toLowerCase().includes("profit")
      const firstAmt = Number(firstTx.amount) || 0
      startingPnL = rawPoints[0].pnl - (firstIsProfit ? firstAmt : -firstAmt)
    }

    // Determine baseline from the very first transaction's pre-trade PnL
    const baselinePnL = startingPnL

    // Adjust all points relative to baseline so the graph starts at 0
    const points = rawPoints.map(pt => ({
      ...pt,
      pnl: pt.pnl - baselinePnL
    }))

    const startingPoint = {
      pnl: 0,
      time: new Date(firstTime - 60000),
      tx: null,
    }

    return [startingPoint, ...points]
  }, [transactions, sessionsList])

  // Chart configuration based on variant
  const config = useMemo(() => {
    const isDetailed = variant === "detailed"
    return {
      viewBoxWidth: isDetailed ? 800 : 400,
      viewBoxHeight: isDetailed ? 320 : 120,
      paddingTop: isDetailed ? 30 : 10,
      paddingBottom: isDetailed ? 40 : 10,
      paddingLeft: isDetailed ? 60 : 5,
      paddingRight: isDetailed ? 30 : 5,
    }
  }, [variant])

  // 2. Find min/max values to scale the chart
  const { points, minPnL, maxPnL, isProfitFinal, finalValue } = useMemo(() => {
    const pnlValues = chartData.map((d) => d.pnl)
    const min = pnlValues.length > 0 ? Math.min(...pnlValues) : 0
    const max = pnlValues.length > 0 ? Math.max(...pnlValues) : 100
    const lastVal = chartData[chartData.length - 1]?.pnl || 0

    return {
      points: chartData,
      minPnL: min,
      maxPnL: max,
      isProfitFinal: lastVal >= 0,
      finalValue: lastVal,
    }
  }, [chartData])

  // 3. Compute SVG coordinates for each data point
  const svgPoints = useMemo(() => {
    const { viewBoxWidth, viewBoxHeight, paddingTop, paddingBottom, paddingLeft, paddingRight } = config
    const range = maxPnL - minPnL
    const margin = range === 0 ? 100 : range * 0.08
    const rangeMin = minPnL - margin
    const rangeMax = maxPnL + margin
    const n = points.length

    return points.map((pt, i) => {
      const xPct = n > 1 ? i / (n - 1) : 0.5
      const x = paddingLeft + xPct * (viewBoxWidth - paddingLeft - paddingRight)

      const yPct = (pt.pnl - rangeMin) / (rangeMax - rangeMin)
      // Invert Y because SVG coordinates start from top
      const y = viewBoxHeight - paddingBottom - yPct * (viewBoxHeight - paddingTop - paddingBottom)

      return {
        x,
        y,
        pnl: pt.pnl,
        time: pt.time,
        tx: pt.tx,
      }
    })
  }, [points, minPnL, maxPnL, config])

  // Build the SVG path strings
  const strokePath = useMemo(() => {
    if (svgPoints.length === 0) return ""
    return svgPoints.reduce((path, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`
    }, "")
  }, [svgPoints])

  const areaPath = useMemo(() => {
    if (svgPoints.length === 0) return ""
    const { viewBoxHeight, paddingBottom } = config
    const first = svgPoints[0]
    const last = svgPoints[svgPoints.length - 1]
    const bottomY = viewBoxHeight - paddingBottom
    return `${strokePath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`
  }, [svgPoints, strokePath, config])

  // Handle Hover Interaction
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive || svgPoints.length === 0 || !containerRef.current) return

    const rect = e.currentTarget.getBoundingClientRect()
    const relativeX = (e.clientX - rect.left) / rect.width
    const svgX = relativeX * config.viewBoxWidth

    // Find the closest point in svgPoints based on x-coordinate
    let closestIdx = 0
    let minDiff = Infinity

    svgPoints.forEach((pt, i) => {
      const diff = Math.abs(pt.x - svgX)
      if (diff < minDiff) {
        minDiff = diff
        closestIdx = i
      }
    })

    setHoveredIndex(closestIdx)
  }

  const handleMouseLeave = () => {
    setHoveredIndex(null)
  }

  // Formatting utilities
  const formatCurrency = (val: number) => {
    return `${val >= 0 ? "+" : "-"}₹${Math.abs(val).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const isDetailed = variant === "detailed"
  const strokeColor = isProfitFinal ? "#00C853" : "#FF1744"
  const gradientId = `pnl-gradient-${variant}`
  const glowId = `glow-${variant}`

  // Render horizontal grid lines for detailed mode
  const gridLines = useMemo(() => {
    if (!isDetailed || svgPoints.length === 0) return null
    const { viewBoxWidth, viewBoxHeight, paddingTop, paddingBottom, paddingLeft, paddingRight } = config
    const lineCount = 4
    const lines = []

    for (let i = 0; i <= lineCount; i++) {
      const ratio = i / lineCount
      const y = paddingTop + ratio * (viewBoxHeight - paddingTop - paddingBottom)
      const pnlValue = minPnL + (1 - ratio) * (maxPnL - minPnL)

      lines.push(
        <g key={i} className="opacity-20">
          <line
            x1={paddingLeft}
            y1={y}
            x2={viewBoxWidth - paddingRight}
            y2={y}
            stroke="#ffffff"
            strokeDasharray="4 4"
            strokeWidth="0.5"
          />
          <text
            x={paddingLeft - 8}
            y={y + 4}
            textAnchor="end"
            fill="#ffffff"
            className="text-[9px] font-mono select-none"
          >
            {pnlValue.toFixed(0)}
          </text>
        </g>
      )
    }
    return lines
  }, [isDetailed, svgPoints, minPnL, maxPnL, config])

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col justify-between ${
        isDetailed ? "p-4 bg-[#0d1117] rounded-xl border border-border/80" : ""
      }`}
    >
      {/* Title & Stats */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">
            {isDetailed ? "Interactive Live Ledger Curve" : "Algorithmic PnL Preview"}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-bold font-mono tracking-tight ${
                isProfitFinal ? "text-trading-green" : "text-trading-red"
              }`}
            >
              {formatCurrency(finalValue)}
            </span>
            {isDetailed && (
              <span className="text-xs text-muted-foreground">
                (Based on {points.length - 1} recent trades)
              </span>
            )}
          </div>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isProfitFinal
              ? "bg-trading-green/10 text-trading-green border-trading-green/20"
              : "bg-trading-red/10 text-trading-red border-trading-red/20"
          }`}
        >
          {isProfitFinal ? (
            <>
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{finalValue > 0 ? "Profitable" : "Breakeven"}</span>
            </>
          ) : (
            <>
              <TrendingDown className="h-3.5 w-3.5" />
              <span>Net Drawdown</span>
            </>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 relative min-h-[50px] w-full">
        <svg
          viewBox={`0 0 ${config.viewBoxWidth} ${config.viewBoxHeight}`}
          width="100%"
          height="100%"
          className="overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Area Fill Gradient */}
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>

            {/* Glowing Neon Line Effect */}
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="3" floodColor={strokeColor} floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Detailed Mode Grid */}
          {isDetailed && <g>{gridLines}</g>}

          {/* Area under the path */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Main stroke line */}
          <path
            d={strokePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={isDetailed ? 2.5 : 2}
            filter={`url(#${glowId})`}
            className="transition-all duration-300"
          />

          {/* Hover Guides & Dots */}
          {hoveredIndex !== null && svgPoints[hoveredIndex] && (
            <g>
              {/* Vertical line tracker */}
              <line
                x1={svgPoints[hoveredIndex].x}
                y1={config.paddingTop}
                x2={svgPoints[hoveredIndex].x}
                y2={config.viewBoxHeight - config.paddingBottom}
                stroke="#60a5fa"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                className="opacity-70"
              />

              {/* Glowing tracker dot */}
              <circle
                cx={svgPoints[hoveredIndex].x}
                cy={svgPoints[hoveredIndex].y}
                r="6"
                fill="#ffffff"
                stroke="#60a5fa"
                strokeWidth="2.5"
                className="shadow-md"
              />
              <circle
                cx={svgPoints[hoveredIndex].x}
                cy={svgPoints[hoveredIndex].y}
                r="10"
                fill={strokeColor}
                fillOpacity="0.25"
              />
            </g>
          )}

          {/* Trade Markers (Detailed View Only) */}
          {isDetailed &&
            svgPoints.map((pt, idx) => {
              if (!pt.tx) return null // Skip start point
              const isProfit = pt.tx.type?.toLowerCase().includes("profit")
              return (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredIndex === idx ? "5" : "3"}
                  fill={isProfit ? "#00C853" : "#FF1744"}
                  stroke="#ffffff"
                  strokeWidth="0.75"
                  className="transition-all duration-150 cursor-pointer"
                />
              )
            })}
        </svg>

        {/* Floating HTML Hover Tooltip */}
        {hoveredIndex !== null && svgPoints[hoveredIndex] && (
          <div
            className="absolute z-50 p-3 bg-popover border border-border rounded-lg shadow-2xl pointer-events-none text-xs font-mono text-popover-foreground flex flex-col gap-1"
            style={{
              // Position tooltip left or right depending on side of screen to avoid cutoff
              left: `${Math.min(
                85,
                Math.max(
                  5,
                  ((svgPoints[hoveredIndex].x - config.paddingLeft) /
                    (config.viewBoxWidth - config.paddingLeft - config.paddingRight)) *
                    100
                )
              )}%`,
              top: `${Math.max(5, (svgPoints[hoveredIndex].y / config.viewBoxHeight) * 100 - 30)}%`,
              transform: "translate(-50%, -100%)",
              marginTop: "-8px",
            }}
          >
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider pb-1 border-b border-border/50">
              <Clock className="h-3 w-3" />
              <span>{formatTime(svgPoints[hoveredIndex].time)}</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1 font-bold text-sm">
              <span className="text-[10px] text-muted-foreground font-normal">Cum. PnL:</span>
              <span
                className={
                  svgPoints[hoveredIndex].pnl >= 0 ? "text-trading-green" : "text-trading-red"
                }
              >
                {formatCurrency(svgPoints[hoveredIndex].pnl)}
              </span>
            </div>
            {svgPoints[hoveredIndex].tx ? (
              <div className="mt-1 flex flex-col gap-0.5 text-[10px]">
                <div className="flex justify-between gap-3 text-muted-foreground">
                  <span>Trade Price:</span>
                  <span className="text-foreground font-semibold">
                    ₹{Number(svgPoints[hoveredIndex].tx.amount).toFixed(2)}
                  </span>
                </div>
                <div className="text-[9.5px] text-primary/80 mt-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px]">
                  {svgPoints[hoveredIndex].tx.description}
                </div>
              </div>
            ) : (
              <div className="text-[9.5px] text-muted-foreground italic mt-0.5">
                Initial Deployed State
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info / Timeframe */}
      {isDetailed && (
        <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-border/30 pt-3 mt-2 font-mono">
          <span className="flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-trading-green" /> Live Tracking Feed Active
          </span>
          <span>
            Start: {points[0]?.time.toLocaleTimeString()} | End:{" "}
            {points[points.length - 1]?.time.toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  )
}
