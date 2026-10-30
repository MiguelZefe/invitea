import { ImageResponse } from "next/og";

export function GET() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", padding: 54, backgroundColor: "#f3eee7", color: "#2f342d" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 680, padding: "22px 36px 22px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 30, fontWeight: 700, letterSpacing: -1 }}>
          ZefeInvita<span style={{ color: "#9c6754" }}>.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#a56d54", fontSize: 18, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>Invitaciones digitales</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 24, fontSize: 68, fontWeight: 700, letterSpacing: -3, lineHeight: 1.08 }}>
            <span>Tu celebración</span><span>empieza aquí.</span>
          </div>
          <div style={{ marginTop: 28, fontSize: 25, color: "#665f56" }}>Elige una plantilla y hazla tuya.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 18, color: "#655c51" }}>
          <span style={{ width: 10, height: 10, borderRadius: 10, backgroundColor: "#b7765e" }} />
          Cumpleaños y bautizos sencillos · $99 MXN
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 410, height: "100%", borderRadius: 30, backgroundColor: "#d9c9bb", transform: "rotate(3deg)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", width: 345, height: 460, padding: "48px 24px 42px", borderRadius: 22, border: "2px solid #d9b890", backgroundColor: "#fff9ee", boxShadow: "0 18px 42px #48362940", textAlign: "center" }}>
          <div style={{ color: "#a16d55", fontSize: 14, fontWeight: 700, letterSpacing: 3 }}>INVITACIÓN DE EJEMPLO</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 16, color: "#96775c", letterSpacing: 4 }}>CELEBREMOS</span>
            <span style={{ marginTop: 22, fontSize: 55, fontWeight: 700, color: "#5a3e3e" }}>Sofía</span>
            <span style={{ marginTop: 14, fontSize: 20, color: "#7c6655" }}>Una fiesta para recordar</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#99755e", fontSize: 15, letterSpacing: 2 }}>
            <span>MUESTRA FICTICIA</span>
            <span style={{ marginTop: 10 }}>ZEFEINVITA.COM.MX</span>
          </div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
