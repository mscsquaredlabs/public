import React from 'react';
import './StandardToggleSwitch.css';

const StandardToggleSwitch = ({ 
  leftLabel = 'Simple', 
  rightLabel = 'Advanced', 
  isActive = false, 
  onChange = () => {},
  name = '',
  leftValue = 'simple',
  rightValue = 'advanced'
}) => {
  // Instead of maintaining internal state, use the passed value directly
  // This ensures the component stays in sync with the parent's state
  const active = isActive === true || isActive === rightValue;
  
  const handleToggle = () => {
    // Determine the new value based on current state
    let newValue;
    
    // Handle both boolean and string modes
    if (typeof isActive === 'boolean') {
      newValue = !isActive;
    } else {
      newValue = isActive === leftValue ? rightValue : leftValue;
    }
    
    onChange(newValue);
  };
  
  return (
    <div className="standard-toggle-container">
      <span className={`mode-label ${!active ? 'active' : ''}`}>{leftLabel}</span>
      <label className="toggle-switch">
        <input 
          type="checkbox" 
          checked={active}
          onChange={handleToggle}
          name={name}
        />
        <span className="toggle-slider"></span>
      </label>
      <span className={`mode-label ${active ? 'active' : ''}`}>{rightLabel}</span>
    </div>
  );
};

export default StandardToggleSwitch;