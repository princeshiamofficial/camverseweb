import { ImageResponse } from "next/og";
import { SITE } from "@/lib/seo";

export const alt = "CamVerse — Your AI Camera & Content Studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #4c1d95 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: "linear-gradient(135deg, #6366f1, #4338ca)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
            }}
          >
            ▶
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, display: "flex" }}>
            Cam<span style={{ color: "#a5b4fc", display: "flex" }}>Verse</span>
          </div>
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#c7d2fe",
            fontWeight: 600,
            marginBottom: 16,
            display: "flex",
          }}
        >
          {SITE.tagline}
        </div>
        <div
          style={{
            fontSize: 26,
            color: "#fbbf24",
            fontWeight: 700,
            letterSpacing: 2,
            display: "flex",
          }}
        >
          RECORD · CREATE · BRAND · PUBLISH
        </div>
      </div>
    ),
    { ...size }
  );
}
