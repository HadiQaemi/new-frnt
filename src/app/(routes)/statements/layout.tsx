'use client'

import Navbar from "@/app/components/layout/Navbar";
import { Providers } from "@/app/providers/providers";

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="min-h-[calc(100vh-18.9rem)] flex flex-col dark:text-black pt-[10px]">
      <main className="flex-grow">
        <Providers>{children}</Providers>
      </main>
    </div>
  );
};

export default RootLayout;