import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, submitBanAppeal } from "../features/shared/api/api";
import { useAuth } from "../features/shared/context/AuthContext";
import { BrandLogo } from "../features/shared/components/BrandLogo";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isBanned, setIsBanned] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealEmail, setAppealEmail] = useState("");
  const [appealMessage, setAppealMessage] = useState("");
  const [appealLoading, setAppealLoading] = useState(false);
  const [appealResult, setAppealResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsBanned(false);
    setIsLoading(true);

    try {
      const user = await login({ email, password });
      setUser(user);
      navigate("/");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      const msg = axiosErr?.response?.data?.message;
      const status = axiosErr?.response?.status;

      if (status === 403 && msg?.includes("정지")) {
        setIsBanned(true);
        setError(msg ?? "정지된 계정입니다.");
        setAppealEmail(email);
      } else {
        setError(msg ?? "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppealLoading(true);
    setAppealResult(null);
    try {
      await submitBanAppeal(appealEmail, appealMessage);
      setAppealResult({ ok: true, msg: "요청이 전송되었습니다. 관리자가 검토 후 연락드립니다." });
      setAppealMessage("");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setAppealResult({ ok: false, msg: msg ?? "전송에 실패했습니다. 잠시 후 다시 시도해주세요." });
    } finally {
      setAppealLoading(false);
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

          {error && (
            <div>
              <p className="auth-form__error">{error}</p>
              {isBanned && (
                <button
                  type="button"
                  className="button button--secondary"
                  style={{ width: "100%", marginTop: "0.5rem" }}
                  onClick={() => { setShowAppealModal(true); setAppealResult(null); }}
                >
                  정지 해제 요청 보내기
                </button>
              )}
            </div>
          )}

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

      {showAppealModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAppealModal(false); }}
        >
          <div style={{
            background: "#fff", borderRadius: "0.75rem", padding: "2rem",
            width: "100%", maxWidth: "480px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}>
            <h2 style={{ marginBottom: "0.5rem", fontSize: "1.25rem", fontWeight: 700 }}>
              정지 해제 요청
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              관리자에게 계정 정지 해제를 요청합니다. 요청 사유를 작성해주세요.
            </p>

            {appealResult ? (
              <div>
                <p style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  background: appealResult.ok ? "#d1fae5" : "#fee2e2",
                  color: appealResult.ok ? "#065f46" : "#991b1b",
                  marginBottom: "1rem",
                }}>
                  {appealResult.msg}
                </p>
                <button
                  className="button button--secondary"
                  style={{ width: "100%" }}
                  onClick={() => setShowAppealModal(false)}
                >
                  닫기
                </button>
              </div>
            ) : (
              <form onSubmit={handleAppealSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.9rem" }}>
                    이메일
                  </label>
                  <input
                    type="email"
                    className="auth-form__input"
                    value={appealEmail}
                    onChange={(e) => setAppealEmail(e.target.value)}
                    required
                  />
                </div>
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.9rem" }}>
                    요청 사유
                  </label>
                  <textarea
                    className="auth-form__input"
                    rows={4}
                    placeholder="정지 해제를 요청하는 이유를 입력해주세요."
                    value={appealMessage}
                    onChange={(e) => setAppealMessage(e.target.value)}
                    required
                    style={{ resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    type="button"
                    className="button button--secondary"
                    style={{ flex: 1 }}
                    onClick={() => setShowAppealModal(false)}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="button button--primary"
                    style={{ flex: 1 }}
                    disabled={appealLoading}
                  >
                    {appealLoading ? "전송 중..." : "요청 전송"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
