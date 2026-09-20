import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllCrops, getLocations } from "../lib/api.js";
import { validateValues } from "../lib/validation.js";
import { useLang } from "../lib/i18n.jsx";

function Field({ id, label, error, children }) {
  return (
    <div className={`field${error ? " has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      <div className="field-error">{error || ""}</div>
    </div>
  );
}

export default function Register() {
  const { t, cropName, cropLocal, validators } = useLang();
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [locs, setLocs] = useState(null);
  const [regState, setRegState] = useState("");
  const [regDistrict, setRegDistrict] = useState("");
  const [regCity, setRegCity] = useState("");
  const [regCityOther, setRegCityOther] = useState("");
  const [values, setValues] = useState({
    fullName: "",
    age: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    farmerQty: "",
    farmName: "",
    farmSize: "",
  });
  const [farmerCrops, setFarmerCrops] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getAllCrops().then(setCrops);
    getLocations().then((l) => {
      setLocs(l);
      const s = Object.keys(l)[0];
      const d = Object.keys(l[s])[0];
      setRegState(s);
      setRegDistrict(d);
      setRegCity(l[s][d][0]);
    });
  }, []);

  const districts = regState && locs ? Object.keys(locs[regState]) : [];
  const cities = regState && regDistrict && locs ? locs[regState][regDistrict] : [];
  const cropOpts = crops.map((c) => (
    <option key={c.id} value={c.id}>
      {cropName(c)} ({cropLocal(c)})
    </option>
  ));

  function set(id, v) {
    setValues((prev) => ({ ...prev, [id]: v }));
  }

  function submit(e) {
    e.preventDefault();
    const V = validators();
    const errs = validateValues(values, {
      fullName: [V.required],
      age: [V.required, V.minAge(18)],
      email: [V.required, V.email],
      phone: [V.required, V.phone],
      password: [V.required, V.minLength(8)],
      confirmPassword: [V.required, V.matches(values.password, t("rg.pw"))],
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    // Demo only — real submission will POST to /api/auth/register/
    navigate("/dashboard-farmer");
  }

  return (
    <main id="main" className="section-tight">
      <div className="container">
        <div className="auth-card wide card" style={{ margin: "0 auto" }}>
          <h2>{t("rg.title")}</h2>
          <p className="muted text-sm">{t("rg.sub")}</p>

          <p className="help">{t("rg.help")}</p>

          <form id="registerForm" noValidate onSubmit={submit}>
            <div className="row-2">
              <Field id="fullName" label={t("rg.name")} error={errors.fullName}>
                <input
                  id="fullName"
                  type="text"
                  placeholder={t("rg.namePh")}
                  value={values.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                />
              </Field>
              <Field id="age" label={t("rg.age")} error={errors.age}>
                <input
                  id="age"
                  type="number"
                  min="18"
                  placeholder={t("rg.agePh")}
                  value={values.age}
                  onChange={(e) => set("age", e.target.value)}
                />
              </Field>
            </div>

            <div className="row-2">
              <Field id="email" label={t("rg.email")} error={errors.email}>
                <input
                  id="email"
                  type="email"
                  placeholder={t("rg.emailPh")}
                  value={values.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
              <Field id="phone" label={t("rg.phone")} error={errors.phone}>
                <input
                  id="phone"
                  type="tel"
                  placeholder={t("rg.phonePh")}
                  value={values.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </Field>
            </div>

            <div className="row-2">
              <Field id="password" label={t("rg.pw")} error={errors.password}>
                <input
                  id="password"
                  type="password"
                  placeholder={t("rg.pwPh")}
                  value={values.password}
                  onChange={(e) => set("password", e.target.value)}
                />
              </Field>
              <Field id="confirmPassword" label={t("rg.pw2")} error={errors.confirmPassword}>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("rg.pw2Ph")}
                  value={values.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                />
              </Field>
            </div>

            <h3 style={{ fontSize: "1rem", marginTop: 24 }}>{t("rg.loc")}</h3>
            <div className="row-3">
              <div className="field">
                <label htmlFor="regState">{t("rg.state")}</label>
                <select
                  id="regState"
                  value={regState}
                  onChange={(e) => {
                    const s = e.target.value;
                    setRegState(s);
                    const d = Object.keys(locs[s])[0];
                    setRegDistrict(d);
                    setRegCity(locs[s][d][0]);
                    setRegCityOther("");
                  }}
                >
                  {locs &&
                    Object.keys(locs).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="regDistrict">{t("rg.district")}</label>
                <select
                  id="regDistrict"
                  value={regDistrict}
                  onChange={(e) => {
                    const d = e.target.value;
                    setRegDistrict(d);
                    setRegCity(locs[regState][d][0]);
                    setRegCityOther("");
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
                <label htmlFor="regCity">{t("rg.city")}</label>
                <select
                  id="regCity"
                  value={regCity}
                  onChange={(e) => {
                    setRegCity(e.target.value);
                    setRegCityOther("");
                  }}
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__other">{t("rg.otherOpt")}</option>
                </select>
              </div>
              <div
                className="field"
                id="regCityOtherWrap"
                style={{ display: regCity === "__other" ? "block" : "none" }}
              >
                <label htmlFor="regCityOther">{t("rg.other")}</label>
                <input
                  id="regCityOther"
                  type="text"
                  placeholder={t("rg.otherPh")}
                  autoComplete="off"
                  value={regCityOther}
                  onChange={(e) => setRegCityOther(e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="address">
                {t("rg.addr")}{" "}
                <span className="muted" style={{ fontWeight: 400 }}>
                  {t("rg.addrNote")}
                </span>
              </label>
              <input
                id="address"
                type="text"
                placeholder={t("rg.addrPh")}
                value={values.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>

            <div id="farmerFields">
                <h3 style={{ fontSize: "1rem", marginTop: 24 }}>{t("rg.farmAbout")}</h3>
                <div className="row-2">
                  <div className="field">
                    <label htmlFor="farmerCrops">{t("rg.farmerCrops")}</label>
                    <select
                      id="farmerCrops"
                      multiple
                      size="4"
                      value={farmerCrops}
                      onChange={(e) =>
                        setFarmerCrops([...e.target.selectedOptions].map((o) => o.value))
                      }
                    >
                      {cropOpts}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="farmerQty">{t("rg.farmerQty")}</label>
                    <input
                      id="farmerQty"
                      type="number"
                      placeholder={t("rg.farmerQtyPh")}
                      value={values.farmerQty}
                      onChange={(e) => set("farmerQty", e.target.value)}
                    />
                  </div>
                </div>
                <div className="row-2">
                  <div className="field">
                    <label htmlFor="farmName">
                      {t("rg.farmName")}{" "}
                      <span className="muted" style={{ fontWeight: 400 }}>
                        {t("rg.opt")}
                      </span>
                    </label>
                    <input
                      id="farmName"
                      type="text"
                      placeholder={t("rg.farmNamePh")}
                      value={values.farmName}
                      onChange={(e) => set("farmName", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="farmSize">
                      {t("rg.farmSize")}{" "}
                      <span className="muted" style={{ fontWeight: 400 }}>
                        {t("rg.opt")}
                      </span>
                    </label>
                    <input
                      id="farmSize"
                      type="number"
                      placeholder={t("rg.farmSizePh")}
                      value={values.farmSize}
                      onChange={(e) => set("farmSize", e.target.value)}
                    />
                  </div>
                </div>
              </div>

            <div className="field mt-3">
              <label htmlFor="profilePhoto">
                {t("rg.photo")}{" "}
                <span className="muted" style={{ fontWeight: 400 }}>
                  {t("rg.opt")}
                </span>
              </label>
              <input id="profilePhoto" type="file" accept="image/*" />
            </div>

            <button type="submit" className="btn btn-primary btn-block mt-3">
              {t("rg.create")}
            </button>
          </form>

          <p className="text-sm mt-4" style={{ textAlign: "center" }}>
            {t("rg.have")} <Link to="/login">{t("rg.login")}</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
