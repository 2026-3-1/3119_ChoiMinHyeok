import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useAuth } from "../features/shared/context/AuthContext";
import { SiteHeader } from "../features/shared/layout/SiteHeader";
import { SiteFooter } from "../features/shared/layout/SiteFooter";

interface PaymentLocationState {
  orderId: string;
  orderName: string;
  amount: number;
  cartItemIds: number[];
}

const CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY as string;

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as PaymentLocationState | null;
  const [isPaying, setIsPaying] = useState(false);

  const handlePay = async () => {
    if (!state || !user || !CLIENT_KEY) return;
    setIsPaying(true);

    sessionStorage.setItem(
      "toss_payment_meta",
      JSON.stringify({ cartItemIds: state.cartItemIds, userId: user.id }),
    );

    try {
      const tossPayments = await loadTossPayments(CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: `user_${user.id}` });

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: state.amount },
        orderId: state.orderId,
        orderName: state.orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error?.code !== "USER_CANCEL") {
        console.error("결제 요청 오류", err);
      }
      setIsPaying(false);
    }
  };

  if (!state) {
    return (
      <div className="page-shell">
        <SiteHeader />
        <main className="page-main">
          <div className="site-container">
            <div className="empty-state" style={{ marginTop: 60 }}>
              <strong>잘못된 접근입니다</strong>
              <p>장바구니에서 결제를 시작해주세요.</p>
              <button className="button button--primary" onClick={() => navigate("/cart")}>
                장바구니로 이동
              </button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <SiteHeader />

      <main className="page-main">
        <div className="site-container">
          <section className="section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Payment</p>
                <h2>결제하기</h2>
              </div>
            </div>

            <div
              style={{
                maxWidth: 480,
                margin: "0 auto",
                background: "var(--surface-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: 16,
                padding: "32px",
              }}
            >
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>주문 상품</p>
                <p style={{ fontWeight: 600 }}>{state.orderName}</p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "16px 0",
                  borderTop: "1px solid var(--border-default)",
                  borderBottom: "1px solid var(--border-default)",
                  marginBottom: 24,
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>결제 금액</span>
                <strong style={{ fontSize: 20 }}>
                  ₩{state.amount.toLocaleString("ko-KR")}
                </strong>
              </div>

              <button
                className="button button--primary"
                style={{ width: "100%", marginBottom: 10 }}
                disabled={isPaying}
                onClick={handlePay}
              >
                {isPaying ? "결제창 로딩 중..." : `₩${state.amount.toLocaleString("ko-KR")} 카드 결제`}
              </button>

              <button
                className="button"
                style={{ width: "100%" }}
                onClick={() => navigate("/cart")}
                disabled={isPaying}
              >
                장바구니로 돌아가기
              </button>

              <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 16, textAlign: "center" }}>
                토스페이먼츠 보안 결제창이 열립니다
              </p>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
