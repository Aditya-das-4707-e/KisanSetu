import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { getAllPrices, detectLocation, saveLocation } from "../lib/api.js";
import { useLang } from "../lib/i18n.jsx";
import { TrendIcon } from "../components/bits.jsx";

function readSavedLocationRaw() {
  try {
    return JSON.parse(localStorage.getItem("kisansetu_location") || "null");
  } catch {
    return null;
  }
}

export default function Home() {
  const { t, cropName, cropLocal, unitName } = useLang();
  const { openLocation } = useOutletContext();
  const navigate = useNavigate();
  const [hero, setHero] = useState("");
  const [trending, setTrending] = useState([]);
  // locBox: { kind: 'detecting' } | { kind: 'saved', loc } | { kind: 'denied' } | { kind: 'unavailable' }
  const [locBox, setLocBox] = useState({ kind: "detecting" });

  useEffect(() => {
    getAllPrices().then((all) => {
      const sorted = [...all]
        .sort((a, b) => Math.abs(b.price.trendPct) - Math.abs(a.price.trendPct))
        .slice(0, 6);
      setTrending(sorted);
    });
  }, []);

  useEffect(() => {
    const saved = readSavedLocationRaw();
    if (saved) {
      setLocBox({ kind: "saved", loc: saved });
      return;
    }
    if (!navigator.geolocation) {
      setLocBox({ kind: "unavailable" });
      return;
    }
    setLocBox({ kind: "detecting" });
    navigator.geolocation.getCurrentPosition(
      async () => {
        try {
          const loc = await detectLocation();
          saveLocation(loc);
          setLocBox({ kind: "saved", loc });
        } catch (err) {
          if (err && err.code === "LOOKUP" && err.coords) {
            const { latitude, longitude } = err.coords;
            const loc = {
              locality: t("loc.me"),
              district: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
              state: "",
            };
            saveLocation(loc);
            setLocBox({ kind: "saved", loc });
          } else {
            setLocBox({ kind: "denied" });
          }
        }
      },
      () => setLocBox({ kind: "denied" }),
      { timeout: 6000 }
    );
  }, []);

  function submitSearch(e) {
    e.preventDefault();
    const v = hero.trim();
    if (v) navigate(`/market?q=${encodeURIComponent(v)}`);
  }

  return (
    <main id="main">
      <section className="hero">
        <div className="container">
          <span className="eyebrow-loc" id="locStatusBox">
            {locBox.kind === "saved" ? (
              <>
                <i className="bi bi-geo-alt" aria-hidden="true"></i>{" "}
                {t("home.showingFor", {
                  loc: `${locBox.loc.locality}, ${locBox.loc.district}`,
                })}{" "}
                &nbsp;·&nbsp;{" "}
                <a
                  href="#"
                  id="locChangeLink"
                  onClick={(e) => {
                    e.preventDefault();
                    openLocation();
                  }}
                >
                  {t("home.change")}
                </a>
              </>
            ) : locBox.kind === "denied" ? (
              <>
                {t("home.denied")}{" "}
                <a
                  href="#"
                  id="locManualLink"
                  onClick={(e) => {
                    e.preventDefault();
                    openLocation();
                  }}
                >
                  {t("home.manual")}
                </a>
              </>
            ) : locBox.kind === "unavailable" ? (
              <>
                {t("home.unavailable")}{" "}
                <a
                  href="#"
                  id="locManualLink"
                  onClick={(e) => {
                    e.preventDefault();
                    openLocation();
                  }}
                >
                  {t("home.manual")}
                </a>
              </>
            ) : (
              <>
                <i className="bi bi-geo-alt" aria-hidden="true"></i> {t("home.detecting")}
              </>
            )}
          </span>
          <h1>
            {t("home.t1")}
            <br />
            {t("home.t2")}
          </h1>
          <p className="sub">{t("home.sub")}</p>
          <form className="search-hero" onSubmit={submitSearch}>
            <input
              id="heroSearch"
              type="search"
              placeholder={t("home.searchPh")}
              aria-label={t("home.searchPh")}
              value={hero}
              onChange={(e) => setHero(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              {t("home.search")}
            </button>
          </form>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <div className="grid grid-3">
            <Link className="card card-tight" to="/market" style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>
                <i className="bi bi-bar-chart-line" aria-hidden="true"></i>
              </div>
              <h3 style={{ marginBottom: 4, fontSize: "1.05rem" }}>{t("home.c1t")}</h3>
              <p className="muted text-sm mb-0">{t("home.c1d")}</p>
            </Link>
            <Link className="card card-tight" to="/farmers" style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>
                <i className="bi bi-people" aria-hidden="true"></i>
              </div>
              <h3 style={{ marginBottom: 4, fontSize: "1.05rem" }}>{t("home.c3t")}</h3>
              <p className="muted text-sm mb-0">{t("home.c3d")}</p>
            </Link>
            <Link className="card card-tight" to="/market" style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>
                <i className="bi bi-graph-up-arrow" aria-hidden="true"></i>
              </div>
              <h3 style={{ marginBottom: 4, fontSize: "1.05rem" }}>{t("home.c4t")}</h3>
              <p className="muted text-sm mb-0">{t("home.c4d")}</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <div className="flex-between mt-2 mb-0" style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>{t("home.trending")}</h2>
            <Link to="/market">{t("home.viewAll")}</Link>
          </div>
          <div className="tag-strip" id="trendingCrops">
            {trending.map(({ crop, price }) => (
              <Link key={crop.id} className="crop-card" to={`/crop?crop=${crop.id}`}>
                <div className="name">{cropName(crop)}</div>
                <div className="local">{cropLocal(crop)}</div>
                <div className="price-line">
                  <span className="price">₹{price.modal}</span>
                  <span className="unit">/{unitName(price.unit)}</span>
                </div>
                <span className={`trend ${price.trendDir}`}>
                  <TrendIcon dir={price.trendDir} /> {price.trendPct}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <h2>{t("home.how")}</h2>
          <div className="steps mt-4">
            <div className="step">
              <div className="n">1</div>
              <h3 style={{ fontSize: "1.1rem" }}>{t("home.s1t")}</h3>
              <p className="muted">{t("home.s1d")}</p>
            </div>
            <div className="step">
              <div className="n">2</div>
              <h3 style={{ fontSize: "1.1rem" }}>{t("home.s2t")}</h3>
              <p className="muted">{t("home.s2d")}</p>
            </div>
            <div className="step">
              <div className="n">3</div>
              <h3 style={{ fontSize: "1.1rem" }}>{t("home.s3t")}</h3>
              <p className="muted">{t("home.s3d")}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
