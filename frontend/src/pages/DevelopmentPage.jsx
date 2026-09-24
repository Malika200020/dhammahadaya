import { useTranslation } from '../i18n/LanguageContext';
import './DevelopmentPage.css';

// build-spec §17.1 — fully static bank details, no admin editing. Exported
// on its own (not just used by <DevelopmentPage>) because SponsorshipPage's
// "Development Projects" tab reuses this exact table (client request,
// 2026-09: Development's bank details moved under Sponsorships, and
// "Development" was removed from the menu bar — see navItems.js).
export function DevelopmentBankDetails() {
  const { t } = useTranslation();
  return (
    <table className="development__table">
      <tbody>
        <tr>
          <th>{t('development.accountName')}</th>
          <td>Dhammahadaya Senasanaya (For Development)</td>
        </tr>
        <tr>
          <th>{t('development.accountNumber')}</th>
          <td>109761005375</td>
        </tr>
        <tr>
          <th>{t('development.bank')}</th>
          <td>Sampath Bank</td>
        </tr>
        <tr>
          <th>{t('development.branch')}</th>
          <td>Balangoda</td>
        </tr>
        <tr>
          <th>{t('development.swiftCode')}</th>
          <td>BSAMLKLX</td>
        </tr>
        <tr>
          <th>{t('development.emailAddress')}</th>
          <td>
            <a href="mailto:dhammahadayasenasanaya@gmail.com">dhammahadayasenasanaya@gmail.com</a>
          </td>
        </tr>
        <tr>
          <th>{t('development.officePhoneNumber')}</th>
          <td>+94 45 313 4808 / +94 70 216 4642</td>
        </tr>
        <tr>
          <th>{t('development.whatsapp')}</th>
          <td>+94 70 216 4642</td>
        </tr>
        <tr>
          <th>{t('development.viber')}</th>
          <td>+94 70 216 4642</td>
        </tr>
        <tr>
          <th>{t('development.telegram')}</th>
          <td>+94 70 216 4642</td>
        </tr>
      </tbody>
    </table>
  );
}

export function DevelopmentPage() {
  const { t } = useTranslation();
  return (
    <div className="development">
      <h1>{t('development.pageTitle')}</h1>
      <DevelopmentBankDetails />
    </div>
  );
}
