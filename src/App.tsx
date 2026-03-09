import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import CampaignListDemo from "./pages/CampaignListDemo";
import CampaignCreateDemo from "./pages/CampaignCreateDemo";
import TriggerListDemo from "./pages/TriggerListDemo";
import TriggerCreateDemo from "./pages/TriggerCreateDemo";

const getClassName = ({ isActive }: { isActive: boolean }) =>
  isActive ? "active" : "";

export default function App() {
  return (
    <div className="app-layout">
      {/* Header — matches AppLayout.tsx */}
      <div className="app-layout-header">
        <div className="app-layout-header-title">Targeting (Demo)</div>
        <div className="app-layout-header-right">
          <span className="app-header-link">Help &amp; Feedback</span>
          <span className="app-header-link">Documentation</span>
          <span className="app-header-link">Settings</span>
        </div>
      </div>

      <div className="app-layout-main">
        {/* Sidebar */}
        <div className="app-layout-sidebar">
          <div className="app-nav-section">
            <div className="app-nav-section-title">Emails</div>
            <div className="app-nav-link">
              <NavLink to="/campaigns" className={getClassName}>
                Campaigns
              </NavLink>
            </div>
          </div>

          <div className="app-nav-section">
            <div className="app-nav-section-title">Trigger Rules</div>
            <div className="app-nav-link">
              <NavLink to="/triggers" className={getClassName}>
                Rules
              </NavLink>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="app-layout-content">
          <Routes>
            <Route path="/" element={<Navigate to="/campaigns" replace />} />
            <Route path="/campaigns" element={<CampaignListDemo />} />
            <Route path="/campaign/new" element={<CampaignCreateDemo />} />
            <Route path="/triggers" element={<TriggerListDemo />} />
            <Route path="/trigger/new" element={<TriggerCreateDemo />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
