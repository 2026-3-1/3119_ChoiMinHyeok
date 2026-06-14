import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmTossPayment } from "../features/shared/api/api";
import { SiteHeader } from "../features/shared/layout/SiteHeader";
import { SiteFooter } from "../features/shared/layout/SiteFooter";

interface PaymentMeta {
  cartItemIds: number[];
  userId: number;
}

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const confirmedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const paymentKey = searchParams.get("paymentKey") ?? "";
  const orderId = searchParams.get("orderId") ?? "";
  const amount = Number(searchParams.get("amount") ?? "0");

  const confirmMutation = useMutation({
    mutationFn: confirmTossPayment,
    onSuccess: () => {
      sessionStorage.removeItem("toss_payment_meta");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["my-learning"] });
      queryClient.invalidateQueries({ queryKey: ["learning-status"] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "결제 확인 중 오류가 발생했습니다. 고객센터에 문의해주세요.");
    },
  });

  useEffect(() => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;

    const raw = sessionStorage.getItem("toss_payment_meta");
    if (!raw || !paymentKey || !orderId || !amount) {
      setError("결제 정보가 올바르지 않습니다.");
      return;
    }

    let meta: PaymentMeta;
    try {
      meta = JSON.parse(raw) as PaymentMeta;
    } catch {
      setError("결제 정보를 읽을 수 없습니다.");
      return;
    }

    confirmMutation.mutate({
      userId: meta.userId,
      cartItemIds: meta.cartItemIds,
      paymentKey,
      orderId,
      amount,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = confirmMutation.isPending;
  const isSuccess = confirmMutation.isSuccess;

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
            {isLoading && (
              <>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: "3px solid var(--border-default)",
                    borderTopColor: "var(--accent-primary)",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    margin: "0 auto 20px",
                  }}
                />
                <p style={{ fontWeight: 600, fontSize: 18 }}>결제를 확인하는 중입니다...</p>
                <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>잠시만 기다려주세요.</p>
              </>
            )}

            {isSuccess && (
              <>
                <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                <h2 style={{ fontWeight: 700, marginBottom: 8 }}>결제 완료!</h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
                  강의가 성공적으로 등록되었습니다.
                </p>
                <button
                  className="button button--primary"
                  style={{ width: "100%", marginBottom: 10 }}
                  onClick={() => navigate("/my-learning")}
                >
                  내 학습 시작하기
                </button>
                <button className="button" style={{ width: "100%" }} onClick={() => navigate("/courses")}>
                  강의 더 보기
                </button>
              </>
            )}

            {error && (
              <>
                <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
                <h2 style={{ fontWeight: 700, marginBottom: 8 }}>결제 확인 실패</h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>{error}</p>
                <button className="button button--primary" style={{ width: "100%" }} onClick={() => navigate("/cart")}>
                  장바구니로 돌아가기
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
