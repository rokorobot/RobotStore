export function CrtOverlay() {
  return (
    <>
      <div className="fixed inset-0 crt-overlay pointer-events-none z-50" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,255,156,0.02)_0%,rgba(0,10,5,0.6)_100%)] z-40 mix-blend-multiply" />
    </>
  );
}
