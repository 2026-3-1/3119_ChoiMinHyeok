import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCart, prepareTossPayment, removeCartItem } from "../features/shared/api/api";
import { useAuth } from "../features/shared/context/AuthContext";
import { SiteHeader } from "../features/shared/layout/SiteHeader";
import { SiteFooter } from "../features/shared/layout/SiteFooter";
import { CartItemsSection } from "../features/cart/sections/CartItemsSection";
import { CartSummarySection } from "../features/cart/sections/CartSummarySection";

export default function CartPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const queryClient = useQueryClient();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const initializedRef = useRef(false);

  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => getCart(user!.id),
    enabled: isLoggedIn && !!user,
    staleTime: 0,
  });

  useEffect(() => {
    if (cart && !initializedRef.current) {
      initializedRef.current = true;
      setCheckedItems(cart.items.map((item) => item.id));
    }
  }, [cart]);

  const removeMutation = useMutation({
    mutationFn: ({ cartItemId }: { cartItemId: number }) => removeCartItem(user!.id, cartItemId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(["cart", user?.id], updatedCart);
      setCheckedItems((prev) => prev.filter((id) => id !== removeMutation.variables?.cartItemId));
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: () => prepareTossPayment({ userId: user!.id, cartItemIds: checkedItems }),
    onSuccess: (prepared) => {
      navigate("/payment", {
        state: {
          orderId: prepared.orderId,
          orderName: prepared.orderName,
          amount: prepared.amount,
          cartItemIds: checkedItems,
        },
      });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCheckoutError(msg ?? "결제 준비 중 오류가 발생했습니다.");
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
              {cart && <span className="section-copy">총 {cart.totalCount}개 강의</span>}
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
                <CartItemsSection
                  items={cart.items}
                  checkedItems={checkedItems}
                  isRemoving={removeMutation.isPending}
                  onToggle={toggleItem}
                  onRemove={(cartItemId) => removeMutation.mutate({ cartItemId })}
                />
                <CartSummarySection
                  selectedCount={selectedItems.length}
                  selectedTotal={selectedTotal}
                  checkoutError={checkoutError}
                  isCheckingOut={checkoutMutation.isPending}
                  onCheckout={() => { setCheckoutError(null); checkoutMutation.mutate(); }}
                />
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
