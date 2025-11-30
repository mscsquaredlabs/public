// XmlValidator.jsx
// XML Validator component with tabbed interface

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import XmlValidatorTab from './XmlValidatorTab';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import './XmlValidator.css';

const STORAGE_KEY = 'atf-dev-studio-xml-validator';
const DEFAULT_TAB_TITLE = 'XML Validator';

const XmlValidator = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [validators, setValidators] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [validatorStyle, setValidatorStyle] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const hasAutoCreatedRef = useRef(false);

  // Generate color for modern style validators
  const generateModernColor = useCallback((index) => {
    const colors = [
      '#4f46e5', // indigo
      '#7c3aed', // violet
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // emerald
      '#3b82f6', // blue
      '#ef4444', // red
      '#14b8a6', // teal
      '#8b5cf6', // purple
      '#f97316', // orange
    ];
    return colors[index % colors.length];
  }, []);

  // Hide results area when component mounts and restore when it unmounts
  useEffect(() => {
    hideResultsArea();
    return () => {
      restoreResultsArea();
    };
  }, []);

  // Load saved validators and preferences from localStorage
  useEffect(() => {
    try {
      const savedValidators = localStorage.getItem(STORAGE_KEY);
      if (savedValidators) {
        const parsedValidators = JSON.parse(savedValidators);
        setValidators(parsedValidators);
        
        // Set active tab to the first validator or the last active one
        if (parsedValidators.length > 0) {
          const lastActive = parsedValidators.find(v => v.isActive) || parsedValidators[0];
          setActiveTabId(lastActive.id);
        }
      }

      // Load preferences
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.validatorStyle) setValidatorStyle(prefs.validatorStyle);
      }
    } catch (error) {
      console.error('Error loading validators:', error);
    }
  }, []);

  // Save validators to localStorage whenever they change
  useEffect(() => {
    if (validators.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validators));
        } catch (error) {
          console.error('Error saving validators to storage:', error);
        }
      };
      
      // Debounce saving to localStorage
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [validators]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        validatorStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [validatorStyle]);

  // Automatically create one validator tab when component mounts if none exist
  useEffect(() => {
    if (hasAutoCreatedRef.current) return;
    
    const savedValidators = localStorage.getItem(STORAGE_KEY);
    if (savedValidators && JSON.parse(savedValidators).length > 0) {
      hasAutoCreatedRef.current = true;
      return;
    }
    
    hasAutoCreatedRef.current = true;
    
    setTimeout(() => {
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      const currentStyle = savedPrefs ? JSON.parse(savedPrefs).validatorStyle || 'simple' : 'simple';
      
      const headerColor = currentStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      
      const newValidator = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        xmlInput: '',
        validationMode: 'syntax',
        indentSpaces: 2,
        strictValidation: false,
        validateDtd: false,
        inputType: 'direct',
        isFormatted: false,
        results: {
          status: '',
          message: '',
          details: '',
          content: ''
        },
        headerColor: headerColor,
        style: currentStyle,
        isActive: true,
      };
      
      setValidators([newValidator]);
      setActiveTabId(newValidator.id);
    }, 100);
  }, [generateModernColor]);

  // Create a new validator tab
  const createValidator = useCallback(() => {
    const headerColor = validatorStyle === 'modern' ? generateModernColor(validators.length) : '#4f46e5';
    
    const newValidator = {
      id: uuidv4(),
      title: `${DEFAULT_TAB_TITLE} ${validators.length + 1}`,
      xmlInput: '',
      validationMode: 'syntax',
      indentSpaces: 2,
      strictValidation: false,
      validateDtd: false,
      inputType: 'direct',
      isFormatted: false,
      results: {
        status: '',
        message: '',
        details: '',
        content: ''
      },
      headerColor: headerColor,
      style: validatorStyle,
      isActive: false,
    };
    
    // Mark all existing validators as inactive and set new one as active
    const updatedValidators = validators.map(v => ({ ...v, isActive: false }));
    updatedValidators.push({ ...newValidator, isActive: true });
    
    setValidators(updatedValidators);
    setActiveTabId(newValidator.id);
    showStatusMessage(setStatusMessage, 'New XML validator tab created', statusTimeoutRef);
  }, [validators, validatorStyle, generateModernColor]);

  // Update a validator's properties
  const updateValidator = useCallback((id, updates) => {
    setValidators(validators => validators.map(validator => 
      validator.id === id ? { ...validator, ...updates } : validator
    ));
  }, []);

  // Delete a validator tab
  const deleteValidator = useCallback((id) => {
    const updatedValidators = validators.filter(validator => validator.id !== id);
    
    // If we deleted the active tab, activate another one
    if (id === activeTabId) {
      if (updatedValidators.length > 0) {
        const newActiveId = updatedValidators[0].id;
        setActiveTabId(newActiveId);
        setValidators(updatedValidators.map((v, index) => ({
          ...v,
          isActive: index === 0
        })));
      } else {
        // If no tabs remain, create a new one automatically
        const headerColor = validatorStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
        const newValidator = {
          id: uuidv4(),
          title: `${DEFAULT_TAB_TITLE} 1`,
          xmlInput: '',
          validationMode: 'syntax',
          indentSpaces: 2,
          strictValidation: false,
          validateDtd: false,
          inputType: 'direct',
          isFormatted: false,
          results: {
            status: '',
            message: '',
            details: '',
            content: ''
          },
          headerColor: headerColor,
          style: validatorStyle,
          isActive: true,
        };
        setValidators([newValidator]);
        setActiveTabId(newValidator.id);
        showStatusMessage(setStatusMessage, 'New XML validator tab created automatically', statusTimeoutRef);
        return;
      }
    } else {
      setValidators(updatedValidators);
    }
    
    showStatusMessage(setStatusMessage, 'XML validator tab closed', statusTimeoutRef);
  }, [validators, activeTabId, validatorStyle, generateModernColor]);

  // Switch to a different tab
  const switchTab = useCallback((id) => {
    setActiveTabId(id);
    setValidators(validators => validators.map(validator => ({
      ...validator,
      isActive: validator.id === id
    })));
  }, []);

  // Clear all validators (with confirmation)
  const clearAllValidators = useCallback(() => {
    if (validators.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all XML validator tabs? A new tab will be created automatically.')) {
      localStorage.removeItem(STORAGE_KEY);
      
      const headerColor = validatorStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      const newValidator = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        xmlInput: '',
        validationMode: 'syntax',
        indentSpaces: 2,
        strictValidation: false,
        validateDtd: false,
        inputType: 'direct',
        isFormatted: false,
        results: {
          status: '',
          message: '',
          details: '',
          content: ''
        },
        headerColor: headerColor,
        style: validatorStyle,
        isActive: true,
      };
      setValidators([newValidator]);
      setActiveTabId(newValidator.id);
      showStatusMessage(setStatusMessage, 'All tabs closed, new tab created', statusTimeoutRef);
    }
  }, [validators.length, validatorStyle, generateModernColor]);

  // Update preferences
  const updatePreferences = useCallback((prefs) => {
    if (prefs.validatorStyle !== undefined) {
      setValidatorStyle(prefs.validatorStyle);
      // Update existing validators with new style colors
      if (prefs.validatorStyle === 'modern') {
        setValidators(validators => validators.map((validator, index) => ({
          ...validator,
          style: 'modern',
          headerColor: generateModernColor(index)
        })));
      } else {
        setValidators(validators => validators.map(validator => ({
          ...validator,
          style: 'simple',
          headerColor: '#4f46e5'
        })));
      }
    }
    showStatusMessage(setStatusMessage, 'Settings updated', statusTimeoutRef);
  }, [generateModernColor]);

  const activeValidator = validators.find(v => v.id === activeTabId);

  return (
    <div className={`xml-validator-container ${dashboardDarkMode ? 'dark-mode' : ''} ${validatorStyle === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="xml-validator-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-validator-button"
            onClick={createValidator}
            title="Create a new XML validator tab"
          >
            + New Validator
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={validatorStyle}
              onChange={(value) => {
                setValidatorStyle(value);
                updatePreferences({ validatorStyle: value });
              }}
              name="validatorStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {validators.length > 0 && (
            <button
              className="secondary-button clear-all-button"
              onClick={clearAllValidators}
              title="Close all XML validator tabs (with confirmation)"
            >
              Close All Tabs
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {validators.length > 0 && (
        <div className="validator-tabs-container">
          <div className="validator-tabs">
            {validators.map((validator, index) => (
              <div
                key={validator.id}
                className={`validator-tab ${validator.id === activeTabId ? 'active' : ''}`}
                onClick={() => switchTab(validator.id)}
                style={{
                  borderTopColor: validator.id === activeTabId ? validator.headerColor : 'transparent'
                }}
              >
                <span className="tab-title">{validator.title}</span>
                <button
                  className="tab-close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteValidator(validator.id);
                  }}
                  title="Close tab"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validator Content Area */}
      <div className="xml-validator-area" onClick={() => {
        if (validators.length === 0) {
          createValidator();
        }
      }}>
        {activeValidator ? (
          <XmlValidatorTab
            validator={activeValidator}
            updateValidator={updateValidator}
            deleteValidator={deleteValidator}
            setStatusMessage={(message) => showStatusMessage(setStatusMessage, message, statusTimeoutRef)}
            darkMode={dashboardDarkMode}
            validatorStyle={activeValidator.style || validatorStyle}
            headerColor={activeValidator.headerColor}
          />
        ) : (
          <div className="empty-state" style={{ cursor: 'pointer' }}>
            <p>No validator tabs yet. Click here or "New Validator" to create one.</p>
            <p className="hint">Validate, format, minify, and convert XML to JSON, YAML, or HTML forms.</p>
          </div>
        )}
      </div>

      {/* Status message - fixed position, bottom right */}
      {statusMessage && (
        <div className="status-message">
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default XmlValidator;
