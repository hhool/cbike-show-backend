export const metadata = {
  title: "童车评测实验室",
  description: "全球专业童车第三方评测与选购决策平台"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
