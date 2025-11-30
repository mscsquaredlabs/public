// src/components/SqlFormatter/SqlFormatterConfig.jsx
// -----------------------------------------------------------------------------
//  ‑ Settings drawer for the SQL Formatter tool
//  ‑ Handles dialect, indent, uppercase, LBQ, plus sample buttons
// -----------------------------------------------------------------------------

import React, { useEffect, useState } from 'react';
import './SqlFormatter.css';
import { ALL_SAMPLES } from './CreateTableSample';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';

const SqlFormatterConfig = ({
  /*  props from parent  */
  configMode, setConfigMode,
  sqlDialect, setSqlDialect,
  formatOptions, setFormatOptions,
  loadSample, inputType,
  simpleSqlSample, complexSqlSample
}) => {
  const [showTableSamples, setShowTableSamples] = useState(false);

  /* ------------------------------------------------------------------------- */
  /* helpers                                                                   */
  /* ------------------------------------------------------------------------- */
  const change = (key, value) =>
    setFormatOptions(prev => ({ ...prev, [key]: value }));

  /* keep dialect in sync with formatter ------------------------------------- */
  useEffect(() => {
    if (formatOptions.language !== sqlDialect) {
      setFormatOptions(prev => ({ ...prev, language: sqlDialect }));
    }
  }, [sqlDialect]); // eslint‑disable‑line react-hooks/exhaustive-deps

  /* ------------------------------------------------------------------------- */
  /* UI                                                                        */
  /* ------------------------------------------------------------------------- */
  return (
    <div className="sql-formatter-config">
      <h3 className="config-section-title">
        {inputType === 'sql'
          ? 'SQL Formatter Settings'
          : `${inputType.toUpperCase()} → SQL Conversion Settings`}
      </h3>

      {/* mode toggle (simple / advanced) – SQL only -------------------------- */}
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

      {/* dialect selector ---------------------------------------------------- */}
      <div className="form-group">
        <label>Target SQL Dialect</label>
        <select
          value={sqlDialect}
          onChange={e => setSqlDialect(e.target.value)}
        >
          <option value="sql">Standard SQL</option>
          <option value="mysql">MySQL</option>
          <option value="postgresql">PostgreSQL</option>
          <option value="tsql">T‑SQL (SQL Server)</option>
          <option value="plsql">PL/SQL (Oracle)</option>
          <option value="db2">DB2</option>
          <option value="mariadb">MariaDB</option>
          <option value="redshift">Redshift</option>
          <option value="spark">Spark SQL</option>
        </select>
      </div>

      {/* advanced formatting controls (SQL only) ----------------------------- */}
      {inputType === 'sql' && configMode === 'advanced' && (
        <>
          {/* indent ---------------------------------------------------------- */}
          <div className="form-group">
            <label>Indentation</label>
            <select
              value={formatOptions.indent === '\t' ? 'tab' : formatOptions.indent}
              onChange={e =>
                change('indent', e.target.value === 'tab' ? '\t' : e.target.value)
              }
            >
              <option value="  ">2 Spaces</option>
              <option value="    ">4 Spaces</option>
              <option value="tab">Tab</option>
            </select>
          </div>

          {/* uppercase ------------------------------------------------------- */}
          <div className="form-group checkbox-group">
            <input
              id="uppercase"
              type="checkbox"
              checked={formatOptions.uppercase}
              onChange={e => change('uppercase', e.target.checked)}
            />
            <label htmlFor="uppercase">Upper‑case keywords</label>
          </div>

          {/* lines between queries ------------------------------------------- */}
          <div className="form-group">
            <label>Lines between queries</label>
            <select
              value={formatOptions.linesBetweenQueries}
              onChange={e => change('linesBetweenQueries', +e.target.value)}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
        </>
      )}

      {/* sample buttons ------------------------------------------------------- */}
      <div className="form-group">
        <label>Load SQL Sample</label><br />
        <button className="config-sample-btn" onClick={() => loadSample(simpleSqlSample)}>
          Simple Query
        </button>
        <button className="config-sample-btn" onClick={() => loadSample(complexSqlSample)}>
          Complex Query
        </button>
      </div>

      {/* CREATE TABLE sample buttons ----------------------------------------- */}
      {inputType === 'sql' && (
        <div className="form-group">
          <div className="sample-group-header" onClick={() => setShowTableSamples(!showTableSamples)}>
            <label>Table Structure Samples</label>
            <span className="toggle-arrow">{showTableSamples ? '▼' : '▶'}</span>
          </div>
          
          {showTableSamples && (
            <div className="table-samples">
              <p className="sample-description">
                Load sample CREATE TABLE statements to test the table structure visualizer:
              </p>
              <div className="table-sample-buttons">
                {ALL_SAMPLES.map((sample, index) => (
                  <button 
                    key={index}
                    className="config-sample-btn table-sample-btn" 
                    onClick={() => loadSample(sample.value)}
                    title={sample.description}
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SqlFormatterConfig;