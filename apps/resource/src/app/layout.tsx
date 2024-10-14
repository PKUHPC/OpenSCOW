"use client";
import React from "react";

import { ClientLayout } from "./clientLayout";
import { ServerClientProvider } from "./ServerClientProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html>
      <ServerClientProvider>
        <ClientLayout>
          {children}
        </ClientLayout>
      </ServerClientProvider>
    </html>
  );
}
