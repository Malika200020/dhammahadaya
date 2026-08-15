import './DevelopmentPage.css';

// build-spec §17.1 — fully static bank details, no admin editing.
export function DevelopmentPage() {
  return (
    <div className="development">
      <h1>Development</h1>
      <table className="development__table">
        <tbody>
          <tr>
            <th>Account Name</th>
            <td>Dhammahadaya Senasanaya (For Development)</td>
          </tr>
          <tr>
            <th>Account Number</th>
            <td>109761005375</td>
          </tr>
          <tr>
            <th>Bank</th>
            <td>Sampath Bank</td>
          </tr>
          <tr>
            <th>Branch</th>
            <td>Balangoda</td>
          </tr>
          <tr>
            <th>SWIFT Code</th>
            <td>BSAMLKLX</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
