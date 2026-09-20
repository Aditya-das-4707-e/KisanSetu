/* Shared UI: navbar location, search autocomplete, demo user, footer year. */
window.App = (() => {
  function q(name) { return new URLSearchParams(window.location.search).get(name) || ""; }
  function user() { try { return JSON.parse(localStorage.getItem("kisansetu_user") || "null"); } catch { return null; } }
  function paintNav(active) {
    document.querySelectorAll("[data-nav]").forEach(a => {
      if (a.getAttribute("data-nav") === active) a.classList.add("active");
    });
    const slot = document.getElementById("nav-auth");
    const u = user();
    if (slot) {
      slot.innerHTML = u
        ? `<li class="nav-item"><a class="nav-link" href="${u.role === "buyer" ? "dashboard-buyer.html" : "dashboard-farmer.html"}">Dashboard (${u.role})</a></li>
           <li class="nav-item"><a class="nav-link" href="alerts.html">Alerts</a></li>
           <li class="nav-item"><a class="nav-link" href="profile.html">Profile</a></li>
           <li class="nav-item"><button class="btn btn-sm btn-light ms-2" id="logout-btn">Logout</button></li>`
        : `<li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
           <li class="nav-item"><a class="btn btn-light btn-sm ms-2" href="register.html">Register</a></li>`;
      document.getElementById("logout-btn")?.addEventListener("click", () => {
        localStorage.removeItem("kisansetu_user"); location.href = "index.html";
      });
    }
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }
  // Simple datalist autocomplete for crop search inputs
  async function wireSearch(inputId, listId) {
    const input = document.getElementById(inputId), list = document.getElementById(listId);
    if (!input || !list) return;
    const paint = async () => {
      const hits = await window.Api.searchCrops(input.value);
      list.innerHTML = hits.slice(0, 8).map(c => `<option value="${c.name}">${c.local ? c.local : ""}</option>`).join("");
    };
    input.addEventListener("input", paint);
    await paint();
  }
  function trendBadge(trend) {
    if (!trend) return "";
    if (trend.dir === "up") return `<span class="trend-up"><i class="bi bi-arrow-up-circle-fill" aria-hidden="true"></i> Rising (${trend.pct}%)</span>`;
    if (trend.dir === "down") return `<span class="trend-down"><i class="bi bi-arrow-down-circle-fill" aria-hidden="true"></i> Falling (${trend.pct}%)</span>`;
    return `<span class="trend-flat"><i class="bi bi-dash-circle" aria-hidden="true"></i> Stable (${trend.pct}%)</span>`;
  }
  function timeAgo(iso) {
    const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 60) return `${mins} min ago`;
    const h = Math.round(mins / 60);
    return h < 24 ? `${h} hr ago` : `${Math.round(h / 24)} d ago`;
  }
  return { q, user, paintNav, wireSearch, trendBadge, timeAgo };
})();
