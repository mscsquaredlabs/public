// DashboardSettings.jsx
// Dashboard-level settings component shown in the config panel

import React from 'react';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';

const DashboardSettings = ({
  dashboardStyle,
  setDashboardStyle,
  sidebarPosition,
  setSidebarPosition,
  darkMode
}) => {
  const handleStyleChange = (value) => {
    setDashboardStyle(value);
    localStorage.setItem('atf-dev-studio-dashboard-style', value);
  };

  const handleSidebarPositionChange = (value) => {
    setSidebarPosition(value);
    localStorage.setItem('atf-dev-studio-sidebar-position', value);
  };

  return (
    <div className={`dashboard-settings ${darkMode ? 'dark-mode' : ''}`}>
      <h3 className="config-section-title">Dashboard Settings</h3>
      
      {/* Dashboard Style Toggle */}
      <div className="config-form-group">
        <label>Dashboard Style</label>
        <div className="config-option">
          <StandardToggleSwitch
            leftLabel="Simple"
            rightLabel="Modern"
            isActive={dashboardStyle}
            onChange={handleStyleChange}
            name="dashboardStyle"
            leftValue="simple"
            rightValue="modern"
          />
          <p className="config-helper-text">
            {dashboardStyle === 'modern' 
              ? 'Modern style provides a vibrant, colorful design with enhanced visual elements.'
              : 'Simple style provides a clean, minimal design.'}
          </p>
        </div>
      </div>

      {/* Sidebar Position Toggle */}
      <div className="config-form-group">
        <label>Sidebar Position</label>
        <div className="config-option">
          <StandardToggleSwitch
            leftLabel="Left"
            rightLabel="Right"
            isActive={sidebarPosition}
            onChange={handleSidebarPositionChange}
            name="sidebarPosition"
            leftValue="left"
            rightValue="right"
          />
          <p className="config-helper-text">
            Choose whether the sidebar appears on the left or right side of the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSettings;

