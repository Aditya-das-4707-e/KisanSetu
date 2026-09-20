import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateValues } from "../lib/validation.js";
import { useLang } from "../lib/i18n.jsx";

function Field({ id, label, error, children }) {
  return (
    <div className={`field${error ? " has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      <div className="field-error">{error || ""}</div>
    </div>
  );
}

export default function Login() {
  const { t, validators } = useLang();
  const navigate = useNavigate();
  const [values, setValues] = useState({ loginId: "", loginPassword: "" });
  const [errors, setErrors] = useState({});

  function set(id, v) {
    setValues((prev) => ({ ...prev, [id]: v }));
  }

  function submit(e) {
    e.preventDefault();
    const V = validators();
    const errs = validateValues(values, {
      loginId: [V.required],
      loginPassword: [V.required],
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    // Demo only — real submission will POST to /api/auth/login/
    navigate("/dashboard-farmer");
  }

  return (
    <main id="main" className="auth-wrap">
      <div className="container">
        <div className="auth-card card" style={{ margin: "0 auto" }}>
          <div className="icon" style={{ marginBottom: 12 }}>
            <i className="bi bi-person-circle" aria-hidden="true"></i>
          </div>
          <h2>{t("li.title")}</h2>
          <p className="muted text-sm">{t("li.sub")}</p>

          <form id="loginForm" noValidate onSubmit={submit}>
            <Field id="loginId" label={t("li.id")} error={errors.loginId}>
              <input
                id="loginId"
                type="text"
                placeholder={t("li.idPh")}
                value={values.loginId}
                onChange={(e) => set("loginId", e.target.value)}
              />
            </Field>
            <Field id="loginPassword" label={t("li.pw")} error={errors.loginPassword}>
              <input
                id="loginPassword"
                type="password"
                placeholder={t("li.pwPh")}
                value={values.loginPassword}
                onChange={(e) => set("loginPassword", e.target.value)}
              />
            </Field>
            <div className="flex-between mt-2" style={{ marginBottom: 16 }}>
              <label className="flex gap-2 text-sm" style={{ margin: 0, fontWeight: 400 }}>
                <input type="checkbox" style={{ width: "auto" }} /> {t("li.remember")}
              </label>
              <a href="#" className="text-sm">
                {t("li.forgot")}
              </a>
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              {t("li.submit")}
            </button>
          </form>

          <p className="text-sm mt-4" style={{ textAlign: "center" }}>
            {t("li.newTo")} <Link to="/register">{t("li.create")}</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
