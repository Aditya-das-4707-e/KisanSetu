import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllCrops,
  getCropPrice,
  getCurrentUser,
  getNearbyFarmers,
} from "../lib/api.js";
import { useLang } from "../lib/i18n.jsx";
import { Modal } from "../components/chrome.jsx";
import { VerifiedBadge } from "../components/bits.jsx";

export default function DashboardBuyer() {
  const { t, cropName, unitName } = useLang();
  const [user, setUser] = useState(null);
  const [crops, setCrops] = useState([]);
  const [reqs, setReqs] = useState([
    { crop: "tomato", quantity: 1000, unit: "kg", price: 23 },
    { crop: "potato", quantity: 500, unit: "kg", price: 20 },
  ]);
  const [farmers, setFarmers] = useState([]);
  const [snapshot, setSnapshot] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [arCrop, setArCrop] = useState("");
  const [arQty, setArQty] = useState("");
  const [arUnit, setArUnit] = useState("kg");
  const [arPrice, setArPrice] = useState("");

  useEffect(() => {
    getAllCrops().then((c) => {
      setCrops(c);
      setArCrop((prev) => prev || c[0]?.id || "");
    });
    getCurrentUser("buyer").then(setUser);
    getNearbyFarmers("tomato").then(setFarmers);
    getCropPrice("tomato").then(setSnapshot);
  }, []);

  function submitAdd(e) {
    e.preventDefault();
    const quantity = Number(arQty) || 0;
    const price = Number(arPrice) || 0;
    if (!arCrop || !quantity || !price) {
      alert(t("db.fillAll"));
      return;
    }
    setReqs((prev) => [{ crop: arCrop, quantity, unit: arUnit, price }, ...prev]);
    setModalOpen(false);
    setArQty("");
    setArPrice("");
  }

  return (
    <>
      <div className="dash-head">
        <div className="container">
          <h1 id="dashWelcome">
            {user ? t("db.welcome", { name: user.name }) : t("db.welcome", { name: t("db.buyer") })}
          </h1>
          <p id="dashLoc">
            {user ? (
              <>
                <i className="bi bi-geo-alt" aria-hidden="true"></i> {user.locality}, {user.state}
              </>
            ) : (
              t("db.loadingDet")
            )}
          </p>
        </div>
      </div>

      <main id="main" className="section-tight">
        <div className="container dash-layout">
          <div>
            <div className="card">
              <div className="card-head">
                <h3>{t("db.yourReqs")}</h3>
                <button className="btn btn-accent btn-sm" onClick={() => setModalOpen(true)}>
                  {t("db.addReq")}
                </button>
              </div>
              <div id="myReqs">
                {!reqs.length ? (
                  <div className="empty">
                    <div className="icon">
                      <i className="bi bi-card-list" aria-hidden="true"></i>
                    </div>
                    <p>{t("db.noReqs")}</p>
                  </div>
                ) : (
                  reqs.map((r, i) => (
                    <div className="crop-row" key={`${r.crop}-${i}`}>
                      <div>
                        <strong style={{ textTransform: "capitalize" }}>{cropName(r.crop)}</strong>
                        <div className="muted text-sm">
                          {t("db.needOffer", {
                            qty: r.quantity,
                            unit: unitName(r.unit),
                            price: r.price,
                          })}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => alert(t("db.editSoon"))}
                        >
                          {t("c.edit")}
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setReqs((prev) => prev.filter((_, j) => j !== i))}
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
                <h3>{t("db.nearby")}</h3>
              </div>
              <div className="table-wrap">
                <table className="data" id="nearbyFarmersTable">
                  <thead>
                    <tr>
                      <th>{t("db.thFarmer")}</th>
                      <th>{t("db.thCrop")}</th>
                      <th>{t("db.thDist")}</th>
                      <th>{t("db.thQty")}</th>
                      <th>{t("db.thPrice")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {farmers.map((f, i) => (
                      <tr key={i}>
                        <td>
                          {f.name} {f.verified ? <VerifiedBadge withLabel /> : ""}
                        </td>
                        <td style={{ textTransform: "capitalize" }}>{cropName(f.crop)}</td>
                        <td>{f.distanceKm} km</td>
                        <td>
                          {f.quantity} {unitName(f.unit)}
                        </td>
                        <td className="num">
                          ₹{f.price}/{unitName(f.unit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <h3>{t("db.avgSnap")}</h3>
              <div id="avgSnapshot">
                {snapshot && (
                  <>
                    <div className="stat mt-2">
                      <div className="label">{t("db.avgTomato")}</div>
                      <div className="value">
                        ₹{snapshot.modal}/{unitName(snapshot.unit)}
                      </div>
                    </div>
                    <div className="stat mt-4">
                      <div className="label">{t("db.availRange")}</div>
                      <div className="value" style={{ fontSize: "1.2rem" }}>
                        ₹{snapshot.min}–₹{snapshot.max}/{unitName(snapshot.unit)}
                      </div>
                    </div>
                    <p className="muted text-sm mt-3 mb-0">
                      {t("db.foundNearby", { n: farmers.length })}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="card mt-5">
              <h3>{t("db.quick")}</h3>
              <div className="grid" style={{ gap: 10 }}>
                <Link to="/market" className="btn btn-outline btn-block">
                  {t("db.searchCrop")}
                </Link>
                <Link to="/farmers" className="btn btn-outline btn-block">
                  {t("db.findFarmers")}
                </Link>
                <Link to="/crop?crop=tomato" className="btn btn-outline btn-block">
                  {t("db.priceHist")}
                </Link>
                <Link to="/alerts" className="btn btn-outline btn-block">
                  {t("db.manageAlerts")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Modal
        id="addReqModal"
        open={modalOpen}
        title={t("db.mTitle")}
        onClose={() => setModalOpen(false)}
      >
        <form id="addReqForm" onSubmit={submitAdd}>
          <div className="field">
            <label htmlFor="arCrop">{t("db.mCrop")}</label>
            <select id="arCrop" value={arCrop} onChange={(e) => setArCrop(e.target.value)}>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {cropName(c)}
                </option>
              ))}
            </select>
          </div>
          <div className="row-2">
            <div className="field">
              <label htmlFor="arQty">{t("db.mQty")}</label>
              <input
                id="arQty"
                type="number"
                placeholder={t("db.mQtyPh")}
                value={arQty}
                onChange={(e) => setArQty(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="arUnit">{t("db.mUnit")}</label>
              <select id="arUnit" value={arUnit} onChange={(e) => setArUnit(e.target.value)}>
                <option value="kg">{unitName("kg")}</option>
                <option value="quintal">{unitName("quintal")}</option>
                <option value="tonne">{unitName("tonne")}</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="arPrice">{t("db.mPrice")}</label>
            <input
              id="arPrice"
              type="number"
              placeholder={t("db.mPricePh")}
              value={arPrice}
              onChange={(e) => setArPrice(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            {t("db.mAdd")}
          </button>
        </form>
      </Modal>
    </>
  );
}
