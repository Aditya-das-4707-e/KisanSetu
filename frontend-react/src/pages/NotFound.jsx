import { Link } from "react-router-dom";
import { useLang } from "../lib/i18n.jsx";

export default function NotFound() {
  const { t } = useLang();
  return (
    <main id="main" className="section">
      <div className="container">
        <div className="empty">
          <div className="icon">
            <i className="bi bi-compass" aria-hidden="true"></i>
          </div>
          <h2>{t("nf.title")}</h2>
          <p className="muted">{t("nf.sub")}</p>
          <Link to="/" className="btn btn-primary mt-3">
            {t("nf.back")}
          </Link>
        </div>
      </div>
    </main>
  );
}
