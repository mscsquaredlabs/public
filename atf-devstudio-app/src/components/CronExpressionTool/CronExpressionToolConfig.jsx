// CronExpressionToolConfig.jsx
// Configuration panel for the Cron Expression Tool component

import React from 'react';
import './CronExpressionTool.css';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';


const CronExpressionToolConfig = ({
  configMode, setConfigMode,
  history, loadFromHistory,
  commonExpressions, loadCommonExpression
}) => {
  // Cron resources for users to learn more
  const resources = [
    {
      name: "Crontab Guru",
      url: "https://crontab.guru/"
    },
    {
      name: "Cron Job Expression Explained",
      url: "https://www.netiq.com/documentation/cloud-manager-2-5/ncm-reference/data/bexyssf.html"
    },
    {
      name: "Crontab - Quick Reference",
      url: "https://www.adminschoice.com/crontab-quick-reference"
    }
  ];

  return (
    <>
      <h3 className="config-section-title">Cron Expression Settings</h3>

        {/* Toggle switch */}
        <StandardToggleSwitch 
        leftLabel="Simple" 
        rightLabel="Advanced" 
        isActive={configMode}  // Pass the actual configMode value
        onChange={(value) => setConfigMode(value)} // This will receive 'simple' or 'advanced'
        name="configMode"
        leftValue="simple"
        rightValue="advanced"
      />

      {/* Common Expressions - Visible in both modes */}
      <div className="form-group">
        <h4 className="section-title">Common Expressions</h4>
        <div className="common-expressions-list">
          {commonExpressions.map((expression, index) => (
            <div
              key={index}
              className="common-expression-item"
              onClick={() => loadCommonExpression(expression.value)}
              title={`Load expression: ${expression.value}`}
            >
              <div className="expression-value">{expression.value}</div>
              <div className="expression-label">{expression.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* History - Visible in both modes */}
      <div className="form-group">
        <h4 className="section-title">Recent Expressions</h4>
        <div className="history-list">
          {history.length > 0 ? (
            history.map((historyExpression, index) => (
              <div
                key={index}
                className="history-item"
                onClick={() => loadFromHistory(historyExpression)}
                title={`Load expression: ${historyExpression}`}
              >
                {historyExpression}
              </div>
            ))
          ) : (
            <div className="empty-history">No history yet</div>
          )}
        </div>
      </div>

      {/* Advanced Options - Only visible in advanced mode */}
      {configMode === 'advanced' && (
        <>
          <div className="form-group">
            <h4 className="section-title">Resources</h4>
            <ul className="resources-list">
              {resources.map((resource, index) => (
                <li key={index}>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" title={`Open ${resource.name} in a new tab`}>
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="form-group">
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="auto-explain"
                defaultChecked={true}
                title="Automatically explain expressions after generating"
              />
              <label htmlFor="auto-explain">Auto-explain after generating</label>
            </div>
          </div>
          
          <div className="form-group">
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="use-names"
                defaultChecked={false}
                title="Use month and day names instead of numbers"
              />
              <label htmlFor="use-names">Use month and day names</label>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CronExpressionToolConfig;