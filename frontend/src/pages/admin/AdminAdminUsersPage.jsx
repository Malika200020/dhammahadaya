import { useCallback, useEffect, useState } from 'react';
import { listAdminUsers, createAdminUser, resetAdminUserPassword, deleteAdminUser } from '../../api/admin';
import { LoadingState } from '../../components/LoadingState';
import './AdminAdminUsersPage.css';

// Super-admin only (route + API both gated — see App.jsx's RequireSuperAdmin
// and app.js's requireSuperAdmin middleware). Scoped to normal admins only:
// super admins are seeded via scripts/create-admin-user.js, not managed
// here (see admin-admin-users.js's own comment for why).
export function AdminAdminUsersPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    listAdminUsers()
      .then((d) => setAdmins(d.admins))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      await createAdminUser(username.trim(), password);
      setUsername('');
      setPassword('');
      load();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleResetPassword(admin) {
    const newPassword = window.prompt(`New password for "${admin.username}" (at least 8 characters):`);
    if (!newPassword) return;
    try {
      await resetAdminUserPassword(admin.id, newPassword);
      window.alert(`Password reset. Let ${admin.username} know their new temporary password — they'll be asked to change it on next login.`);
      load();
    } catch (err) {
      window.alert(err.message);
    }
  }

  async function handleDelete(admin) {
    if (!window.confirm(`Delete admin account "${admin.username}"? This cannot be undone and signs them out immediately.`)) return;
    await deleteAdminUser(admin.id);
    load();
  }

  return (
    <div className="admin-admin-users">
      <h1>Admin Users</h1>
      <p className="admin-admin-users__hint">
        Normal admins get content-management access only — no bookings, submission data, or account management. They
        sign in with a username (no email, no two-factor) and must change their password on first login.
      </p>

      <form className="admin-admin-users__create" onSubmit={handleCreate}>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          Temporary password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        </label>
        {createError ? <p className="admin-admin-users__error">{createError}</p> : null}
        <button type="submit" className="btn btn--primary" disabled={creating}>
          {creating ? 'Creating...' : 'Create admin'}
        </button>
      </form>

      {error ? <p className="admin-admin-users__error">{error.message}</p> : null}

      {loading && admins.length === 0 ? (
        <LoadingState message="Loading…" />
      ) : (
        <table className="admin-admin-users__table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Status</th>
              <th>Created</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id}>
                <td>{a.username}</td>
                <td>{a.must_change_password ? 'Awaiting first login' : 'Active'}</td>
                <td>{new Date(a.created_at).toLocaleDateString()}</td>
                <td className="admin-admin-users__actions">
                  <button type="button" onClick={() => handleResetPassword(a)}>
                    Reset password
                  </button>
                  <button type="button" className="admin-admin-users__delete" onClick={() => handleDelete(a)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && admins.length === 0 ? (
              <tr>
                <td colSpan={4} className="admin-admin-users__empty">
                  No normal admin accounts yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      )}
    </div>
  );
}
