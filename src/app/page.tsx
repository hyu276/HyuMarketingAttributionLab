import Link from 'next/link';

export default function Home() {
  return (
    <div className="stack-lg">
      <div className="eyebrow">PRODUCT / DEVELOPMENT STATUS</div>
      <section className="hero">
        <div>
          <h1>Trace where a conversion gets its credit.</h1>
          <p className="lead">So sánh First-touch và Last-non-direct-touch trên cùng một đơn hàng có dữ liệu minh họa. Mục tiêu không phải phóng đại hiệu quả quảng cáo, mà là giải thích chính xác vì sao một nguồn được ghi nhận.</p>
          <div className="action-row">
            <Link href="/lab" className="button button-primary">Mở Attribution Workbench <span aria-hidden="true">↗</span></Link>
            <Link href="/utm" className="button button-secondary">Tạo liên kết UTM</Link>
          </div>
        </div>
        <div className="hero-proof" aria-label="Production readiness">
          <p className="overline">CURRENT DELIVERY</p>
          <p className="proof-heading">Rule engine <strong>available</strong></p>
          <p>Domain functions và test scenario độc lập đã được xây dựng. Database, authentication, tracker và reports chưa vận hành.</p>
          <div className="hairline" />
          <p className="overline">DATA STATUS</p>
          <strong className="data-label">100% synthetic fixture</strong>
        </div>
      </section>
      <section aria-labelledby="pipeline-heading">
        <div className="section-heading"><h2 id="pipeline-heading">How the measurement chain works</h2><p>Ba nguồn dữ liệu có vai trò khác nhau. Không thể thay thế lẫn nhau.</p></div>
        <div className="pipeline">
          <div><span className="step">01 / OBSERVED</span><h3>Consented touchpoints</h3><p>Ghi nhận traffic trong phạm vi browser cho phép, có thể thiếu sự kiện.</p></div>
          <div><span className="step">02 / VERIFIED</span><h3>Trusted orders</h3><p>Chỉ backend hoặc import được xác thực mới quyết định doanh thu thật.</p></div>
          <div><span className="step">03 / DERIVED</span><h3>Attribution credit</h3><p>Mỗi mô hình phân bổ một góc nhìn, không cộng dồn các model.</p></div>
        </div>
      </section>
      <section aria-labelledby="status-heading">
        <div className="section-heading"><h2 id="status-heading">Implementation status</h2><p>Tiến độ minh bạch thay vì hiển thị dashboard số giả.</p></div>
        <div className="table-scroll"><table><thead><tr><th>Capability</th><th>Current state</th><th>Next dependency</th></tr></thead><tbody>
          <tr><td>Attribution rules</td><td><span className="tag tag-ready">Pure functions</span></td><td>Trusted database pipeline</td></tr>
          <tr><td>UTM URL creation</td><td><span className="tag tag-ready">Local builder</span></td><td>Authenticated campaign registry</td></tr>
          <tr><td>Order import and spend</td><td><span className="tag tag-pending">Not implemented</span></td><td>Auth, PostgreSQL, CSV validation</td></tr>
          <tr><td>Consent and event collection</td><td><span className="tag tag-pending">Not implemented</span></td><td>Consent policy and collection API</td></tr>
          <tr><td>Live reporting</td><td><span className="tag tag-pending">Not implemented</span></td><td>Verified transactions and reporting queries</td></tr>
        </tbody></table></div>
      </section>
    </div>
  );
}
