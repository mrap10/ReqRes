import { ImageResponse } from "next/og";

export const alt = "ReqRes — Practice Express.js challenges";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function TwitterImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#09090b",
        backgroundImage:
          "linear-gradient(to right, #80808018 1px, transparent 1px), linear-gradient(to bottom, #80808018 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        padding: "60px 80px",
        gap: "64px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 220,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1,
            letterSpacing: "-0.04em",
            textShadow: "0 0 80px rgba(255,255,255,0.15)",
          }}
        >
          {"</>"}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "16px",
          flex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            Req
          </span>
          <span
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: "#71717a",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            Res
          </span>
        </div>
        <p
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            lineHeight: 1.5,
            margin: 0,
            maxWidth: 500,
          }}
        >
          Get hands-on backend logic skills with real-world Express.js challenges.
        </p>
      </div>
    </div>,
    { ...size }
  );
}
