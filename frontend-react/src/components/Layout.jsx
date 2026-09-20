import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar, Footer, LocationModal } from "./chrome.jsx";
import { getSavedLocation } from "../lib/api.js";
import { useLang } from "../lib/i18n.jsx";

export default function Layout() {
  const { t } = useLang();
  const [location, setLocation] = useState(() => getSavedLocation());
  const [locOpen, setLocOpen] = useState(false);

  return (
    <>
      <a className="skip-link" href="#main">
        {t("skip")}
      </a>
      <div id="site-navbar">
        <Navbar location={location} onOpenLocation={() => setLocOpen(true)} />
      </div>
      <Outlet context={{ location, setLocation, openLocation: () => setLocOpen(true) }} />
      <div id="site-footer">
        <Footer />
      </div>
      <LocationModal open={locOpen} onClose={() => setLocOpen(false)} onSaved={setLocation} />
    </>
  );
}
