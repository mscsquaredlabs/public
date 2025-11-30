// CheatSheetTab.jsx
// Tab content for cheat sheet categories

import { useState, useEffect, useCallback } from 'react';

const CheatSheetTab = ({
  categoryId,
  cheatSheetItems,
  updateCategoryId,
  setStatusMessage,
  darkMode,
  cheatStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const [activeItem, setActiveItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [copied, setCopied] = useState(null);

  const categoryItems = cheatSheetItems[categoryId] || [];

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('cheat-sheet-favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('cheat-sheet-favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites]);

  // Set initial active item when category changes
  useEffect(() => {
    const items = categoryItems;
    if (items.length > 0) {
      setActiveItem(items[0]);
    } else {
      setActiveItem(null);
    }
  }, [categoryId, categoryItems]);

  // Toggle favorite status for an item
  const toggleFavorite = useCallback((item) => {
    setFavorites(prev => {
      const isFavorite = prev.some(f => f.id === item.id);
      if (isFavorite) {
        return prev.filter(f => f.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  }, []);

  // Check if an item is in favorites
  const isFavorite = useCallback((item) => {
    return favorites.some(f => f.id === item.id);
  }, [favorites]);

  // Get filtered items based on search, favorites
  const getFilteredItems = useCallback(() => {
    let items = [];
    
    if (showFavorites) {
      items = favorites.filter(f => categoryItems.some(ci => ci.id === f.id));
    } else {
      items = categoryItems;
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return items.filter(
        item => 
          item.name.toLowerCase().includes(term) || 
          item.description.toLowerCase().includes(term) ||
          (item.syntax && item.syntax.toLowerCase().includes(term)) || 
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    return items;
  }, [categoryItems, searchTerm, showFavorites, favorites]);

  // Copy code to clipboard
  const copyToClipboard = useCallback((text, itemId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(itemId);
      setTimeout(() => setCopied(null), 2000);
      setStatusMessage?.('Code copied to clipboard');
    }).catch(err => {
      setStatusMessage?.(`Failed to copy to clipboard: ${err.message}`);
    });
  }, [setStatusMessage]);

  // Handle item selection
  const selectItem = useCallback((item) => {
    setActiveItem(item);
    setStatusMessage?.(`Selected ${item.name}`);
  }, [setStatusMessage]);

  const filteredItems = getFilteredItems();

  return (
    <div className={`cheat-sheet-tab-content ${cheatStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* Options Section */}
      {cheatStyle === 'modern' && (
        <div className="cheat-sheet-options-section">
          <div className="options-row">
            <div className="option-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search cheat sheets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="option-group">
              <label>Filter</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={showFavorites}
                    onChange={(e) => setShowFavorites(e.target.checked)}
                  />
                  <span>Show Favorites Only</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Browser container */}
      <div className="cheat-sheet-browser-container">
        <div className="cheat-sheet-browser">
          <div className="cheat-list">
            <div className="cheat-list-header">
              <h3>{showFavorites ? 'Favorites' : 'Cheat Sheets'}</h3>
              
              {cheatStyle === 'modern' && (
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              )}
            </div>
            
            <div className="cheat-items-list">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <div
                    key={item.id}
                    className={`cheat-item ${activeItem?.id === item.id ? 'active' : ''}`}
                    onClick={() => selectItem(item)}
                  >
                    <div className="cheat-item-content">
                      <div className="cheat-item-header">
                        <div className="cheat-item-name">{item.name}</div>
                        {cheatStyle === 'modern' && (
                          <button 
                            className={`favorite-button ${isFavorite(item) ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item);
                            }}
                            title={isFavorite(item) ? "Remove from favorites" : "Add to favorites"}
                          >
                            {isFavorite(item) ? '★' : '☆'}
                          </button>
                        )}
                      </div>
                      <div className="cheat-item-description">{item.description}</div>
                      {item.shortcut && (
                        <div className="cheat-item-shortcut">{item.shortcut}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-cheat-list">
                  {searchTerm 
                    ? `No items found matching "${searchTerm}"`
                    : showFavorites 
                      ? "No favorites yet. Add some by clicking the star icon!" 
                      : "No items available in this category"}
                </div>
              )}
            </div>
          </div>

          <div className="cheat-preview">
            {activeItem ? (
              <>
                <div className="cheat-preview-header">
                  <div className="preview-title">
                    <span className="preview-name">{activeItem.name}</span>
                    <span className="preview-context">{activeItem.context}</span>
                  </div>
                  {cheatStyle === 'modern' && (
                    <div className="preview-actions">
                      <button 
                        className={`favorite-button-large ${isFavorite(activeItem) ? 'active' : ''}`}
                        onClick={() => toggleFavorite(activeItem)}
                        title={isFavorite(activeItem) ? "Remove from favorites" : "Add to favorites"}
                      >
                        {isFavorite(activeItem) ? '★ Remove Favorite' : '☆ Add Favorite'}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="cheat-content">
                  <div className="cheat-description">
                    {activeItem.description}
                  </div>
                  
                  {activeItem.shortcut && (
                    <div className="cheat-shortcut-display">
                      <span className="shortcut-label">Shortcut:</span>
                      <span className="shortcut-keys">{activeItem.shortcut}</span>
                    </div>
                  )}
                  
                  {activeItem.syntax && (
                    <div className="cheat-syntax">
                      <div className="syntax-header">
                        <span>Syntax / Example</span>
                        <button 
                          className={`copy-button ${copied === activeItem.id ? 'copied' : ''}`}
                          onClick={() => copyToClipboard(activeItem.syntax, activeItem.id)}
                        >
                          {copied === activeItem.id ? '✓ Copied!' : '📋 Copy Code'}
                        </button>
                      </div>
                      <pre className="syntax-code">{activeItem.syntax}</pre>
                    </div>
                  )}
                  
                  {activeItem.tags && activeItem.tags.length > 0 && (
                    <div className="cheat-tags">
                      {activeItem.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="tag"
                          onClick={() => setSearchTerm(tag)}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-preview">
                <p>Select a cheat sheet item to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheatSheetTab;

