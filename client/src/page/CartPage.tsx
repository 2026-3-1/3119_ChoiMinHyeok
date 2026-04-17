import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  checkoutCart,
  getCart,
  removeCartItem,
} from "../features/shared/api/api";
import { useAuth } from "../features/shared/context/AuthContext";
import { SiteHeader } from "../features/shared/layout/SiteHeader";
import { SiteFooter } from "../features/shared/layout/SiteFooter";

function formatPrice(amount: number) {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

export default function CartPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const queryClient = useQueryClient();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => getCart(user!.id),
    enabled: isLoggedIn && !!user,
    staleTime: 0,
    onSuccess: (data) => {
      setCheckedItems(data.items.map((item) => item.id));
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ cartItemId }: { cartItemId: number }) =>
      removeCartItem(user!.id, cartItemId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(["cart", user?.id], updatedCart);
      setCheckedItems((prev) => prev.filter((id) => id !== removeMutation.variables?.cartItemId));
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: () =>
      checkoutCart({
        userId: user!.id,
        cartItemIds: checkedItems,
        provider: "DEMO",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["my-learning", user?.id] });
      navigate("/my-learning");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCheckoutError(msg ?? "결제 중 오류가 발생했습니다.");
    },
  });

  const toggleItem = (itemId: number) => {
    setCheckedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="page-shell">
        <SiteHeader />
        <main className="page-main">
          <div className="site-container">
            <div className="empty-state" style={{ marginTop: "60px" }}>
              <strong>로그인이 필요합니다</strong>
              <p>장바구니를 보려면 먼저 로그인해주세요.</p>
              <button className="button button--primary" onClick={() => navigate("/login")}>
                로그인하기
              </button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const selectedItems = cart?.items.filter((item) => checkedItems.includes(item.id)) ?? [];
  const selectedTotal = selectedItems.reduce((sum, item) => sum + item.course.price, 0);

  return (
    <div className="page-shell">
      <SiteHeader />

      <main className="page-main">
        <div className="site-container">
          <section className="section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Cart</p>
                <h2>장바구니</h2>
              </div>
              {cart && (
                <span className="section-copy">총 {cart.totalCount}개 강의</span>
              )}
            </div>

            {isLoading ? (
              <div className="cart-layout">
                <div style={{ display: "grid", gap: 14 }}>
                  {[1, 2].map((i) => (
                    <div key={i} className="cart-item cart-item--skeleton">
                      <div className="skeleton-block" style={{ width: 100, height: 70, borderRadius: 12, flexShrink: 0 }} />
                      <div style={{ flex: 1, display: "grid", gap: 8 }}>
                        <div className="skeleton-line skeleton-line--md" />
                        <div className="skeleton-line skeleton-line--sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !cart || cart.items.length === 0 ? (
              <div className="empty-state">
                <strong>장바구니가 비어 있습니다</strong>
                <p>원하는 강의를 장바구니에 담아보세요.</p>
                <button className="button button--primary" onClick={() => navigate("/courses")}>
                  강의 둘러보기
                </button>
              </div>
            ) : (
              <div className="cart-layout">
                <div className="cart-items">
                  {cart.items.map((item) => (
                    <div key={item.id} className="cart-item">
                      <label className="cart-item__check">
                        <input
                          type="checkbox"
                          checked={checkedItems.includes(item.id)}
                          onChange={() => toggleItem(item.id)}
                        />
                      </label>

                      <div className="cart-item__media">
                        {item.course.thumbnail ? (
                          <img
                            src={item.course.thumbnail}
                            alt={item.course.title}
                            className="cart-item__image"
                          />
                        ) : (
                          <div className="cart-item__placeholder">SEC</div>
                        )}
                      </div>

                      <div className="cart-item__info">
                        <strong
                          className="cart-item__title"
                          onClick={() => navigate(`/courses/${item.course.id}`)}
                          style={{ cursor: "pointer" }}
                        >
                          {item.course.title}
                        </strong>
                        <span className="cart-item__price">{formatPrice(item.course.price)}</span>
                      </div>

                      <button
                        className="cart-item__remove"
                        onClick={() => removeMutation.mutate({ cartItemId: item.id })}
                        disabled={removeMutation.isPending}
                        aria-label="장바구니에서 제거"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-summary-panel">
                  <h3 className="cart-summary-panel__title">결제 요약</h3>

                  <div className="cart-summary-panel__rows">
                    <div className="cart-summary-panel__row">
                      <span>선택 강의</span>
                      <span>{selectedItems.length}개</span>
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
                    disabled={checkedItems.length === 0 || checkoutMutation.isPending}
                    onClick={() => {
                      setCheckoutError(null);
                      checkoutMutation.mutate();
                    }}
                  >
                    {checkoutMutation.isPending
                      ? "결제 처리 중..."
                      : `${formatPrice(selectedTotal)} 결제하기`}
                  </button>

                  <p className="cart-summary-panel__notice">
                    데모 결제 방식으로 실제 과금 없이 수강 등록됩니다.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
