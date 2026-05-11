import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../features/shared/api/api";
import { useAuth } from "../../features/shared/context/AuthContext";
import { BrandLogo } from "../../features/shared/components/BrandLogo";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login({ email, password });
      if (user.role !== "ADMIN") {
        setError("관리자 계정이 아닙니다.");
        return;
      }
      setUser(user);
      navigate("/admin/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo">
          <BrandLogo />
        </div>

        <p className="eyebrow" style={{ textAlign: "center" }}>Admin Panel</p>
        <h1 className="auth-card__title">관리자 로그인</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <label htmlFor="email" className="auth-form__label">이메일</label>
            <input
              id="email"
              type="email"
              className="auth-form__input"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="password" className="auth-form__label">비밀번호</label>
            <input
              id="password"
              type="password"
              className="auth-form__input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="auth-form__error">{error}</p>}

          <button
            type="submit"
            className="button button--primary auth-form__submit"
            disabled={isLoading}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
