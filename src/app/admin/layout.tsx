import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { CrtOverlay } from "@/components/layout/crt-overlay";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg text-brand-text">
       <CrtOverlay />
       <AdminSidebar />
       <div className="flex flex-col flex-1 w-full overflow-hidden relative z-10">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-8">
            {children}
          </main>
       </div>
    </div>
  );
}
