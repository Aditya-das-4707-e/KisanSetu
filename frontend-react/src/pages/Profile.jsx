import { useState } from "react";
import { useLang } from "../lib/i18n.jsx";

function VerificationText() {
  const { t } = useLang();
  const [before, after] = String(t("pf.verD")).split("{badge}");
  return (
    <p className="muted text-sm">
      {before}
      <span className="badge-verified">
        <i className="bi bi-patch-check-fill" aria-hidden="true"></i> {t("c.verified")}
      </span>
      {after}
    </p>
  );
}

export default function Profile() {
  const { t } = useLang();
  const [name, setName] = useState("Ashok Mandal");
  const [email, setEmail] = useState("ashok.mandal@example.com");
  const [phone, setPhone] = useState("9800000000");
  const [address, setAddress] = useState("Village Rajapur, Sonarpur");

  function submit(e) {
    e.preventDefault();
    alert(t("pf.saved"));
  }

  return (
    <main id="main" className="section-tight">
      <div className="container">
        <h1>{t("pf.title")}</h1>

        <div className="grid grid-2" style={{ alignItems: "start" }}>
          <div className="card">
            <h3>{t("pf.acct")}</h3>
            <form id="profileForm" onSubmit={submit}>
              <div className="field">
                <label htmlFor="pName">{t("pf.name")}</label>
                <input id="pName" type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="row-2">
                <div className="field">
                  <label htmlFor="pEmail">{t("pf.email")}</label>
                  <input
                    id="pEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="pPhone">{t("pf.phone")}</label>
                  <input
                    id="pPhone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label>{t("pf.role")}</label>
                <input type="text" value={t("pf.farmer")} disabled />
                <p className="help">{t("pf.roleHelp")}</p>
              </div>
              <div className="field">
                <label htmlFor="pAddress">
                  {t("pf.addr")}{" "}
                  <span className="muted" style={{ fontWeight: 400 }}>
                    {t("pf.priv")}
                  </span>
                </label>
                <input
                  id="pAddress"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                {t("pf.save")}
              </button>
            </form>
          </div>

          <div>
            <div className="card">
              <h3>{t("pf.privT")}</h3>
              <p className="muted text-sm mb-0">{t("pf.privD")}</p>
            </div>
            <div className="card mt-5">
              <h3>{t("pf.verT")}</h3>
              <VerificationText />
              <button className="btn btn-outline btn-block" onClick={() => alert(t("pf.verSoon"))}>
                {t("pf.reqVer")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
