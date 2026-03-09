import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TransactionalDiscoveryBanner() {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (dismissed) return null;

  return (
    <div className="banner">
      <div className="banner-content">
        <span className="banner-icon">&#9889;</span>
        <div className="banner-text">
          <strong>Need guaranteed delivery?</strong> Classify your message as
          transactional to get SLO-backed delivery with priority routing.
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button
          className="banner-action"
          onClick={() => navigate("/campaign/new")}
        >
          Create Transactional Message
        </button>
        <button className="banner-dismiss" onClick={() => setDismissed(true)}>
          &times;
        </button>
      </div>
    </div>
  );
}
