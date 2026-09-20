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
