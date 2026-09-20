import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./lib/i18n.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Market from "./pages/Market.jsx";
import CropDetail from "./pages/CropDetail.jsx";
import Farmers from "./pages/Farmers.jsx";
import DashboardFarmer from "./pages/DashboardFarmer.jsx";
import Alerts from "./pages/Alerts.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
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
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  );
}
