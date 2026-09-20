import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAllPrices } from "../lib/api.js";
import { useLang } from "../lib/i18n.jsx";
import { TrendIcon } from "../components/bits.jsx";

export default function Market() {
  const { t, cropName, cropLocal, categoryName, unitName } = useLang();
  const [params] = useSearchParams();
  const [allPrices, setAllPrices] = useState([]);
  const [q, setQ] = useState(params.get("q") || "");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("name");

  useEffect(() => {
    getAllPrices().then(setAllPrices);
  }, []);

  useEffect(() => {
    setQ(params.get("q") || "");
  }, [params]);

  const categories = useMemo(
    () => [...new Set(allPrices.map((p) => p.crop.category))],
    [allPrices]
  );

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = allPrices.filter(
      ({ crop }) =>
        (!needle ||
          crop.name.toLowerCase().includes(needle) ||
          crop.local.toLowerCase().includes(needle) ||
          cropName(crop).toLowerCase().includes(needle) ||
          cropLocal(crop).toLowerCase().includes(needle)) &&
        (!category || crop.category === category)
    );
    const sorted = [...filtered];
    if (sort === "name") sorted.sort((a, b) => cropName(a.crop).localeCompare(cropName(b.crop)));
    if (sort === "price_low") sorted.sort((a, b) => a.price.modal - b.price.modal);
    if (sort === "price_high") sorted.sort((a, b) => b.price.modal - a.price.modal);
    if (sort === "trend")
      sorted.sort((a, b) => Math.abs(b.price.trendPct) - Math.abs(a.price.trendPct));
    return sorted;
  }, [allPrices, q, category, sort, cropName, cropLocal]);

  return (
    <main id="main" className="section-tight">
      <div className="container">
        <h1>{t("mkt.title")}</h1>
        <p className="muted">{t("mkt.sub")}</p>

        <div className="filters">
          <div className="field">
            <label htmlFor="mSearch">{t("mkt.search")}</label>
            <input
              id="mSearch"
              type="text"
              placeholder={t("mkt.searchPh")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="mCategory">{t("mkt.cat")}</label>
            <select id="mCategory" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">{t("mkt.allCat")}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {categoryName(c)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="mSort">{t("mkt.sort")}</label>
            <select id="mSort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="name">{t("mkt.name")}</option>
              <option value="price_low">{t("mkt.lowHigh")}</option>
              <option value="price_high">{t("mkt.highLow")}</option>
              <option value="trend">{t("mkt.trend")}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-3" id="cropGrid">
          {list.map(({ crop, price }) => (
            <Link key={crop.id} className="crop-card" to={`/crop?crop=${crop.id}`}>
              <div className="name">{cropName(crop)}</div>
              <div className="local">
                {cropLocal(crop)} · {categoryName(crop.category)}
              </div>
              <div className="price-line">
                <span className="price">₹{price.modal}</span>
                <span className="unit">/{unitName(price.unit)}</span>
              </div>
              <span className={`trend ${price.trendDir}`}>
                <TrendIcon dir={price.trendDir} /> {price.trendPct}%
              </span>
              <div className="updated">
                {t("mkt.updated", {
                  ago:
                    price.updatedMinsAgo < 60
                      ? t("time.mAgo", { n: price.updatedMinsAgo })
                      : t("time.hAgo", { n: Math.round(price.updatedMinsAgo / 60) }),
                })}
              </div>
            </Link>
          ))}
        </div>
        <div className="empty" id="emptyState" style={{ display: list.length ? "none" : "block" }}>
          <div className="icon">
            <i className="bi bi-search" aria-hidden="true"></i>
          </div>
          <p>{t("mkt.empty")}</p>
        </div>
      </div>
    </main>
  );
}
