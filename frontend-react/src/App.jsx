import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./lib/i18n.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Market from "./pages/Market.jsx";
import CropDetail from "./pages/CropDetail.jsx";
import Farmers from "./pages/Farmers.jsx";
import DashboardFarmer from "./pages/DashboardFarmer.jsx";
import Alerts from "./pages/Alerts.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="market" element={<Market />} />
            <Route path="crop" element={<CropDetail />} />
            <Route path="farmers" element={<Farmers />} />
            <Route path="dashboard-farmer" element={<DashboardFarmer />} />
            <Route path="alerts" element={<Alerts />} />
            {/* Auth removed — the app is fully open, no login required.
                Keep old bookmarks working by sending them to home. */}
            <Route path="login" element={<Navigate to="/" replace />} />
            <Route path="register" element={<Navigate to="/" replace />} />
            <Route path="profile" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  );
}
