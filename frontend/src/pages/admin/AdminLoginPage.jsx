import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, verifyOtp } from '../../api/admin';
import './AdminLoginPage.css';

// Two-step login (build-spec §19 email-OTP two-factor): password first,
// then — unless TWO_FACTOR_ENABLED=false on the backend — a 6-digit code
// emailed to the account. The backend tells us which case we're in via
// the login response shape (`otpRequired`), so this component doesn't
// need to know the toggle state itself.
export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await login(email, password);
      if (result?.otpRequired) {
        setOtpRequired(true);
      } else {
        navigate('/admin/entries/newsletter');
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
      await verifyOtp(code);
      navigate('/admin/entries/newsletter');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (otpRequired) {
    return (
      <div className="admin-login">
        <form className="admin-login__form" onSubmit={handleOtpSubmit}>
          <h1>Enter your login code</h1>
          <p className="admin-login__hint">We sent a 6-digit code to {email}.</p>
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
      <form className="admin-login__form" onSubmit={handlePasswordSubmit}>
        <h1>Admin Login</h1>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
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
