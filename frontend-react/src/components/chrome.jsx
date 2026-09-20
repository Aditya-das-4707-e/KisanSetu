import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { searchCrops, getSavedLocation, saveLocation, detectLocation } from "../lib/api.js";
import { useLang, LANGS } from "../lib/i18n.jsx";
import { Logo } from "./bits.jsx";
import LocationSelects from "./LocationSelects.jsx";

export function LanguageSelect() {
  const { lang, setLang, t } = useLang();
  return (
    <label
      className="nav-loc"
      title={t("nav.lang")}
      style={{ gap: 6 }}
    >
      <i className="bi bi-translate" aria-hidden="true"></i>
      <span className="sr-only">{t("nav.lang")}</span>
      <select
        aria-label={t("nav.lang")}
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        style={{
          border: "none",
          background: "transparent",
          font: "inherit",
          color: "inherit",
          cursor: "pointer",
          padding: 0,
          width: "auto",
        }}
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Navbar({ location, onOpenLocation }) {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [matches, setMatches] = useState([]);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const routeLoc = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setOpen(false);
  }, [routeLoc.pathname, routeLoc.search]);

  async function handleInput(v) {
    setQ(v);
    if (!v) {
      setMatches([]);
      setOpen(false);
      return;
    }
    const m = await searchCrops(v);
    setMatches(m.slice(0, 6));
    setOpen(m.length > 0);
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link className="brand" to="/">
            <Logo /> KisanSetu
          </Link>
          <div className="nav-search">
            <input
              id="navSearchInput"
              type="search"
              placeholder={t("nav.searchPh")}
              autoComplete="off"
              aria-label={t("nav.searchPh")}
              value={q}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && q.trim()) {
                  navigate(`/market?q=${encodeURIComponent(q.trim())}`);
                  setOpen(false);
                }
              }}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
            />
            {open && (
              <NavSearchResults matches={matches} />
            )}
          </div>
          <div className="nav-links">
            <Link to="/market">{t("nav.market")}</Link>
            <Link to="/farmers">{t("nav.farmers")}</Link>
            <Link to="/alerts">{t("nav.alerts")}</Link>
          </div>
          <LanguageSelect />
          <button className="nav-loc" id="navLocBtn" title={t("loc.title")} onClick={onOpenLocation}>
            <i className="bi bi-geo-alt" aria-hidden="true"></i> {location.locality},{" "}
            {location.district}
          </button>
          <Link to="/dashboard-farmer" className="btn btn-outline btn-sm" id="navAuthBtn">
            {t("nav.dashboard")}
          </Link>
          <button
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobileNavMenu"
            aria-label={menuOpen ? t("nav.close") : t("nav.menu")}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <i className={menuOpen ? "bi bi-x" : "bi bi-list"} aria-hidden="true"></i>
          </button>
        </div>
        {menuOpen && (
          <div className="nav-menu" id="mobileNavMenu">
            <Link className="nav-menu-link" to="/market">
              {t("nav.market")}
            </Link>
            <Link className="nav-menu-link" to="/farmers">
              {t("nav.farmers")}
            </Link>
            <Link className="nav-menu-link" to="/alerts">
              {t("nav.alerts")}
            </Link>
            <div className="nav-menu-row">
              <LanguageSelect />
              <button
                className="nav-loc"
                title={t("loc.title")}
                onClick={() => {
                  setMenuOpen(false);
                  onOpenLocation();
                }}
              >
                <i className="bi bi-geo-alt" aria-hidden="true"></i> {location.locality},{" "}
                {location.district}
              </button>
              <Link to="/dashboard-farmer" className="btn btn-outline btn-sm">
                {t("nav.dashboard")}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

function NavSearchResults({ matches }) {
  const { cropName, cropLocal } = useLang();
  return (
    <div
      id="navSearchResults"
      className="table-wrap"
      style={{ position: "absolute", zIndex: 50, width: "100%", marginTop: 4 }}
    >
      {matches.map((c) => (
        <Link
          key={c.id}
          to={`/crop?crop=${c.id}`}
          style={{
            display: "block",
            padding: "10px 12px",
            textDecoration: "none",
            color: "var(--ink)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {cropName(c)} <span className="muted text-sm">({cropLocal(c)})</span>
        </Link>
      ))}
    </div>
  );
}

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <Link className="brand" to="/" style={{ marginBottom: 8 }}>
            <Logo /> KisanSetu
          </Link>
          <p className="muted text-sm" style={{ maxWidth: 260 }}>
            {t("foot.tag")}
          </p>
        </div>
        <div>
          <h4>{t("foot.explore")}</h4>
          <Link to="/market">{t("nav.market")}</Link>
          <Link to="/farmers">{t("nav.farmers")}</Link>
          <Link to="/alerts">{t("foot.priceAlerts")}</Link>
          <Link to="/dashboard-farmer">{t("nav.dashboard")}</Link>
        </div>
        <div>
          <h4>{t("foot.account")}</h4>
          <Link to="/profile">{t("foot.profile")}</Link>
        </div>
        <div>
          <h4>{t("foot.about")}</h4>
          <a href="#">{t("foot.aboutKs")}</a>
          <a href="#">{t("foot.contact")}</a>
          <a href="#">{t("foot.privacy")}</a>
          <a href="#">{t("foot.langName")}</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{t("foot.copy")}</span>
        <span>{t("foot.built")}</span>
      </div>
    </footer>
  );
}

export function LocationModal({ open, onClose, onSaved }) {
  const { t } = useLang();
  const [sel, setSel] = useState(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoError, setGeoError] = useState("");

  useEffect(() => {
    if (open) {
      setGeoBusy(false);
      setGeoError("");
    }
  }, [open ]);

  if (!open) return null;

  async function handleSave() {
    const fallback = getSavedLocation();
    const state = sel?.state || fallback.state;
    const district = sel?.district || fallback.district;
    const locality =
      sel && !sel.isOther ? sel.locality : sel?.otherText?.trim() || district;
    const loc = { state, district, locality };
    saveLocation(loc);
    onSaved(loc);
    onClose();
  }

  async function handleGeo() {
    setGeoBusy(true);
    setGeoError("");
    try {
      const loc = await detectLocation();
      saveLocation(loc);
      onSaved(loc);
      onClose();
    } catch (err) {
      if (err && err.code === "LOOKUP" && err.coords) {
        // GPS worked but place-name lookup failed: still save the real position.
        const { latitude, longitude } = err.coords;
        const loc = {
          locality: t("loc.me"),
          district: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
          state: "",
        };
        saveLocation(loc);
        onSaved(loc);
        onClose();
        return;
      }
      if (err && err.code === "DENIED") setGeoError(t("loc.deniedHelp"));
      else if (err && err.code === "NO_API") setGeoError(t("loc.noApi"));
      else if (err && err.code === "UNAVAILABLE") setGeoError(t("loc.unavailable"));
      else if (err && err.code === "LOOKUP") setGeoError(t("loc.lookupFail"));
      else setGeoError(t("loc.failed"));
    } finally {
      setGeoBusy(false);
    }
  }

  return (
    <div
      className="modal-backdrop open"
      id="locationModalBackdrop"
      onClick={(e) => {
        if (e.target.classList.contains("modal-backdrop")) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <h3 style={{ margin: 0 }}>{t("loc.title")}</h3>
          <button className="modal-close" aria-label="Close" onClick={onClose}>
            &times;
          </button>
        </div>
        <p className="muted text-sm">{t("loc.desc")}</p>
        <LocationSelects idPrefix="loc" onChange={setSel} />
        <button className="btn btn-primary btn-block" id="locSaveBtn" onClick={handleSave}>
          {t("loc.save")}
        </button>
        {geoError && (
          <p className="help mt-2" style={{ color: "var(--rust-600)" }}>
            {geoError}
          </p>
        )}
        <button
          className="btn btn-outline btn-block mt-2"
          id="locGeoBtn"
          onClick={handleGeo}
          disabled={geoBusy}
        >
          <i className="bi bi-geo-alt" aria-hidden="true"></i>{" "}
          {geoBusy ? t("loc.detecting") : t("loc.geo")}
        </button>
      </div>
    </div>
  );
}

export function Modal({ id, open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div
      className="modal-backdrop open"
      id={id}
      onClick={(e) => {
        if (e.target.classList.contains("modal-backdrop")) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
