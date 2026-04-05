import { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { SignalFeed } from "./signal-feed";
import { CrtOverlay } from "./crt-overlay";

export function NavShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <CrtOverlay />
      <SignalFeed />
      <SiteHeader />
      <main className="flex-1 relative z-10 w-full">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
