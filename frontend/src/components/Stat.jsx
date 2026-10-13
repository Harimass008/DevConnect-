import React from "react";

export default function Stat({ icon: Icon, label, value, hint }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">
          <Icon size={17} />
        </span>
      </div>
      <div
        className={`stat-value ${String(value).length > 12 ? "stat-value-small" : ""}`}
      >
        {value}
      </div>
      <div className="stat-bottom">{hint}</div>
    </div>
  );
}
