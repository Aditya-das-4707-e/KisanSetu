import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getCropById,
  getCropPrice,
  getNearbyFarmers,
  getNearbyBuyers,
  getPriceHistory,
  createAlert,
} from "../lib/api.js";
import { useLang } from "../lib/i18n.jsx";
import { Modal } from "../components/chrome.jsx";
import { TrendIcon, VerifiedBadge } from "../components/bits.jsx";
import PriceChart from "../components/PriceChart.jsx";

const RANGES = [7, 30, 90, 180, 365];
const RANGE_LABELS = { 7: "7d", 30: "30d", 90: "3m", 180: "6m", 365: "1y" };

function unitToKg(qty, unit) {
  if (unit === "quintal") return qty * 100;
  if (unit === "tonne") return qty * 1000;
  return qty;
}

export default function CropDetail() {
  const { t, cropName, cropLocal, categoryName, unitName } = useLang();
  const [params] = useSearchParams();
  const cropId = params.get("crop") || "tomato";

  const [crop, setCrop] = useState(null);
  const [price, setPrice] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [qty, setQty] = useState(500);
  const [unit, setUnit] = useState("kg");

  const [days, setDays] = useState(90);
  const [history, setHistory] = useState([]);

  const [farmers, setFarmers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [fFarmerDist, setFFarmerDist] = useState("");
  const [fFarmerVerified, setFFarmerVerified] = useState("");
  const [fBuyerDist, setFBuyerDist] = useState("");
  const [fBuyerVerified, setFBuyerVerified] = useState("");

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertCondition, setAlertCondition] = useState("above");
  const [alertThreshold, setAlertThreshold] = useState("");

  useEffect(() => {
    document.title = "Crop — KisanSetu";
    let cancelled = false;
    async function load() {
      const [c, p] = await Promise.all([getCropById(cropId), getCropPrice(cropId)]);
      if (cancelled) return;
      if (!c || !p) {
        setNotFound(true);
        return;
      }
      setNotFound(false);
      setCrop(c);
      setPrice(p);
      document.title = `${c.name} — KisanSetu`;
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [cropId]);

  useEffect(() => {
    getPriceHistory(cropId, days).then(setHistory);
  }, [cropId, days]);

  async function loadFarmers() {
    const data = await getNearbyFarmers(cropId, {
      maxDistance: Number(fFarmerDist) || null,
      verifiedOnly: fFarmerVerified === "1",
    });
    setFarmers(data);
  }

  async function loadBuyers() {
    const data = await getNearbyBuyers(cropId, {
      maxDistance: Number(fBuyerDist) || null,
      verifiedOnly: fBuyerVerified === "1",
    });
    setBuyers(data);
  }

  useEffect(() => {
    loadFarmers();
    loadBuyers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropId]);

  async function submitAlert(e) {
    e.preventDefault();
    const threshold = Number(alertThreshold);
    if (!threshold) {
      alert(t("crop.needThresh"));
      return;
    }
    await createAlert({
      crop: cropId,
      location: "Kolkata",
      condition: alertCondition,
      threshold,
      unit: alertCondition.includes("percent") ? "%" : price.unit,
    });
    setAlertOpen(false);
    setAlertThreshold("");
    alert(t("crop.created"));
  }

  if (notFound) {
    return (
      <main id="main" className="section-tight">
        <div className="container">
          <h1 id="cropName">{t("crop.notFound")}</h1>
        </div>
      </main>
    );
  }

  if (!crop || !price) {
    return (
      <main id="main" className="section-tight">
        <div className="container">
          <h1 id="cropName">{t("c.loading")}</h1>
          <p className="muted" id="cropLocal"></p>
        </div>
      </main>
    );
  }

  const qtyInKg = unitToKg(Number(qty) || 0, unit);
  const total = qtyInKg * price.modal;

  return (
    <main id="main" className="section-tight">
      <div className="container">
        <div className="flex-between" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 id="cropName" style={{ marginBottom: 2 }}>
              {cropName(crop)}
            </h1>
            <p className="muted" id="cropLocal" style={{ marginBottom: 0 }}>
              {cropLocal(crop)} · {categoryName(crop.category)}
            </p>
          </div>
          <button className="btn btn-accent" onClick={() => setAlertOpen(true)}>
            <i className="bi bi-bell me-1" aria-hidden="true"></i>
            {t("crop.mkAlert")}
          </button>
        </div>

        <div className="grid grid-2 mt-5" style={{ alignItems: "start" }}>
          <div className="card">
            <div className="flex-between">
              <div>
                <div className="muted text-sm">{t("crop.cur")}</div>
                <div
                  className="price"
                  id="currentPrice"
                  style={{ fontSize: "2.4rem", fontWeight: 600, color: "var(--green-900)" }}
                >
                  ₹{price.modal}
                  <span
                    style={{
                      fontSize: "1rem",
                      color: "var(--ink-muted)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {" "}
                    /{unitName(price.unit)}
                  </span>
                </div>
              </div>
              <span className={`trend ${price.trendDir}`} id="trendBadge">
                <TrendIcon dir={price.trendDir} /> {price.trendPct}%
              </span>
            </div>
            <p className="muted text-sm mt-2 mb-0" id="lastUpdated">
              {t("crop.lastUpd", {
                ago:
                  price.updatedMinsAgo < 60
                    ? t("time.minAgo", { n: price.updatedMinsAgo })
                    : t("time.hoursAgo", { n: Math.round(price.updatedMinsAgo / 60) }),
              })}
            </p>

            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "20px 0" }} />

            <h3 style={{ fontSize: "1.05rem" }}>{t("crop.calc")}</h3>
            <div className="row-2">
              <div className="field">
                <label htmlFor="qtyInput">{t("crop.qty")}</label>
                <input
                  id="qtyInput"
                  type="number"
                  value={qty}
                  min="0"
                  onChange={(e) => setQty(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="unitInput">{t("crop.unit")}</label>
                <select id="unitInput" value={unit} onChange={(e) => setUnit(e.target.value)}>
                  <option value="kg">{unitName("kg")}</option>
                  <option value="quintal">{t("crop.qtlOpt")}</option>
                  <option value="tonne">{t("crop.tonneOpt")}</option>
                </select>
              </div>
            </div>
            <div className="card-tight" style={{ background: "var(--green-100)", border: "none" }}>
              <div className="muted text-sm">{t("crop.estVal")}</div>
              <div
                className="price"
                id="calcResult"
                style={{ fontSize: "1.6rem", fontWeight: 600, color: "var(--green-900)" }}
              >
                ₹{total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </div>
              <div className="muted text-sm" id="calcBreakdown">
                {Number(qty) || 0} {unitName(unit)} × ₹{price.modal}/{unitName("kg")}
              </div>
            </div>

            <div className="grid grid-3 mt-4">
              <div className="stat">
                <div className="label">{t("crop.min")}</div>
                <div className="value" id="statMin">
                  ₹{price.min}
                </div>
              </div>
              <div className="stat">
                <div className="label">{t("crop.avg")}</div>
                <div className="value" id="statAvg">
                  ₹{price.modal}
                </div>
              </div>
              <div className="stat">
                <div className="label">{t("crop.max")}</div>
                <div className="value" id="statMax">
                  ₹{price.max}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: "1.05rem" }}>{t("crop.range")}</h3>
            <div
              className="price"
              id="priceRange"
              style={{ fontSize: "2rem", fontWeight: 600, color: "var(--green-900)" }}
            >
              ₹{price.min}–₹{price.max}/{unitName(price.unit)}
            </div>
            <p className="muted text-sm">{t("crop.rangeNote")}</p>
            <div className="grid grid-2 mt-3">
              <div className="stat">
                <div className="label">{t("crop.sell")}</div>
                <div className="value" id="sellEstimate" style={{ fontSize: "1.2rem" }}>
                  ₹{(price.modal - 2).toFixed(0)}–₹{(price.modal + 2).toFixed(0)}
                </div>
              </div>
              <div className="stat">
                <div className="label">{t("crop.buy")}</div>
                <div className="value" id="buyEstimate" style={{ fontSize: "1.2rem" }}>
                  ₹{(price.min).toFixed(0)}–₹{(price.modal).toFixed(0)}
                </div>
              </div>
            </div>
            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "20px 0" }} />
            <div className="muted text-sm">
              <div id="marketName">{t("crop.mkt", { v: price.market })}</div>
              <div id="marketLoc">
                {t("crop.loc", { v: `${price.district}, ${price.state}` })}
              </div>
              <div id="marketSource">{t("crop.src", { v: price.source })}</div>
            </div>
          </div>
        </div>

        <div className="card mt-5">
          <div className="card-head">
            <h3>{t("crop.hist")}</h3>
            <div className="flex gap-2" id="rangeButtons">
              {RANGES.map((d) => (
                <button
                  key={d}
                  className={`btn btn-sm ${days === d ? "btn-primary" : "btn-outline"}`}
                  data-days={d}
                  onClick={() => setDays(d)}
                >
                  {RANGE_LABELS[d]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 280 }}>
            <PriceChart points={history} unit={unitName(price.unit)} />
          </div>
        </div>

        <div className="grid grid-2 mt-5" style={{ alignItems: "start" }}>
          <div className="card">
            <h3>{t("crop.sellers")}</h3>
            <div className="filters">
              <div className="field">
                <label htmlFor="fFarmerDist">{t("crop.maxDist")}</label>
                <input
                  id="fFarmerDist"
                  type="number"
                  placeholder={t("c.any")}
                  value={fFarmerDist}
                  onChange={(e) => setFFarmerDist(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="fFarmerVerified">{t("crop.verOnly")}</label>
                <select
                  id="fFarmerVerified"
                  value={fFarmerVerified}
                  onChange={(e) => setFFarmerVerified(e.target.value)}
                >
                  <option value="">{t("c.no")}</option>
                  <option value="1">{t("c.yes")}</option>
                </select>
              </div>
              <button className="btn btn-outline btn-sm" onClick={loadFarmers}>
                {t("c.apply")}
              </button>
            </div>
            <div className="table-wrap">
              <table className="data" id="farmersTable">
                <thead>
                  <tr>
                    <th>{t("crop.thFarmer")}</th>
                    <th>{t("crop.thDist")}</th>
                    <th>{t("crop.thQty")}</th>
                    <th>{t("crop.thPrice")}</th>
                  </tr>
                </thead>
                <tbody>
                  {farmers.length ? (
                    farmers.map((f, i) => (
                      <tr key={i}>
                        <td>
                          {f.name} {f.verified ? <VerifiedBadge /> : ""}
                        </td>
                        <td>{f.distanceKm} km</td>
                        <td>
                          {f.quantity} {unitName(f.unit)}
                        </td>
                        <td className="num">
                          ₹{f.price}/{unitName(f.unit)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="muted">
                        {t("crop.noSellers")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3>{t("crop.buyers")}</h3>
            <div className="filters">
              <div className="field">
                <label htmlFor="fBuyerDist">{t("crop.maxDist")}</label>
                <input
                  id="fBuyerDist"
                  type="number"
                  placeholder={t("c.any")}
                  value={fBuyerDist}
                  onChange={(e) => setFBuyerDist(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="fBuyerVerified">{t("crop.verOnly")}</label>
                <select
                  id="fBuyerVerified"
                  value={fBuyerVerified}
                  onChange={(e) => setFBuyerVerified(e.target.value)}
                >
                  <option value="">{t("c.no")}</option>
                  <option value="1">{t("c.yes")}</option>
                </select>
              </div>
              <button className="btn btn-outline btn-sm" onClick={loadBuyers}>
                {t("c.apply")}
              </button>
            </div>
            <div className="table-wrap">
              <table className="data" id="buyersTable">
                <thead>
                  <tr>
                    <th>{t("crop.thBuyer")}</th>
                    <th>{t("crop.thDist")}</th>
                    <th>{t("crop.thReqQty")}</th>
                    <th>{t("crop.thPrice")}</th>
                  </tr>
                </thead>
                <tbody>
                  {buyers.length ? (
                    buyers.map((b, i) => (
                      <tr key={i}>
                        <td>
                          {b.name} {b.verified ? <VerifiedBadge /> : ""}
                        </td>
                        <td>{b.distanceKm} km</td>
                        <td>
                          {b.requiredQuantity} {unitName(b.unit)}
                        </td>
                        <td className="num">
                          ₹{b.price}/{unitName(b.unit)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="muted">
                        {t("crop.noBuyers")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal
        id="alertModal"
        open={alertOpen}
        title={t("crop.mkAlertTitle")}
        onClose={() => setAlertOpen(false)}
      >
        <form id="alertForm" onSubmit={submitAlert}>
          <p className="muted text-sm" id="alertCropLabel">
            {t("crop.cropLbl", { v: cropName(crop) })}
          </p>
          <div className="field">
            <label htmlFor="alertCondition">{t("crop.notify")}</label>
            <select
              id="alertCondition"
              value={alertCondition}
              onChange={(e) => setAlertCondition(e.target.value)}
            >
              <option value="above">{t("crop.above")}</option>
              <option value="below">{t("crop.below")}</option>
              <option value="percent_up">{t("crop.pUp")}</option>
              <option value="percent_down">{t("crop.pDown")}</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="alertThreshold">{t("crop.thresh")}</label>
            <input
              id="alertThreshold"
              type="number"
              placeholder={t("crop.threshPh")}
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            {t("crop.createAlert")}
          </button>
        </form>
      </Modal>
    </main>
  );
}
