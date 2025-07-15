import "./globals.css";
import ClientProviders from "./client-providers";

export const metadata = {
  title: "JinAI",
  description: "AI-powered quiz game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
