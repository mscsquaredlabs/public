// StandardToggleSwitch.jsx
// A reusable toggle switch component used across the application
import React from 'react';
import './StandardToggleSwitch.css';

const StandardToggleSwitch = ({
  leftLabel,
  rightLabel,
  isActive,
  onChange,
  name,
  leftValue,
  rightValue
}) => {
  const handleChange = () => {
    // Toggle between left and right values
    const newValue = isActive === leftValue ? rightValue : leftValue;
    onChange(newValue);
  };

  return (
    <div className="toggle-switch-container">
      <div className="toggle-switch-labels">
        <span 
          className={`toggle-label ${isActive === leftValue ? 'active' : ''}`}
          onClick={() => onChange(leftValue)}
        >
          {leftLabel}
        </span>
        <div className="toggle-switch-wrapper">
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={isActive === rightValue}
              onChange={handleChange}
              name={name}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <span 
          className={`toggle-label ${isActive === rightValue ? 'active' : ''}`}
          onClick={() => onChange(rightValue)}
        >
          {rightLabel}
        </span>
      </div>
    </div>
  );
};

export default StandardToggleSwitch;