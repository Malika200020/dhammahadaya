import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../api/admin';
import { useAdminSession } from '../../hooks/useAdminSession';
import './AdminChangePasswordPage.css';

// Forced first-login change for normal admins (also reached again after a
// super admin resets their password — see AdminAdminUsersPage.jsx). Reached
// via RequireAdminAuth's redirect whenever session.mustChangePassword is
// true; refresh() afterwards clears that flag in shared session state so
// the guard lets normal navigation through immediately.
export function AdminChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { refresh } = useAdminSession();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await changePassword(newPassword);
      // Must resolve before navigating — RequireAdminAuth reads
      // session.mustChangePassword on every render, and navigating while
      // this is still in flight would have it see the stale (still-true)
      // cached value and bounce straight back to this same page.
      await refresh();
      navigate('/admin/entries/newsletter');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-change-password">
      <h1>Set a new password</h1>
      <p className="admin-change-password__hint">
        You need to set a new password before continuing. Choose something only you know.
      </p>
      <form onSubmit={handleSubmit}>
        <label>
          New password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
            autoFocus
          />
        </label>
        <label>
          Confirm new password
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} required />
        </label>
        {error ? <p className="admin-change-password__error">{error}</p> : null}
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save and continue'}
        </button>
      </form>
    </div>
  );
}
