import { useEffect, useState } from 'react';
import { getWhatsappStatus } from '../../api/admin';
import './AdminWhatsappPage.css';

const STATUS_LABELS = {
  disabled: 'Disabled',
  initializing: 'Starting…',
  qr: 'Not linked — scan the QR code below',
  linked: 'Linked',
  'auth-failure': 'Authentication failed',
  disconnected: 'Disconnected — needs re-scan',
};

export function AdminWhatsappPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    function poll() {
      getWhatsappStatus()
        .then((d) => {
          if (!cancelled) setData(d);
        })
        .catch((err) => {
          if (!cancelled) setError(err);
        });
    }
    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="admin-whatsapp">
      <h1>WhatsApp</h1>
      {error ? <p className="admin-whatsapp__error">{error.message}</p> : null}

      {!data ? null : (
        <>
          <p className={`admin-whatsapp__status admin-whatsapp__status--${data.status}`}>
            {STATUS_LABELS[data.status] || data.status}
          </p>

          {!data.enabled ? (
            <p className="admin-whatsapp__hint">
              Set WHATSAPP_ENABLED=true on the backend to turn this on. Booking confirmations will keep sending by
              email either way.
            </p>
          ) : null}

          {data.status === 'qr' && data.qr ? (
            <div className="admin-whatsapp__qr">
              <img src={data.qr} alt="WhatsApp linking QR code" />
              <p>Open WhatsApp on the monastery's phone → Linked Devices → Link a Device, then scan this code.</p>
            </div>
          ) : null}

          {data.status === 'linked' ? (
            <p className="admin-whatsapp__hint">
              A number is linked. New sponsorship-booking confirmations will also be sent over WhatsApp, alongside
              the existing email.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
