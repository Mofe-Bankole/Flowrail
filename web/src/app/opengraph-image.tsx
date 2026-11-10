import { ImageResponse } from "next/og";

import { autoCount, financeCount, headline, legCount, run, runTotal } from "@/lib/demo";

export const alt = "FlowRail — one approval becomes per-recipient payout keys the chain enforces.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#110c08";
const FG = "#f6f1eb";
const MUTED = "#a89f94";
const PRIMARY = "#ea942f";
const AUTO = "#10b981";
const HELD = "#f59e0b";

export default function Image() {
  const head = headline();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: BG,
          color: FG,
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 600 }}>
            <div style={{ width: 16, height: 16, borderRadius: 16, background: PRIMARY }} />
            FlowRail
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 70, fontSize: 82, lineHeight: 1.0, letterSpacing: -2 }}>
            <span>{head.legs}</span>
            <span style={{ color: PRIMARY }}>{head.decision}</span>
          </div>
          <div style={{ marginTop: 34, fontSize: 28, lineHeight: 1.35, color: MUTED, display: "flex" }}>
            One approval becomes per-recipient payout keys the chain enforces. Built on Tempo.
          </div>
          <div style={{ marginTop: "auto", fontSize: 22, color: MUTED, display: "flex" }}>
            {`Run ${run.id} · $${runTotal} · ${autoCount} auto · ${financeCount} held`}
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            flexWrap: "wrap",
            width: 360,
            alignContent: "center",
            gap: 10,
          }}
        >
          {run.legs.slice(0, Math.min(legCount, 40)).map((leg) => (
            <div
              key={leg.payeeId}
              style={{
                width: 62,
                height: 40,
                borderRadius: 8,
                background: leg.tier === "auto" ? "rgba(16,185,129,0.16)" : "rgba(245,158,11,0.3)",
                border: `2px solid ${leg.tier === "auto" ? AUTO : HELD}`,
              }}
            />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
