// src/components/CodeSkeleton/CodeSkeletonConfig.jsx
// -----------------------------------------------------------------------------
//  - Settings drawer for the Code Skeleton Generator tool
//  - Handles language, template type, options, and preset loading
// -----------------------------------------------------------------------------

import React, { useState } from 'react';
import './CodeSkeleton.css';
import { languages, getTemplateTypes, getProperName } from './utils/languageUtils';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';

const CodeSkeletonConfig = ({
  /* props from parent */
  configMode, setConfigMode,
  language, setLanguage,
  templateType, setTemplateType,
  options, setOptions,
  presetTemplates
}) => {
  /* ------------------------------------------------------------------------- */
  /* State for UI interaction                                                  */
  /* ------------------------------------------------------------------------- */
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  /* ------------------------------------------------------------------------- */
  /* Helper functions                                                          */
  /* ------------------------------------------------------------------------- */
  const updateOption = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const getLanguageName = (langId) => {
    const lang = languages.find(l => l.id === langId);
    return lang ? lang.name : langId;
  };
  
  // Filter templates by category and search query
  const filterTemplates = () => {
    return presetTemplates.filter(template => {
      const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
      const matchesSearch = searchQuery === '' || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  };
  
  // Get unique categories from templates
  const getCategories = () => {
    const categories = ['all'];
    presetTemplates.forEach(template => {
      if (template.category && !categories.includes(template.category)) {
        categories.push(template.category);
      }
    });
    return categories;
  };

  /* ------------------------------------------------------------------------- */
  /* UI Rendering                                                              */
  /* ------------------------------------------------------------------------- */
  return (
    <div className="code-skeleton-config">
      <h3 className="config-section-title">Code Skeleton Settings</h3>
      
      {/* Mode Toggle Switch */}
      <StandardToggleSwitch
        leftLabel="Simple"
        rightLabel="Advanced"
        isActive={configMode}
        onChange={setConfigMode}
        name="configMode"
        leftValue="simple"
        rightValue="advanced"
      />
      
      {/* Preset Templates - with search and categories */}
      <div className="form-group preset-section">
        <label className="preset-label">Preset Templates</label>
        <p className="helper-text">Choose a preset to quickly configure common templates</p>
        
        {/* Search and Filter UI */}
        <div className="preset-filters">
          <input
            type="text"
            className="preset-search"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <div className="preset-categories">
            {getCategories().map(category => (
              <button
                key={category}
                className={`category-btn ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Template Cards */}
        <div className="preset-cards">
          {filterTemplates().map((template, index) => (
            <div 
              key={`${template.id}-${index}`}
              className="preset-card"
              onClick={() => {
                if (template.language && template.language !== language) {
                  setLanguage(template.language);
                }
                setTemplateType(template.id);
                if (template.options) {
                  setOptions(prev => ({...prev, ...template.options}));
                }
              }}
            >
              <div className="preset-card-header">
                <h4 className="preset-name">{template.name}</h4>
                <span className="preset-language">{getLanguageName(template.language)}</span>
              </div>
              <p className="preset-description">{template.description}</p>
              <div className="preset-footer">
                <span className="preset-category">{template.category}</span>
              </div>
            </div>
          ))}
          {filterTemplates().length === 0 && (
            <div className="no-results">
              <p>No templates match your search criteria.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Language and Template Type */}
      <div className="settings-group">
        <h4 className="settings-group-title">Language & Template</h4>
        
        <div className="form-group">
          <label className="required">Programming Language</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="language-select"
          >
            {languages.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
          <p className="helper-text">Determines available template types and syntax</p>
        </div>

        <div className="form-group">
          <label className="required">Template Type</label>
          <select
            value={templateType}
            onChange={e => setTemplateType(e.target.value)}
            className="template-select"
          >
            {getTemplateTypes(language).map(template => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
          <p className="helper-text">Type of code structure to generate</p>
        </div>
      </div>
      
      {/* Name Input */}
      <div className="form-group">
        <label className="required">
          {templateType === 'function' || templateType === 'hook' ? 'Function Name' : 
          templateType === 'api' || templateType === 'controller' ? 'API Name' : 'Class Name'}
        </label>
        <input
          type="text"
          value={getProperName(templateType, options)}
          onChange={e => {
            if (templateType === 'function' || templateType === 'hook') {
              updateOption('functionName', e.target.value);
            } else if (templateType === 'api' || templateType === 'controller') {
              updateOption('apiName', e.target.value);
            } else {
              updateOption('className', e.target.value);
            }
          }}
          placeholder={templateType === 'function' || templateType === 'hook' ? 'myFunction' : 
                      templateType === 'api' || templateType === 'controller' ? 'myApi' : 'MyComponent'}
          className="name-input"
        />
        <p className="helper-text">
          {templateType === 'function' || templateType === 'hook' 
            ? 'Use camelCase (e.g., myFunction)' 
            : templateType === 'component' || templateType === 'class'
              ? 'Use PascalCase (e.g., MyComponent)'
              : 'Name for the API endpoint or controller'}
        </p>
      </div>

      {/* Common Options */}
      <div className="settings-group">
        <h4 className="settings-group-title">Code Generation Options</h4>
        
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="config-include-comments" 
            checked={options.includeComments}
            onChange={e => updateOption('includeComments', e.target.checked)}
          />
          <label htmlFor="config-include-comments">Include Comments</label>
          <div className="code-skeleton-tooltip">
            <span className="tooltip-icon">?</span>
            <span className="tooltip-text">Add helpful comments to explain the code structure</span>
          </div>
        </div>
          
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="config-include-tests" 
            checked={options.includeTests}
            onChange={e => updateOption('includeTests', e.target.checked)}
          />
          <label htmlFor="config-include-tests">Include Tests</label>
          <div className="code-skeleton-tooltip">
            <span className="tooltip-icon">?</span>
            <span className="tooltip-text">Generate test skeleton for the code</span>
          </div>
        </div>
          
        {(language === 'typescript' || language === 'javascript') && (
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="config-include-type-info" 
              checked={options.includeTypeInfo}
              onChange={e => updateOption('includeTypeInfo', e.target.checked)}
            />
            <label htmlFor="config-include-type-info">Include Type Information</label>
            <div className="code-skeleton-tooltip">
              <span className="tooltip-icon">?</span>
              <span className="tooltip-text">Add TypeScript type definitions or JSDoc annotations</span>
            </div>
          </div>
        )}
      </div>

      {/* Language-specific Options */}
      {configMode === 'advanced' && (
        <div className="settings-group">
          <h4 className="settings-group-title">Language-specific Options</h4>
          
          {language === 'java' && (
            <div className="form-group">
              <label>Package Name</label>
              <input
                type="text"
                value={options.packageName}
                onChange={e => updateOption('packageName', e.target.value)}
                placeholder="com.example.myapp"
                className="name-input"
              />
              <p className="helper-text">Java package for the generated class</p>
            </div>
          )}

          {language === 'csharp' && (
            <div className="form-group">
              <label>Namespace</label>
              <input
                type="text"
                value={options.namespace}
                onChange={e => updateOption('namespace', e.target.value)}
                placeholder="MyApp"
                className="name-input"
              />
              <p className="helper-text">C# namespace for the generated code</p>
            </div>
          )}

          {/* Author Information */}
          <div className="form-group">
            <label>Author Name</label>
            <input
              type="text"
              value={options.authorName}
              onChange={e => updateOption('authorName', e.target.value)}
              placeholder="Your name (optional)"
              className="name-input"
            />
            <p className="helper-text">Will be included in file header comments if provided</p>
          </div>
        </div>
      )}
      
      {/* TypeScript Types - Advanced Only */}
      {configMode === 'advanced' && language === 'typescript' && (
        <div className="settings-group">
          <h4 className="settings-group-title">TypeScript Types Reference</h4>
          <div className="type-reference">
            <div className="type-card">
              <code>string</code>
              <span>Text data</span>
            </div>
            <div className="type-card">
              <code>number</code>
              <span>Numeric values</span>
            </div>
            <div className="type-card">
              <code>boolean</code>
              <span>True/false values</span>
            </div>
            <div className="type-card">
              <code>any</code>
              <span>Any type (avoid when possible)</span>
            </div>
            <div className="type-card">
              <code>unknown</code>
              <span>Type-safe alternative to any</span>
            </div>
            <div className="type-card">
              <code>Record&lt;K,V&gt;</code>
              <span>Object with keys K and values V</span>
            </div>
            <div className="type-card">
              <code>Array&lt;T&gt;</code>
              <span>Array of type T</span>
            </div>
            <div className="type-card">
              <code>T[]</code>
              <span>Alternative array syntax</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeSkeletonConfig;