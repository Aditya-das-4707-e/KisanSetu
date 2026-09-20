/* Client-side form validation helpers with inline errors. */
window.Validate = (() => {
  const email = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || "").trim());
  const phone = (v) => /^[6-9]\d{9}$/.test((v || "").replace(/\s/g, ""));
  function field(id, ok, msg) {
    const input = document.getElementById(id);
    let err = document.getElementById(id + "-err");
    if (!input) return ok;
    if (!err) {
      err = document.createElement("div");
      err.className = "field-error"; err.id = id + "-err";
      input.after(err);
    }
    err.textContent = ok ? "" : (msg || "Invalid value");
    err.classList.toggle("show", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    return ok;
  }
  function required(id, msg) {
    const v = document.getElementById(id)?.value?.trim();
    return field(id, !!v, msg || "This field is required");
  }
  return { email, phone, field, required };
})();
