import { useNavigate } from "react-router-dom";
import type { CartItemResponse } from "../../shared/types";

function formatPrice(amount: number) {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

interface Props {
  items: CartItemResponse[];
  checkedItems: number[];
  isRemoving: boolean;
  onToggle: (id: number) => void;
  onRemove: (cartItemId: number) => void;
}

export function CartItemsSection({ items, checkedItems, isRemoving, onToggle, onRemove }: Props) {
  const navigate = useNavigate();

  return (
    <div className="cart-items">
      {items.map((item) => (
        <div key={item.id} className="cart-item">
          <label className="cart-item__check">
            <input
              type="checkbox"
              checked={checkedItems.includes(item.id)}
              onChange={() => onToggle(item.id)}
            />
          </label>

          <div className="cart-item__media">
            {item.course.thumbnail ? (
              <img src={item.course.thumbnail} alt={item.course.title} className="cart-item__image" />
            ) : (
              <div className="cart-item__placeholder">SEC</div>
            )}
          </div>

          <div className="cart-item__info">
            <strong
              className="cart-item__title"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/courses/${item.course.id}`)}
            >
              {item.course.title}
            </strong>
            <span className="cart-item__price">{formatPrice(item.course.price)}</span>
          </div>

          <button
            className="cart-item__remove"
            aria-label="장바구니에서 제거"
            disabled={isRemoving}
            onClick={() => onRemove(item.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
