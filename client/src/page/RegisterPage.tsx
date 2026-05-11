import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../features/shared/api/api";
import { useAuth } from "../features/shared/context/AuthContext";
import { BrandLogo } from "../features/shared/components/BrandLogo";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        ...(description.trim() ? { description: description.trim() } : {}),
      };
      const user = await register(payload);
      setUser(user);
      navigate("/");
    } catch (err: unknown) {
      const raw = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw.join(", ") : typeof raw === "string" ? raw : null;
      setError(msg ?? "회원가입에 실패했습니다. 입력 내용을 확인해주세요.");
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
        <h1 className="auth-card__title">회원가입</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <label htmlFor="name" className="auth-form__label">이름</label>
            <input
              id="name"
              type="text"
              className="auth-form__input"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="reg-email" className="auth-form__label">이메일</label>
            <input
              id="reg-email"
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
            <label htmlFor="reg-password" className="auth-form__label">비밀번호</label>
            <input
              id="reg-password"
              type="password"
              className="auth-form__input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label">역할</label>
            <div className="auth-form__role-group">
              <label className={`auth-form__role-option${role === "STUDENT" ? " is-active" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="STUDENT"
                  checked={role === "STUDENT"}
                  onChange={() => setRole("STUDENT")}
                />
                학습자
              </label>
              <label className={`auth-form__role-option${role === "INSTRUCTOR" ? " is-active" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="INSTRUCTOR"
                  checked={role === "INSTRUCTOR"}
                  onChange={() => setRole("INSTRUCTOR")}
                />
                강사
              </label>
            </div>
          </div>

          <div className="auth-form__field">
            <label htmlFor="description" className="auth-form__label">
              소개 <span style={{ color: "#90a7bf", fontWeight: 400 }}>(선택)</span>
            </label>
            <textarea
              id="description"
              className="auth-form__input auth-form__textarea"
              placeholder="보안 입문 학습자입니다."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {error && <p className="auth-form__error">{error}</p>}

          <button type="submit" className="button button--primary auth-form__submit" disabled={isLoading}>
            {isLoading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="auth-card__footer">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="auth-card__link">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
