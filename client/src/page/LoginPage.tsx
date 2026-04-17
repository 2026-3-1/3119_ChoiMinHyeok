import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../features/shared/api/api";
import { useAuth } from "../features/shared/context/AuthContext";
import { BrandLogo } from "../features/shared/components/BrandLogo";

export default function LoginPage() {
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
      setUser(user);
      navigate("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-card__logo">
          <BrandLogo />
        </Link>

        <p className="eyebrow" style={{ textAlign: "center" }}>Security Learning Platform</p>
        <h1 className="auth-card__title">로그인</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <label htmlFor="email" className="auth-form__label">이메일</label>
            <input
              id="email"
              type="email"
              className="auth-form__input"
              placeholder="student@example.com"
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

          <button type="submit" className="button button--primary auth-form__submit" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="auth-card__footer">
          계정이 없으신가요?{" "}
          <Link to="/register" className="auth-card__link">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
