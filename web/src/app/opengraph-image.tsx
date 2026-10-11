import { ImageResponse } from "next/og";

import { autoCount, financeCount, legCount, runTotal } from "@/lib/demo";

export const alt = "FlowRail — payout operations on Tempo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#fbfaf7",
          color: "#1c1917",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#57534e" }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#10b981" }} />
          FlowRail · payout operations on Tempo
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 108, lineHeight: 1, letterSpacing: -3 }}>
          <span>{legCount} payees.</span>
          <span>{financeCount === 1 ? "One signature." : `${financeCount} signatures.`}</span>
        </div>
        <div style={{ display: "flex", gap: 48, fontSize: 28, color: "#57534e" }}>
          <span>${runTotal} run</span>
          <span style={{ color: "#059669" }}>{autoCount} clear themselves</span>
          <span style={{ color: "#d97706" }}>{financeCount} waits for a person</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
