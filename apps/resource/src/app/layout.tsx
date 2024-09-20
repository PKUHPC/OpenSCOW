"use client";
import React, { Suspense } from "react";
import { ScowParamsProvider } from "src/components/ScowParamsProvider";

import { ClientLayout } from "./clientLayout";
import { ServerClientProvider } from "./ServerClientProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html>
      <Suspense>
        <ScowParamsProvider>
          <ServerClientProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </ServerClientProvider>
        </ScowParamsProvider>
      </Suspense>
    </html>
  );
}
