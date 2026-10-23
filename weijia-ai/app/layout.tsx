import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "鲜唯佳 · AI 聊天工作台",
  description: "与鲜唯佳的 AI 分身聊爵士、棋间、机会地图和有趣的问题。明确身份、短期会话。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
