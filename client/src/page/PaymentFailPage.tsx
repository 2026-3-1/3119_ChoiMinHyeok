import { useNavigate, useSearchParams } from "react-router-dom";
import { SiteHeader } from "../features/shared/layout/SiteHeader";
import { SiteFooter } from "../features/shared/layout/SiteFooter";

const ERROR_MESSAGES: Record<string, string> = {
  PAY_PROCESS_CANCELED: "결제를 취소하셨습니다.",
  PAY_PROCESS_ABORTED: "결제가 중단되었습니다.",
  REJECT_CARD_COMPANY: "카드사에서 결제를 거절했습니다.",
  INSUFFICIENT_BALANCE: "잔액이 부족합니다.",
};

export default function PaymentFailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const code = searchParams.get("code") ?? "";
  const message = searchParams.get("message") ?? "결제에 실패했습니다.";
  const displayMessage = ERROR_MESSAGES[code] ?? message;

  return (
    <div className="page-shell">
      <SiteHeader />

      <main className="page-main">
        <div className="site-container">
          <div
            style={{
              maxWidth: 480,
              margin: "80px auto",
              textAlign: "center",
              padding: "40px 32px",
              background: "var(--surface-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: 16,
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontWeight: 700, marginBottom: 8 }}>결제 실패</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 8 }}>{displayMessage}</p>
            {code && (
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 32 }}>
                오류 코드: {code}
              </p>
            )}
            <button
              className="button button--primary"
              style={{ width: "100%", marginBottom: 10 }}
              onClick={() => navigate("/cart")}
            >
              장바구니로 돌아가기
            </button>
            <button className="button" style={{ width: "100%" }} onClick={() => navigate("/courses")}>
              강의 둘러보기
            </button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
