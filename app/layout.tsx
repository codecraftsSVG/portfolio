import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "S. Vamshidhar Goud | Senior GenAI & Agentic AI Engineer",
  description: "Senior GenAI and Agentic AI Engineer building production AI platforms and enterprise agent systems.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
