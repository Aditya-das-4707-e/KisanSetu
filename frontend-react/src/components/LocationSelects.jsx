import { useEffect, useState } from "react";
import { getLocations, getSavedLocation } from "../lib/api.js";
import { useLang } from "../lib/i18n.jsx";

/**
 * Shared State → District → City selector with the
 * "Other town / village (type below)" fallback — same as the static site.
 */
export default function LocationSelects({
  idPrefix = "loc",
  onChange,
  compact = false,
}) {
  const { t } = useLang();
  const [locs, setLocs] = useState(null);
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [other, setOther] = useState("");

  useEffect(() => {
    getLocations().then((l) => {
      setLocs(l);
      // Preselect the saved location (if any) instead of the first entries.
      const saved = getSavedLocation();
      const states = Object.keys(l);
      const initState = states.includes(saved.state) ? saved.state : states[0];
      const districts = Object.keys(l[initState]);
      const initDistrict = districts.includes(saved.district)
        ? saved.district
        : districts[0];
      const cities = l[initState][initDistrict];
      let initCity = cities[0];
      let initOther = "";
      if (saved.locality && cities.includes(saved.locality)) {
        initCity = saved.locality;
      } else if (saved.locality && saved.locality !== initDistrict) {
        initCity = "__other";
        initOther = saved.locality;
      }
      setState(initState);
      setDistrict(initDistrict);
      setCity(initCity);
      setOther(initOther);
    });
  }, []);

  const districts = state && locs ? Object.keys(locs[state]) : [];
  const cities = state && district && locs ? locs[state][district] : [];
  const isOther = city === "__other";

  useEffect(() => {
    if (!onChange || !state) return;
    const locality = isOther ? other.trim() || district : city;
    onChange({ state, district, locality, isOther, otherText: other });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, district, city, other]);

  if (!locs) return <p className="muted text-sm">{t("loc.loading")}</p>;

  return (
    <>
      <div className="field">
        <label htmlFor={`${idPrefix}State`}>{t("loc.state")}</label>
        <select
          id={`${idPrefix}State`}
          value={state}
          onChange={(e) => {
            const s = e.target.value;
            setState(s);
            const d = Object.keys(locs[s])[0];
            setDistrict(d);
            setCity(locs[s][d][0]);
            setOther("");
          }}
        >
          {Object.keys(locs).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`${idPrefix}District`}>{t("loc.district")}</label>
        <select
          id={`${idPrefix}District`}
          value={district}
          onChange={(e) => {
            const d = e.target.value;
            setDistrict(d);
            setCity(locs[state][d][0]);
            setOther("");
          }}
        >
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`${idPrefix}City`}>{t("loc.city")}</label>
        <select
          id={`${idPrefix}City`}
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setOther("");
          }}
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value="__other">{t("loc.otherOpt")}</option>
        </select>
      </div>
      {isOther && (
        <div className="field">
          <label htmlFor={`${idPrefix}CityOther`}>{t("loc.otherLabel")}</label>
          <input
            id={`${idPrefix}CityOther`}
            type="text"
            placeholder={t("loc.otherPh")}
            autoComplete="off"
            value={other}
            onChange={(e) => setOther(e.target.value)}
          />
        </div>
      )}
      {compact ? null : null}
    </>
  );
}
