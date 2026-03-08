import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IdCard, Lock, Eye, EyeOff, AlertTriangle, Check } from "lucide-react";
import "./login.css";

export default function LoginPage({ setIsAuthenticated }) { 
  const navigate = useNavigate();
  const [empId, setEmpId]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [focused, setFocused]   = useState("");
  const [success, setSuccess]   = useState(false);
  const [userName, setUserName] = useState("");

  const clearErr = () => setError("");

  const handleSubmit = async () => {
    if (!empId || !password) {
      setError("Please enter your Employee ID and password.");
      return;
    }
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 1300));

    if (empId === "EMP001" && password === "password123") {
      setSuccess(true);
      setTimeout(() => {
        const session = {
          token: "demo-token",
          user: {
            id: "EMP001",
            name: "Kueh Pang Lang",
            department: "Engineering",
            job_title: "Senior Engineer",
          },
        };
        sessionStorage.setItem("session", JSON.stringify(session));
        setUserName(session.user.name);
        setIsAuthenticated(true);
        // Check if walkthrough was already watched
        const walkthroughWatched = sessionStorage.getItem("walkthroughWatched");
        navigate(walkthroughWatched ? "/" : "/walkthrough");
      }, 1900);
    } else {
      setError("Invalid Employee ID or password. Try EMP001 / password123");
      setLoading(false);
    }
  };

  const onKey = e => { if (e.key === "Enter") handleSubmit(); };

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="login-page">
        <div className="login-bg-grid" />
        <div className="login-bg-blob login-bg-blob-1" />
        <div className="login-bg-blob login-bg-blob-2" />
        <div className="login-bg-blob login-bg-blob-3" />
        <div className="login-card">
          <div className="login-logo-row" style={{ flexDirection: 'column', gap: 16 }}>
            <img 
              src="/chg_logo.png" 
              alt="Logo" 
              style={{ 
                width: '60%', 
                height: 'auto', 
                borderRadius: 12 
              }} 
            />
            <div className="login-logo-sub" style={{ fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Employee Portal</div>
          </div>
          <div className="login-success">
            <div className="login-success-icon">
              <Check size={28} strokeWidth={2} />
            </div>
            <h3>Signed in successfully</h3>
            <p>Welcome back. Loading your dashboard…</p>
            <div className="login-redirect-bar">
              <div className="login-redirect-fill" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Login form ── */
  return (
    <div className="login-page">
      <div className="login-bg-grid" />
      <div className="login-bg-blob login-bg-blob-1" />
      <div className="login-bg-blob login-bg-blob-2" />
      <div className="login-bg-blob login-bg-blob-3" />

      <div className="login-card">

        {/* Logo */}
        <div className="login-logo-row" style={{ flexDirection: 'column', gap: 16 }}>
          <img 
            src="/chg_logo.png" 
            alt="Logo" 
            style={{ 
              width: '60%', 
              height: 'auto', 
              borderRadius: 12 
            }} 
          />
          <div className="login-logo-sub" style={{ fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Employee Portal</div>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1>Welcome back</h1>
          <p>Sign in with your Employee ID to continue</p>
        </div>

        {/* Employee ID */}
        <div className="login-field">
          <div className="login-field-label">
            <span>Employee ID</span>
          </div>
          <div className={`login-input-wrap ${focused === "id" ? "is-focused" : ""} ${error ? "is-error" : ""}`}>
            <span className="login-input-icon">
              <IdCard size={18} strokeWidth={1.8} />
            </span>
            <input
              type="text"
              placeholder="e.g. EMP001"
              value={empId}
              onChange={e => { setEmpId(e.target.value.toUpperCase()); clearErr(); }}
              onFocus={() => setFocused("id")}
              onBlur={() => setFocused("")}
              onKeyDown={onKey}
              autoComplete="username"
            />
          </div>
        </div>

        {/* Password */}
        <div className="login-field">
          <div className="login-field-label">
            <span>Password</span>
            <a href="#" onClick={e => { e.preventDefault(); alert("Redirect to password reset"); }}>
              Forgot password?
            </a>
          </div>
          <div className={`login-input-wrap ${focused === "pw" ? "is-focused" : ""} ${error ? "is-error" : ""}`}>
            <span className="login-input-icon">
              <Lock size={18} strokeWidth={1.8} />
            </span>
            <input
              type={showPw ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={e => { setPassword(e.target.value); clearErr(); }}
              onFocus={() => setFocused("pw")}
              onBlur={() => setFocused("")}
              onKeyDown={onKey}
              autoComplete="current-password"
            />
            <button
              className="login-pw-toggle"
              onClick={() => setShowPw(p => !p)}
              title={showPw ? "Hide password" : "Show password"}
              type="button"
            >
              {showPw ? (
                <EyeOff size={18} strokeWidth={1.8} />
              ) : (
                <Eye size={18} strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error">
            <AlertTriangle size={18} strokeWidth={2} />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          className="login-submit"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="login-dots">
                <span className="login-dot" />
                <span className="login-dot" />
                <span className="login-dot" />
              </span>
              Signing in…
            </>
          ) : (
            "Sign In →"
          )}
        </button>

        {/* SSO divider */}
        <div className="login-divider">
          <div className="login-divider-line" />
          <span className="login-divider-text">or continue with</span>
          <div className="login-divider-line" />
        </div>

        {/* Microsoft SSO */}
        <button
          className="login-sso"
          onClick={() => alert("Redirect to Microsoft SSO")}
        >
          <MicrosoftLogo />
          Sign in with Microsoft
        </button>

      </div>
    </div>
  );
}

function MicrosoftLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 21 21" fill="none">
      <rect x="1"  y="1"  width="9" height="9" fill="#f25022" />
      <rect x="11" y="1"  width="9" height="9" fill="#7fba00" />
      <rect x="1"  y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}