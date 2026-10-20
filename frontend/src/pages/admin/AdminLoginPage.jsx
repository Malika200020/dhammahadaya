import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, verifyOtp } from '../../api/admin';
import './AdminLoginPage.css';

// Login (2026-10: dual-role). One "Email or Username" field — super admins
// sign in with their email, normal admins with the username a super admin
// gave them; the backend figures out which based on what matches. Three
// possible outcomes after the password step: a super admin gets the
// existing email-OTP two-factor step (build-spec §19, unless
// TWO_FACTOR_ENABLED=false on the backend); a normal admin on their
// required first login goes straight to the forced password-change page;
// anyone else goes straight into the admin area.
//
// Deliberately NOT reading useAdminSession here — this page sits outside
// AdminSessionProvider on purpose (see App.jsx's comment on the route
// tree): navigating from here into the protected routes mounts that
// provider fresh, in a "loading" state, which is what makes
// RequireAdminAuth wait for its own /me fetch instead of racing an
// explicit refresh() call here and bouncing back to login on a stale
// pre-login session value.
export function AdminLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function routeAfterLogin(result) {
    if (result?.mustChangePassword) {
      navigate('/admin/change-password');
    } else {
      navigate('/admin/entries/newsletter');
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await login(identifier, password);
      if (result?.otpRequired) {
        setOtpRequired(true);
      } else {
        routeAfterLogin(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await verifyOtp(code);
      routeAfterLogin(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (otpRequired) {
    return (
      <div className="admin-login">
        <div className="admin-login__glow" aria-hidden="true" />
        <img src="/images/Damma-Senasanaya-Logo.png" alt="Dhammahadaya Senasanaya" className="admin-login__logo" />
        <form className="admin-login__form" onSubmit={handleOtpSubmit}>
          <h1>Enter your login code</h1>
          <p className="admin-login__hint">We sent a 6-digit code to your email.</p>
          <label>
            Code
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoFocus
              inputMode="numeric"
              maxLength={6}
            />
          </label>
          {error ? <p className="admin-login__error">{error}</p> : null}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-login">
      <div className="admin-login__glow" aria-hidden="true" />
      <img src="/images/Damma-Senasanaya-Logo.png" alt="Dhammahadaya Senasanaya" className="admin-login__logo" />
      <form className="admin-login__form" onSubmit={handlePasswordSubmit}>
        <h1>Admin Login</h1>
        <label>
          Email or Username
          <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required autoFocus />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error ? <p className="admin-login__error">{error}</p> : null}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
