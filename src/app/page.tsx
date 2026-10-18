import Link from 'next/link';

export default function Home() {
  return (
    <div className="stack-lg">
      <div className="eyebrow">PRODUCT / DEVELOPMENT STATUS</div>
      <section className="hero">
        <div>
          <h1>Trace where a conversion gets its credit.</h1>
          <p className="lead">So sánh First-touch và Last-non-direct-touch trên cùng một tập đơn hàng. Console sử dụng dữ liệu từ PostgreSQL khi được cấu hình; workbench minh họa dùng tình huống tổng hợp được gắn nhãn rõ ràng.</p>
          <div className="action-row">
            <Link href="/console" className="button button-primary">Mở workspace console <span aria-hidden="true">↗</span></Link>
            <Link href="/lab" className="button button-secondary">Xem kịch bản minh họa</Link>
          </div>
        </div>
        <div className="hero-proof" aria-label="Production readiness">
          <p className="overline">CURRENT DELIVERY</p>
          <p className="proof-heading">Local app <strong>available</strong></p>
          <p>Code hiện có gồm xác thực, PostgreSQL, bộ thu thập có consent, nhập CSV và báo cáo. Cần cấu hình môi trường cục bộ để vận hành.</p>
          <div className="hairline" />
          <p className="overline">DATA STATUS</p>
          <strong className="data-label">Lab: synthetic · Console: workspace data</strong>
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
        <div className="section-heading"><h2 id="status-heading">Implementation status</h2><p>Đã có code full stack cục bộ; chưa phải hệ thống production.</p></div>
        <div className="table-scroll"><table><thead><tr><th>Capability</th><th>Current state</th><th>Next dependency</th></tr></thead><tbody>
          <tr><td>Attribution rules</td><td><span className="tag tag-ready">Implemented locally</span></td><td>Production validation</td></tr>
          <tr><td>UTM URL creation</td><td><span className="tag tag-ready">Local and registered builder</span></td><td>Production validation</td></tr>
          <tr><td>Order import and spend</td><td><span className="tag tag-ready">CSV preview and commit</span></td><td>Trusted commerce integration</td></tr>
          <tr><td>Consent and event collection</td><td><span className="tag tag-ready">Local collector</span></td><td>Legal policy and abuse controls</td></tr>
          <tr><td>Workspace reporting</td><td><span className="tag tag-ready">Database-backed</span></td><td>Scale and accessibility review</td></tr>
        </tbody></table></div>
      </section>
    </div>
  );
}
