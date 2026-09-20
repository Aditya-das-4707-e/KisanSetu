import { useEffect, useState } from "react";
import { getAllCrops, getNearbyFarmers } from "../lib/api.js";
import { useLang } from "../lib/i18n.jsx";
import { VerifiedBadge } from "../components/bits.jsx";

export default function Farmers() {
  const { t, cropName, unitName } = useLang();
  const [crops, setCrops] = useState([]);
  const [rows, setRows] = useState([]);
  const [crop, setCrop] = useState("");
  const [dist, setDist] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [verified, setVerified] = useState("");

  useEffect(() => {
    getAllCrops().then(setCrops);
    getNearbyFarmers("").then(setRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    const data = await getNearbyFarmers(crop, {
      maxDistance: Number(dist) || null,
      maxPrice: Number(maxPrice) || null,
      verifiedOnly: verified === "1",
    });
    setRows(data);
  }

  return (
    <main id="main" className="section-tight">
      <div className="container">
        <h1>{t("fm.title")}</h1>
        <p className="muted">{t("fm.sub")}</p>

        <div className="filters">
          <div className="field">
            <label htmlFor="fCrop">{t("fm.crop")}</label>
            <select id="fCrop" value={crop} onChange={(e) => setCrop(e.target.value)}>
              <option value="">{t("fm.allCrops")}</option>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {cropName(c)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="fDist">{t("fm.maxDist")}</label>
            <input
              id="fDist"
              type="number"
              placeholder={t("c.any")}
              value={dist}
              onChange={(e) => setDist(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="fMaxPrice">{t("fm.maxPrice")}</label>
            <input
              id="fMaxPrice"
              type="number"
              placeholder={t("c.any")}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="fVerified">{t("fm.verOnly")}</label>
            <select id="fVerified" value={verified} onChange={(e) => setVerified(e.target.value)}>
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
                <th>{t("fm.thFarmer")}</th>
                <th>{t("fm.thCrop")}</th>
                <th>{t("fm.thLoc")}</th>
                <th>{t("fm.thDist")}</th>
                <th>{t("fm.thQty")}</th>
                <th>{t("fm.thPrice")}</th>
              </tr>
            </thead>
            <tbody id="farmersBody">
              {rows.map((f, i) => (
                <tr key={i}>
                  <td>
                    {f.name} {f.verified ? <VerifiedBadge withLabel /> : ""}
                  </td>
                  <td style={{ textTransform: "capitalize" }}>{cropName(f.crop)}</td>
                  <td>{f.locality}</td>
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
        <div className="empty" id="emptyState" style={{ display: rows.length ? "none" : "block" }}>
          <div className="icon">
            <i className="bi bi-people" aria-hidden="true"></i>
          </div>
          <p>{t("fm.empty")}</p>
        </div>
      </div>
    </main>
  );
}
