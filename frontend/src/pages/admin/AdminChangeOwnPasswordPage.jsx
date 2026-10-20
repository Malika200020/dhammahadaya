import { useState } from 'react';
import { requestOwnPasswordChange, verifyOwnPasswordChange } from '../../api/admin';
import './AdminChangeOwnPasswordPage.css';

// Super-admin self-service password change — OTP-protected (client spec,
// 2026-10): current password first, which triggers a code emailed via the
// existing Brevo path, then the code completes the change. Two-step form,
// same shape as AdminLoginPage's password-then-OTP flow but a separate
// backend pair (/change-own-password/request and /verify) so a change in
// progress here can never collide with (or be confused with) an in-progress
// login elsewhere.
export function AdminChangeOwnPasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleRequest(e) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirm) {
      setError('New passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await requestOwnPasswordChange(currentPassword, newPassword);
      setOtpRequired(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await verifyOwnPasswordChange(code);
      setSuccess(true);
      setOtpRequired(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
      setCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (otpRequired) {
    return (
      <div className="admin-change-own-password">
        <h1>Change my password</h1>
        <form onSubmit={handleVerify}>
          <p className="admin-change-own-password__hint">We sent a 6-digit code to your email.</p>
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
          {error ? <p className="admin-change-own-password__error">{error}</p> : null}
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Verifying...' : 'Verify and change password'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-change-own-password">
      <h1>Change my password</h1>
      <form onSubmit={handleRequest}>
        <label>
          Current password
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoFocus
          />
        </label>
        <label>
          New password
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required />
        </label>
        <label>
          Confirm new password
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} required />
        </label>
        {error ? <p className="admin-change-own-password__error">{error}</p> : null}
        {success ? <p className="admin-change-own-password__success">Password changed.</p> : null}
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Sending code...' : 'Send verification code'}
        </button>
      </form>
    </div>
  );
}
