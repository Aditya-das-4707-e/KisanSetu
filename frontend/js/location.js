/* Location: browser Geolocation + manual State/District/City fallback.
   Demo-only: coordinates reverse-map to a fixed demo locality from mock-data. */
window.LocationSvc = (() => {
  const KEY = "kisansetu_location";
  const GEO_ICON = '<i class="bi bi-geo-alt" aria-hidden="true"></i> ';
  function get() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
  }
  function set(loc) { localStorage.setItem(KEY, JSON.stringify(loc)); render(); }
  function demoFromCoords() {
    const d = window.MockDB.locations.demo_locality;
    return { ...d, method: "gps-demo" };
  }
  function detect() {
    const cur = get();
    if (cur) { render(); return; }
    const pill = document.getElementById("location-label");
    if (pill) pill.innerHTML = GEO_ICON + "Detecting your location...";
    if (!navigator.geolocation) { showManual(); render(); return; }
    navigator.geolocation.getCurrentPosition(
      () => { set(demoFromCoords()); },
      () => { showManual(); render(); },
      { timeout: 8000 }
    );
  }
  function showManual() {
    const m = document.getElementById("location-modal");
    if (m && typeof bootstrap !== "undefined") new bootstrap.Modal(m).show();
  }
  function render() {
    const loc = get();
    const el = document.getElementById("location-label");
    if (el) el.innerHTML = loc ? GEO_ICON + `${loc.city || loc.district}, ${loc.state}` : GEO_ICON + "Set location";
  }
  // Populate State -> District -> City selects inside the modal
  function wireModal(stateId, distId, cityId, saveId) {
    const s = document.getElementById(stateId), d = document.getElementById(distId), c = document.getElementById(cityId);
    if (!s || !d || !c) return;
    const states = window.MockDB.locations.states;
    s.innerHTML = `<option value="">State</option>` + Object.keys(states).map(k => `<option>${k}</option>`).join("");
    s.onchange = () => {
      const dists = states[s.value] ? Object.keys(states[s.value].districts) : [];
      d.innerHTML = `<option value="">District</option>` + dists.map(k => `<option>${k}</option>`).join("");
      c.innerHTML = `<option value="">City</option>`;
    };
    d.onchange = () => {
      const cities = (states[s.value] && states[s.value].districts[d.value]) || [];
      c.innerHTML = `<option value="">City</option>` + cities.map(k => `<option>${k}</option>`).join("");
    };
    const save = document.getElementById(saveId);
    if (save) save.onclick = () => {
      if (!s.value) return;
      set({ state: s.value, district: d.value || "", city: c.value || d.value || s.value, method: "manual" });
      if (typeof bootstrap !== "undefined") bootstrap.Modal.getInstance(document.getElementById("location-modal"))?.hide();
    };
  }
  return { get, set, detect, render, wireModal, showManual };
})();
