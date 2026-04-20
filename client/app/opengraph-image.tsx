import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "linear-gradient(140deg, #060708 0%, #0d1014 70%)",
        color: "#f1f4f8",
        padding: "64px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0",
          background:
            "radial-gradient(circle at 20% 20%, rgba(246,231,29,0.3), transparent 35%), radial-gradient(circle at 85% 15%, rgba(246,231,29,0.15), transparent 25%)",
        }}
      />
      <div
        style={{
          fontSize: 26,
          letterSpacing: 8,
          textTransform: "uppercase",
          color: "#f6e71d",
        }}
      >
        Black Lightning
      </div>
      <div
        style={{
          fontSize: 82,
          marginTop: 18,
          lineHeight: 1.04,
          fontWeight: 700,
          maxWidth: 900,
        }}
      >
        Cinematic Music Recognition
      </div>
      <div
        style={{ marginTop: 18, fontSize: 30, color: "#b6bcc8", maxWidth: 880 }}
      >
        Add tracks, fingerprint audio, and identify songs with electric
        precision.
      </div>
    </div>,
    size,
  );
}
