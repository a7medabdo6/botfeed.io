import GoogleAccountPage from "@/src/components/google-account/GoogleAccountPage";
import { Suspense } from "react";

export default function GoogleAccountRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-slate-500">Loading…</div>
      }
    >
      <GoogleAccountPage />
    </Suspense>
  );
}
