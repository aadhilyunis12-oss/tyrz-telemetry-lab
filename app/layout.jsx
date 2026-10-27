import './globals.css';

export const metadata = {
  title: 'AI Tyre Health Scanner — Ferrari F40 Telemetry & Tread Diagnostics',
  description: 'Scan your tyre. Measure tread depth. Estimate remaining tyre life with high-precision computer vision algorithms.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="red">
      <body>
        {children}
      </body>
    </html>
  );
}
