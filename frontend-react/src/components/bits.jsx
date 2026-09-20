import { Link } from "react-router-dom";
import { useLang } from "../lib/i18n.jsx";

export function TrendIcon({ dir }) {
  if (dir === "rise") return <i className="bi bi-arrow-up-right" aria-hidden="true"></i>;
  if (dir === "fall") return <i className="bi bi-arrow-down-right" aria-hidden="true"></i>;
  return <i className="bi bi-dash" aria-hidden="true"></i>;
}

export function TrendBadge({ dir, pct }) {
  return (
    <span className={`trend ${dir}`}>
      <TrendIcon dir={dir} /> {pct}%
    </span>
  );
}

export function VerifiedBadge({ withLabel = false }) {
  const { t } = useLang();
  return (
    <span className="badge-verified">
      <i className="bi bi-patch-check-fill" aria-hidden="true"></i>
      {withLabel ? ` ${t("c.verified")}` : null}
    </span>
  );
}

export function CropCard({ crop, price, extra }) {
  const { cropName, cropLocal, categoryName, unitName } = useLang();
  return (
    <Link className="crop-card" to={`/crop?crop=${crop.id}`}>
      <div className="name">{cropName(crop)}</div>
      <div className="local">
        {cropLocal(crop)}
        {crop.category ? ` · ${categoryName(crop.category)}` : null}
      </div>
      <div className="price-line">
        <span className="price">₹{price.modal}</span>
        <span className="unit">/{unitName(price.unit)}</span>
      </div>
      <TrendBadge dir={price.trendDir} pct={price.trendPct} />
      {extra}
    </Link>
  );
}

/** KisanSetu sprout mark — forest green badge, paper + mustard seedling. */
export function Logo({ size = 30 }) {
  return (
    <span
      className="mark"
      aria-hidden="true"
      style={{ background: "none", padding: 0, width: size, height: size }}
    >
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#1F5C3F" />
        <path d="M9 25.5 H23" stroke="#D9A441" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M16 25 V13.5" stroke="#F6F4EC" strokeWidth="2.2" strokeLinecap="round" />
        <path
          d="M15.5 19.5 C12 19.5 9.2 17.2 8.2 12.8 C12.5 12.8 15 15.2 15.5 19.5 Z"
          fill="#F6F4EC"
        />
        <path
          d="M16.5 16.8 C20 16.8 22.8 14.5 23.8 10.2 C19.5 10.2 17 12.5 16.5 16.8 Z"
          fill="#D9A441"
        />
      </svg>
    </span>
  );
}
