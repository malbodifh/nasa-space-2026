import { Suspense } from "react";

import SiteHeader from "@/components/SiteHeader";
import SurfaceStudy from "@/components/SurfaceStudy";

export default function Page() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Suspense fallback={<div className="mx-auto mt-24 h-80 w-full max-w-[860px] px-4 sm:px-6" />}>
        <SurfaceStudy />
      </Suspense>
    </div>
  );
}
