export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-brand-bg py-8 px-4 sm:px-6 font-mono text-xs text-brand-text/50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>ROBOTSTORE.APP // GLOBAL ACCESS NODE</div>
        <div className="flex gap-4">
          <span className="text-brand-signal">● OPERATIONAL</span>
          <span>LATENCY: 12ms</span>
        </div>
      </div>
    </footer>
  );
}
