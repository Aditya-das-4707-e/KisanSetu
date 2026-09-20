import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCrops, getCropById, getCropPrice, getCurrentUser, getAlerts } from "../lib/api.js";
import { useLang } from "../lib/i18n.jsx";
import { Modal } from "../components/chrome.jsx";
import { TrendIcon } from "../components/bits.jsx";

export default function DashboardFarmer() {
  const { t, cropName, unitName } = useLang();
  const [user, setUser] = useState(null);
  const [crops, setCrops] = useState([]);
  const [myCrops, setMyCrops] = useState([
    { crop: "tomato", quantity: 500, unit: "kg", price: 25 },
    { crop: "potato", quantity: 800, unit: "kg", price: 22 },
    { crop: "onion", quantity: 300, unit: "kg", price: 30 },
  ]);
  const [localPrices, setLocalPrices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [acCrop, setAcCrop] = useState("");
  const [acQty, setAcQty] = useState("");
  const [acUnit, setAcUnit] = useState("kg");
  const [acPrice, setAcPrice] = useState("");

  useEffect(() => {
    getAllCrops().then((c) => {
      setCrops(c);
      setAcCrop((prev) => prev || c[0]?.id || "");
    });
    getCurrentUser("farmer").then(setUser);
    getAlerts().then((a) => setAlerts(a.slice(0, 3)));
  }, []);

  useEffect(() => {
    Promise.all(
      myCrops.map(async (mc) => {
        const crop = await getCropById(mc.crop);
        const price = await getCropPrice(mc.crop);
        return { crop, price };
      })
    ).then(setLocalPrices);
  }, [myCrops]);

  function submitAdd(e) {
    e.preventDefault();
    const quantity = Number(acQty) || 0;
    const price = Number(acPrice) || 0;
    if (!acCrop || !quantity || !price) {
      alert(t("df.fillAll"));
      return;
    }
    setMyCrops((prev) => [{ crop: acCrop, quantity, unit: acUnit, price }, ...prev]);
    setModalOpen(false);
    setAcQty("");
    setAcPrice("");
  }

  return (
    <>
      <div className="dash-head">
        <div className="container">
          <h1 id="dashWelcome">
            {user ? t("df.welcome", { name: user.name }) : t("df.welcome", { name: t("df.farmer") })}
          </h1>
          <p id="dashLoc">
            {user ? (
              <>
                <i className="bi bi-geo-alt" aria-hidden="true"></i> {user.locality}, {user.state}
              </>
            ) : (
              t("df.loadingDet")
            )}
          </p>
        </div>
      </div>

      <main id="main" className="section-tight">
        <div className="container dash-layout">
          <div>
            <div className="card">
              <div className="card-head">
                <h3>{t("df.yourCrops")}</h3>
                <button className="btn btn-accent btn-sm" onClick={() => setModalOpen(true)}>
                  {t("df.addCrop")}
                </button>
              </div>
              <div id="myCrops">
                {!myCrops.length ? (
                  <div className="empty">
                    <div className="icon">
                      <i className="bi bi-basket" aria-hidden="true"></i>
                    </div>
                    <p>{t("df.noCrops")}</p>
                  </div>
                ) : (
                  myCrops.map((mc, i) => (
                    <div className="crop-row" key={`${mc.crop}-${i}`}>
                      <div>
                        <strong style={{ textTransform: "capitalize" }}>{cropName(mc.crop)}</strong>
                        <div className="muted text-sm">
                          {mc.quantity} {unitName(mc.unit)} · ₹{mc.price}/{unitName(mc.unit)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => alert(t("df.editSoon"))}
                        >
                          {t("c.edit")}
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setMyCrops((prev) => prev.filter((_, j) => j !== i))}
                        >
                          {t("c.remove")}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card mt-5">
              <div className="card-head">
                <h3>{t("df.localPrices")}</h3>
              </div>
              <div className="grid grid-3" id="localPrices">
                {localPrices.map(({ crop, price }) =>
                  crop && price ? (
                    <Link key={crop.id} className="crop-card" to={`/crop?crop=${crop.id}`}>
                      <div className="name">{cropName(crop)}</div>
                      <div className="price-line">
                        <span className="price">₹{price.modal}</span>
                        <span className="unit">/{unitName(price.unit)}</span>
                      </div>
                      <span className={`trend ${price.trendDir}`}>
                        <TrendIcon dir={price.trendDir} /> {price.trendPct}%
                      </span>
                    </Link>
                  ) : null
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <div className="card-head">
                <h3>{t("df.priceAlerts")}</h3>
                <Link to="/alerts" className="text-sm">
                  {t("df.manage")}
                </Link>
              </div>
              <div id="alertsMini">
                {alerts.length ? (
                  alerts.map((a) => (
                    <div className="crop-row" key={a.id}>
                      <span style={{ textTransform: "capitalize" }}>{cropName(a.crop)}</span>
                      <span
                        className={`trend ${
                          a.condition.includes("above") || a.condition.includes("up")
                            ? "rise"
                            : "fall"
                        }`}
                      >
                        {a.condition.replace("_", " ")} {a.threshold}
                        {a.unit === "%" ? "%" : ""}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="muted text-sm mb-0">{t("df.noAlerts")}</p>
                )}
              </div>
            </div>

            <div className="card mt-5">
              <h3>{t("df.quick")}</h3>
              <div className="grid" style={{ gap: 10 }}>
                <Link to="/market" className="btn btn-outline btn-block">
                  {t("df.marketPrices")}
                </Link>
                <Link to="/crop?crop=tomato" className="btn btn-outline btn-block">
                  {t("df.priceHist")}
                </Link>
                <Link to="/alerts" className="btn btn-outline btn-block">
                  {t("df.manageAlerts")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Modal
        id="addCropModal"
        open={modalOpen}
        title={t("df.mTitle")}
        onClose={() => setModalOpen(false)}
      >
        <form id="addCropForm" onSubmit={submitAdd}>
          <div className="field">
            <label htmlFor="acCrop">{t("df.mCrop")}</label>
            <select id="acCrop" value={acCrop} onChange={(e) => setAcCrop(e.target.value)}>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {cropName(c)}
                </option>
              ))}
            </select>
          </div>
          <div className="row-2">
            <div className="field">
              <label htmlFor="acQty">{t("df.mQty")}</label>
              <input
                id="acQty"
                type="number"
                placeholder={t("df.mQtyPh")}
                value={acQty}
                onChange={(e) => setAcQty(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="acUnit">{t("df.mUnit")}</label>
              <select id="acUnit" value={acUnit} onChange={(e) => setAcUnit(e.target.value)}>
                <option value="kg">{unitName("kg")}</option>
                <option value="quintal">{unitName("quintal")}</option>
                <option value="tonne">{unitName("tonne")}</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="acPrice">{t("df.mPrice")}</label>
            <input
              id="acPrice"
              type="number"
              placeholder={t("df.mPricePh")}
              value={acPrice}
              onChange={(e) => setAcPrice(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            {t("df.mAdd")}
          </button>
        </form>
      </Modal>
    </>
  );
}
