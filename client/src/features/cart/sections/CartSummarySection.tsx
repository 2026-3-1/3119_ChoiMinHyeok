function formatPrice(amount: number) {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

interface Props {
  selectedCount: number;
  selectedTotal: number;
  checkoutError: string | null;
  isCheckingOut: boolean;
  onCheckout: () => void;
}

export function CartSummarySection({
  selectedCount,
  selectedTotal,
  checkoutError,
  isCheckingOut,
  onCheckout,
}: Props) {
  return (
    <div className="cart-summary-panel">
      <h3 className="cart-summary-panel__title">결제 요약</h3>

      <div className="cart-summary-panel__rows">
        <div className="cart-summary-panel__row">
          <span>선택 강의</span>
          <span>{selectedCount}개</span>
        </div>
        <div className="cart-summary-panel__row cart-summary-panel__row--total">
          <span>결제 금액</span>
          <strong>{formatPrice(selectedTotal)}</strong>
        </div>
      </div>

      {checkoutError && (
        <p className="auth-form__error" style={{ marginBottom: 10 }}>
          {checkoutError}
        </p>
      )}

      <button
        className="button button--primary"
        style={{ width: "100%" }}
        disabled={selectedCount === 0 || isCheckingOut}
        onClick={onCheckout}
      >
        {isCheckingOut ? "결제 처리 중..." : `${formatPrice(selectedTotal)} 결제하기`}
      </button>

      <p className="cart-summary-panel__notice">
        데모 결제 방식으로 실제 과금 없이 수강 등록됩니다.
      </p>
    </div>
  );
}
