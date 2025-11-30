// ViewWindow.jsx
// Draggable folder view window with folder contents monitoring

import { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { fetchFolderContents, formatFileSize, formatDate, getFileIcon } from '../../shared/utils/viewsUtils';

const ViewWindow = ({
  view,
  updateView,
  deleteView,
  bringToFront,
  containerRef,
  setStatusMessage,
  darkMode,
  viewStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    folderPath,
    position,
    size,
    isMinimized,
    zIndex,
    contents,
    lastUpdated,
  } = view;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const rndRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (isMinimized) {
      // Don't refresh when minimized
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    let isMounted = true;
    let refreshInProgress = false;

    const refreshContents = async () => {
      // Prevent concurrent refreshes
      if (refreshInProgress) return;
      
      refreshInProgress = true;
      setIsRefreshing(true);
      
      try {
        const data = await fetchFolderContents(folderPath);
        if (isMounted) {
          updateView(id, {
            contents: data.contents,
            lastUpdated: new Date().toISOString(),
          });
          setError(null);
        }
      } catch (err) {
        console.error(`Error refreshing folder ${folderPath}:`, err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        refreshInProgress = false;
        if (isMounted) {
          setIsRefreshing(false);
        }
      }
    };

    // Initial load
    refreshContents();

    // Set up interval for auto-refresh (30 seconds = 30000ms)
    refreshIntervalRef.current = setInterval(() => {
      refreshContents();
    }, 30000);

    return () => {
      isMounted = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [folderPath, id, isMinimized, updateView]);

  // Manual refresh handler
  const handleRefresh = async () => {
    if (isLoading || isRefreshing) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchFolderContents(folderPath);
      updateView(id, {
        contents: data.contents,
        lastUpdated: new Date().toISOString(),
      });
      setStatusMessage?.(`Refreshed: ${title}`);
    } catch (err) {
      console.error(`Error refreshing folder ${folderPath}:`, err);
      setError(err.message);
      setStatusMessage?.(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const WindowBody = (
    <div
      className={`view-window ${isMinimized ? 'minimized' : ''} ${darkMode ? 'dark-mode' : ''} ${viewStyle === 'modern' ? 'modern-style' : ''}`}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Header */}
      <div
        className={`view-header ${viewStyle === 'modern' ? 'modern-style' : 'simple-style'}`}
        style={{ backgroundColor: headerColor }}
        onDoubleClick={() => updateView(id, { isMinimized: !isMinimized })}
      >
        <div className="view-title">
          <span className="title-text">{title}</span>
          {isRefreshing && <span className="refresh-indicator" title="Refreshing...">⟳</span>}
        </div>
        <div className="view-controls">
          {lastUpdated && (
            <span className="last-updated" title={`Last updated: ${formatDate(lastUpdated)}`}>
              {formatDate(lastUpdated)}
            </span>
          )}
          <button
            className="refresh-button"
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            disabled={isLoading || isRefreshing}
            title="Refresh folder contents"
          >
            ⟳
          </button>
          <button
            className="minimize-button"
            onClick={(e) => {
              e.stopPropagation();
              updateView(id, { isMinimized: !isMinimized });
            }}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '□' : '−'}
          </button>
          <button
            className="close-button"
            onClick={(e) => {
              e.stopPropagation();
              deleteView(id);
            }}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="view-content">
          {error && (
            <div className="view-error">
              <span className="error-icon">⚠️</span>
              <span className="error-message">{error}</span>
              <button className="retry-button" onClick={handleRefresh}>
                Retry
              </button>
            </div>
          )}
          
          {isLoading && !contents && (
            <div className="view-loading">
              <span>Loading folder contents...</span>
            </div>
          )}

          {contents && contents.length === 0 && !isLoading && (
            <div className="view-empty">
              <span>Folder is empty</span>
            </div>
          )}

          {contents && contents.length > 0 && (
            <div className="view-contents-list">
              {contents.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className={`view-item ${item.isDirectory ? 'directory' : 'file'}`}
                  title={`${item.isDirectory ? 'Directory' : 'File'}: ${item.name}${item.size ? ` (${formatFileSize(item.size)})` : ''}`}
                >
                  <span className="item-icon">{getFileIcon(item.extension, item.isDirectory)}</span>
                  <span className="item-name">{item.name}</span>
                  {item.size && (
                    <span className="item-size">{formatFileSize(item.size)}</span>
                  )}
                  {item.modified && (
                    <span className="item-modified">{formatDate(item.modified)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Rnd
      ref={rndRef}
      position={{ x: position.x, y: position.y }}
      size={{ width: size.width, height: isMinimized ? 40 : size.height }}
      style={{ zIndex, position: 'absolute' }}
      minWidth={300}
      minHeight={40}
      bounds="parent"
      enableResizing={!isMinimized}
      onMouseDown={() => bringToFront(id)}
      onDragStart={() => bringToFront(id)}
      onDragStop={(e, d) => updateView(id, { position: { x: d.x, y: d.y } })}
      onResizeStop={(e, dir, ref, delta, pos) => {
        updateView(id, {
          size: { width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) },
          position: { x: pos.x, y: pos.y },
        });
      }}
    >
      {WindowBody}
    </Rnd>
  );
};

export default ViewWindow;

