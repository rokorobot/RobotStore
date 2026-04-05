import { SignInForm } from "@/components/auth/sign-in-form";
import Link from "next/link";
import { Terminal } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="max-w-md w-full border border-border bg-brand-panel p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
          <Terminal className="w-6 h-6 text-brand-signal" />
          <h1 className="text-xl font-bold font-mono tracking-widest text-brand-text uppercase">
            Operator Access
          </h1>
        </div>
        
        <p className="text-brand-text/50 font-mono text-xs mb-6 lowercase">
          // authenticate terminal session
        </p>

        <SignInForm />

        <div className="mt-8 pt-4 border-t border-border text-center text-xs font-mono">
          <span className="text-brand-text/50">Lacking clearance? </span>
          <Link href="/auth/sign-up" className="text-brand-signal hover:underline">
            Request Terminal Protocol
          </Link>
        </div>
      </div>
    </div>
  );
}
