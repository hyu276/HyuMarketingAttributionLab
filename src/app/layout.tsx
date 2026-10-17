import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Marketing Attribution Lab | Measurement workbench',
  description: 'Explore deterministic first-touch and last-non-direct attribution rules with an explicitly synthetic scenario.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <div className="shell">
          <aside className="sidebar" aria-label="Primary navigation">
            <Link href="/" className="brand" aria-label="Marketing Attribution Lab, home">
              <span className="brand-mark">M<span>.</span></span>
              <span>Marketing<br /><strong>Attribution Lab</strong></span>
            </Link>
            <p className="nav-kicker">WORKSPACE</p>
            <nav className="main-nav" aria-label="Các trang">
              <Link href="/" className="nav-link">Project overview</Link>
              <Link href="/lab" className="nav-link">Attribution workbench</Link>
              <Link href="/utm" className="nav-link">UTM link builder</Link>
            </nav>
            <div className="sidebar-status">
              <span className="status-dot" aria-hidden="true" />
              <strong>Development preview</strong>
              <p>Chưa kết nối đơn hàng hoặc dữ liệu quảng cáo thật.</p>
            </div>
          </aside>
          <div className="workspace">
            <header className="topbar">
              <span className="topbar-context">Hyu Industries / Measurement tools</span>
              <span className="environment-label">SYNTHETIC LAB</span>
            </header>
            <main id="main-content" className="content">{children}</main>
            <footer className="page-footer">Rule-based attribution ≠ causal incrementality. No live tracking in this preview.</footer>
          </div>
        </div>
      </body>
    </html>
  );
}
