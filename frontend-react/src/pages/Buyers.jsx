import { useEffect, useState } from "react";
import { getAllCrops, getNearbyBuyers } from "../lib/api.js";
import { useLang } from "../lib/i18n.jsx";
import { VerifiedBadge } from "../components/bits.jsx";

export default function Buyers() {
  const { t, cropName, unitName } = useLang();
  const [crops, setCrops] = useState([]);
  const [rows, setRows] = useState([]);
  const [crop, setCrop] = useState("");
  const [dist, setDist] = useState("");
  const [verified, setVerified] = useState("");

  useEffect(() => {
    getAllCrops().then(setCrops);
    getNearbyBuyers("").then(setRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    const data = await getNearbyBuyers(crop, {
      maxDistance: Number(dist) || null,
      verifiedOnly: verified === "1",
    });
    setRows(data);
  }

  return (
    <main id="main" className="section-tight">
      <div className="container">
        <h1>{t("by.title")}</h1>
        <p className="muted">{t("by.sub")}</p>

        <div className="filters">
          <div className="field">
            <label htmlFor="bCrop">{t("by.crop")}</label>
            <select id="bCrop" value={crop} onChange={(e) => setCrop(e.target.value)}>
              <option value="">{t("by.allCrops")}</option>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {cropName(c)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="bDist">{t("by.maxDist")}</label>
            <input
              id="bDist"
              type="number"
              placeholder={t("c.any")}
              value={dist}
              onChange={(e) => setDist(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="bVerified">{t("by.verOnly")}</label>
            <select id="bVerified" value={verified} onChange={(e) => setVerified(e.target.value)}>
              <option value="">{t("c.no")}</option>
              <option value="1">{t("c.yes")}</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={load}>
            {t("c.applyFilters")}
          </button>
        </div>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>{t("by.thBuyer")}</th>
                <th>{t("by.thCrop")}</th>
                <th>{t("by.thLoc")}</th>
                <th>{t("by.thDist")}</th>
                <th>{t("by.thReqQty")}</th>
                <th>{t("by.thBuyPrice")}</th>
              </tr>
            </thead>
            <tbody id="buyersBody">
              {rows.map((b, i) => (
                <tr key={i}>
                  <td>
                    {b.name} {b.verified ? <VerifiedBadge withLabel /> : ""}
                  </td>
                  <td style={{ textTransform: "capitalize" }}>{cropName(b.crop)}</td>
                  <td>{b.locality}</td>
                  <td>{b.distanceKm} km</td>
                  <td>
                    {b.requiredQuantity} {unitName(b.unit)}
                  </td>
                  <td className="num">
                    ₹{b.price}/{unitName(b.unit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="empty" id="emptyState" style={{ display: rows.length ? "none" : "block" }}>
          <div className="icon">
            <i className="bi bi-briefcase" aria-hidden="true"></i>
          </div>
          <p>{t("by.empty")}</p>
        </div>
      </div>
    </main>
  );
}
