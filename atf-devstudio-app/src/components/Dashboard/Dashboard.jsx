// Updated Dashboard.jsx with dark mode support and Results Area enhancements
import { useState, useEffect, useMemo } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DashboardSettings from "./DashboardSettings";
import "./Dashboard.css";

// Helper function to convert path to title
const getTitleFromPath = (path) => {
  if (!path) return "JSON Validator";

  // Convert kebab-case to Title Case
  return path
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Sortable Category Component
const SortableCategory = ({ category, label, isCollapsed, onToggleCollapse, children, sidebarCollapsed }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`nav-category ${isDragging ? "dragging" : ""} ${isCollapsed ? "collapsed" : ""}`}
    >
      {!sidebarCollapsed && (
        <div className="category-header-wrapper">
          <div className="category-header">
            <button
              className="category-collapse-button"
              onClick={() => onToggleCollapse(category)}
              aria-label={isCollapsed ? "Expand category" : "Collapse category"}
              title={isCollapsed ? "Expand category" : "Collapse category"}
            >
              <span className="collapse-icon">{isCollapsed ? "▶" : "▼"}</span>
            </button>
            <span className="category-label">{label}</span>
            <div
              className="category-drag-handle"
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder category"
              title="Drag to reorder category"
            >
              <span className="drag-icon">☰</span>
            </div>
          </div>
        </div>
      )}
      {!isCollapsed && children}
    </div>
  );
};

// Sortable Tool Component
const SortableTool = ({ tool, category, sidebarCollapsed }) => {
  const toolId = `${category}:${tool.path}`;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: toolId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className={isDragging ? "dragging" : ""}>
      <NavLink
        to={tool.path}
        className={({ isActive }) =>
          isActive ? "sidebar-item active" : "sidebar-item"
        }
        title={tool.tooltip}
      >
        <span className="sidebar-icon">{tool.icon}</span>
        {!sidebarCollapsed && (
          <>
            <span className="sidebar-item-text">{tool.label}</span>
            <div
              className="tool-drag-handle"
              {...attributes}
              {...listeners}
              onClick={(e) => e.preventDefault()}
              aria-label="Drag to reorder tool"
              title="Drag to reorder tool"
            >
              <span className="drag-icon">☰</span>
            </div>
          </>
        )}
      </NavLink>
    </li>
  );
};

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const [dashboardStyle, setDashboardStyle] = useState('simple'); // 'simple' or 'modern'
  const [sidebarPosition, setSidebarPosition] = useState('left'); // 'left' or 'right'
  const [validationResults, setValidationResults] = useState({
    status: "", // 'success', 'error', 'warning'
    message: "",
    details: "",
    content: "",
  });
  const [resultsHeight, setResultsHeight] = useState("auto");
  const [currentTool, setCurrentTool] = useState("");
  const [prevPathRef] = useState({ current: "" });

  const [resultsMaximized, setResultsMaximized] = useState(false);

  // Drag and drop state
  const [categoryOrder, setCategoryOrder] = useState([]);
  const [toolOrder, setToolOrder] = useState({});
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [dragType, setDragType] = useState(null); // 'category' or 'tool'

  // Detect if user is on Mac for keyboard shortcuts
  const [isMac] = useState(() => {
    return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  });

  // Initialize drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const location = useLocation();
  const navigate = useNavigate();

  // Set the current tool based on the path
  useEffect(() => {
    const path = location.pathname.split("/")[1];
    setCurrentTool(path || "json-validator");
  }, [location]);

  // Effect to handle navigation between components
  useEffect(() => {
    // Clear results and reset component state when navigating
    if (location.pathname !== prevPathRef.current) {
      // Clear results area
      setValidationResults({
        status: "",
        message: "",
        details: "",
        content: "",
      });

      // Update current tool based on the path
      const path = location.pathname.split("/")[1];
      setCurrentTool(path || "json-validator");

      // Update previous path reference
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  // Effect to check system dark mode preference
  useEffect(() => {
    // Check if dark mode setting exists in local storage
    const storedDarkMode = localStorage.getItem("atf-dev-studio-dark-mode");
    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === "true");
    } else {
      // Default to dark mode (true) instead of checking system preference
      setDarkMode(true);
    }

    // Listen for changes in system dark mode preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (localStorage.getItem("atf-dev-studio-dark-mode") === null) {
        setDarkMode(e.matches);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Load dashboard style and sidebar position from localStorage
  useEffect(() => {
    const storedStyle = localStorage.getItem("atf-dev-studio-dashboard-style");
    if (storedStyle) {
      setDashboardStyle(storedStyle);
    }
    
    const storedPosition = localStorage.getItem("atf-dev-studio-sidebar-position");
    if (storedPosition) {
      setSidebarPosition(storedPosition);
    }
  }, []);

  // Effect to apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      // This ensures the dark-mode class is applied to the entire document
      document.documentElement.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
      document.documentElement.classList.remove("dark-mode");
    }

    // Save preference to localStorage
    localStorage.setItem("atf-dev-studio-dark-mode", darkMode);
  }, [darkMode]);

  // Initialize category order, tool order, and collapsed state from localStorage
  useEffect(() => {
    const storedCategoryOrder = localStorage.getItem("atf-dev-studio-category-order");
    const storedToolOrder = localStorage.getItem("atf-dev-studio-tool-order");
    const storedCollapsedCategories = localStorage.getItem("atf-dev-studio-collapsed-categories");

    if (storedCategoryOrder) {
      setCategoryOrder(JSON.parse(storedCategoryOrder));
    }
    if (storedToolOrder) {
      setToolOrder(JSON.parse(storedToolOrder));
    }
    if (storedCollapsedCategories) {
      setCollapsedCategories(JSON.parse(storedCollapsedCategories));
    }
  }, []);

  // Effect to handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only process shortcuts when results are shown
      if (!validationResults.status) return;

      // Check for modifier key + key combinations
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;

      // Copy Results: Ctrl/Cmd + Shift + C
      if (modifierKey && e.shiftKey && e.key === "C") {
        e.preventDefault();
        const copyButton = document.querySelector(".copy-results-button");
        if (copyButton) copyButton.click();
      }

      // Maximize/Minimize: Ctrl/Cmd + Shift + M
      if (modifierKey && e.shiftKey && e.key === "M") {
        e.preventDefault();
        const maximizeButton = document.querySelector(".maximize-button");
        if (maximizeButton) maximizeButton.click();
      }

      // Clear Results: Ctrl/Cmd + Shift + X
      if (modifierKey && e.shiftKey && e.key === "X") {
        e.preventDefault();
        const clearButton = document.querySelector(".clear-results-button");
        if (clearButton) clearButton.click();
      }
    };

    // Add the event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [validationResults.status, isMac]);

  // Don't auto-maximize results - let user control it manually
  // Removed auto-maximize behavior that was causing issues when loading samples

  const toggleMaximizeResults = () => {
    setResultsMaximized((prev) => !prev);
  };

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle config panel toggle
  const toggleConfigPanel = () => {
    setConfigPanelOpen(!configPanelOpen);
  };

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Handle results update from child components
  const handleResultsUpdate = (results) => {
    setValidationResults(results);
  };

  // Handle copy results to clipboard
  const handleCopyResults = () => {
    // Find the results content
    const resultsContent = document.querySelector(".result-content");
    if (resultsContent) {
      // Create a temporary element to handle HTML content
      const tempElement = document.createElement("div");
      tempElement.innerHTML = resultsContent.innerHTML;

      // Get plain text content (removes HTML tags)
      const textToCopy = tempElement.textContent || tempElement.innerText;

      // Use the Clipboard API to copy text
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          // Visual feedback for copy success
          const copyButton = document.querySelector(".copy-results-button");
          const originalText = copyButton.innerHTML;
          copyButton.innerHTML = `<span class="results-icon">✓</span><span>Copied!</span>`;

          // Reset button text after a delay
          setTimeout(() => {
            copyButton.innerHTML = `<span class="results-icon">📋</span><span>Copy Results</span>`;
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);

          // Fallback method for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = textToCopy;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        });
    }
  };

  // Removed duplicate handleMaximizeResults function - using toggleMaximizeResults instead

  // Handle clearing results
  const handleClearResults = () => {
    // Create an empty results object
    const emptyResults = {
      status: "",
      message: "",
      details: "",
      content: "",
    };

    // Update the dashboard state
    setValidationResults(emptyResults);

    // Create a custom event to notify child components
    const clearEvent = new CustomEvent("dashboard:resultsCleared", {
      detail: emptyResults,
    });
    document.dispatchEvent(clearEvent);

    // Also call the handleResultsUpdate function to ensure any subscribed components are updated
    handleResultsUpdate(emptyResults);
  };

  // Sidebar navigation items
  // Updated Dashboard.jsx with Database Client navigation item
// (This shows the specific section that needs to be updated in your existing Dashboard.jsx)

// Add this to your navItems array in Dashboard.jsx:

const navItems = [
  // Utilities (moved to top)
  {
    path: "mems",
    label: "Mems",
    icon: "📋",
    category: "utilities",
    tooltip: "Manage and store code snippets",
  },
  {
    path: "terms",
    label: "Terms",
    icon: "💻",
    category: "utilities",
    tooltip: "Terminal sessions for command line operations",
  },
  {
    path: "views",
    label: "Views",
    icon: "📁",
    category: "utilities",
    tooltip: "Monitor folder contents and changes",
  },
  {
    path: "bcrypts",
    label: "BCrypts",
    icon: "🔐",
    category: "utilities",
    tooltip: "Generate and verify BCrypt hashes",
  },
  {
    path: "code-diff-checker",
    label: "Code Diff Checker",
    icon: "📊",
    category: "utilities",
    tooltip: "Compare and analyze code differences",
  },
  {
    path: "url-parser",
    label: "URL Parser",
    icon: "🔗",
    category: "utilities",
    tooltip: "Parse and analyze URL components",
  },
  {
    path: "base64-encoder-decoder",
    label: "Base64 Encoder/Decoder",
    icon: "🔄",
    category: "utilities",
    tooltip: "Encode or decode Base64 strings",
  },
  {
    path: "cron-expression-tool",
    label: "Cron Expression Tool",
    icon: "⏱️",
    category: "utilities",
    tooltip: "Create and test cron expressions",
  },
  {
    path: "markdown-previewer",
    label: "Markdown Previewer",
    icon: "📝",
    category: "utilities",
    tooltip: "Preview and edit Markdown documents",
  },
  {
    path: "logs",
    label: "Logs",
    icon: "📋",
    category: "utilities",
    tooltip: "Monitor log files in real-time",
  },

  // Validators
  {
    path: "json-validator",
    label: "JSON Validator",
    icon: "📄",
    category: "validators",
    tooltip: "Validate and format JSON data",
  },
  {
    path: "xml-validator",
    label: "XML Validator",
    icon: "📄",
    category: "validators",
    tooltip: "Validate and format XML documents",
  },
  {
    path: "yaml-validator",
    label: "YAML Validator",
    icon: "📄",
    category: "validators",
    tooltip: "Validate and format YAML files",
  },
  {
    path: "sql-formatter",
    label: "SQL Formatter",
    icon: "📄",
    category: "validators",
    tooltip: "Format and beautify SQL queries",
  },

  // Generators
  {
    path: "test-data-generator",
    label: "Test Data Generator",
    icon: "🔄",
    category: "generators",
    tooltip: "Generate test data for development",
  },
  {
    path: "code-skeleton",
    label: "Code Skeleton",
    icon: "📋",
    category: "generators",
    tooltip: "Generate code structure templates",
  },
  {
    path: "app-generator",
    label: "App Generator",
    icon: "🚀",
    category: "generators",
    tooltip: "Generate application boilerplate code",
  },

  // Database Tools (NEW CATEGORY)
  {
    path: "database-client",
    label: "Database Client",
    icon: "🗄️",
    category: "database",
    tooltip: "Connect to PostgreSQL, MySQL, Oracle, and Sybase databases",
  },
  {
    path: "sql-fiddle",
    label: "SQL Fiddle",
    icon: "🗃️",
    category: "database",
    tooltip: "Test and run SQL queries in SQLite sandbox",
  },
  {
    path: "schema-visualizer",
    label: "Schema Visualizer",
    icon: "📊",
    category: "database",
    tooltip: "Visualize database schemas and relationships",
  },

  // Deployment
  {
    path: "deploy-app",
    label: "Deploy App",
    icon: "🚀",
    category: "deployment",
    tooltip: "Deploy WAR files to Tomcat servers",
  },

  // Testers
  {
    path: "api-tester",
    label: "API Tester",
    icon: "🌐",
    category: "testers",
    tooltip: "Test API endpoints and responses",
  },
  {
    path: "network-inspector",
    label: "Network Inspector",
    icon: "🔍",
    category: "testers",
    tooltip: "Inspect network traffic and requests",
  },

  // Analyzers
  {
    path: "log-analyzer",
    label: "Log Analyzer",
    icon: "📋",
    category: "analyzers",
    tooltip: "Analyze and parse log files",
  },

  // Resources
  {
    path: "config-samples",
    label: "Config Samples",
    icon: "⚙️",
    category: "resources",
    tooltip: "Sample configuration files and templates",
  },
  {
    path: "cheat-sheet",
    label: "Dev Cheat Sheet",
    icon: "📝",
    category: "resources",
    tooltip: "Programming cheat sheets and quick references",
  },
];

// Also update the categoryLabels object to include the new database category:

const categoryLabels = {
  validators: "Validators",
  generators: "Generators",
  database: "Database Tools", // NEW CATEGORY
  testers: "Testers",
  visualizers: "Visualizers", // This can be removed since we moved schema-visualizer to database
  analyzers: "Analyzers",
  utilities: "Utilities",
  resources: "Resources",
  deployment: "Deployment",
};

// Update the Results Area exclusion list to include database-client:
// In the Results Area section, update the condition to exclude database-client from showing results:

{currentTool !== "mems" &&
  currentTool !== "cheat-sheet" &&
  currentTool !== "config-samples" &&
  currentTool !== "views" &&
  currentTool !== "bcrypts" &&
  currentTool !== "markdown-previewer" &&
  currentTool !== "terms" &&
  currentTool !== "logs" &&
  currentTool !== "database-client" && ( // ADD THIS LINE
    <div className={`results-area ${resultsMaximized ? "maximized" : ""}`}>
      {/* Results area content */}
    </div>
  )}

  // Group navigation items by category
  const navItemsByCategory = navItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  // Get ordered categories (use stored order or default)
  const orderedCategories = useMemo(() => {
    const allCategories = Object.keys(navItemsByCategory);
    if (categoryOrder.length === 0) {
      // Default order: utilities first, then others in their natural order
      const defaultOrder = ['utilities'];
      allCategories.forEach((cat) => {
        if (cat !== 'utilities' && !defaultOrder.includes(cat)) {
          defaultOrder.push(cat);
        }
      });
      return defaultOrder;
    }
    // Merge stored order with any new categories
    const ordered = [...categoryOrder];
    allCategories.forEach((cat) => {
      if (!ordered.includes(cat)) {
        ordered.push(cat);
      }
    });
    return ordered.filter((cat) => allCategories.includes(cat));
  }, [categoryOrder, navItemsByCategory]);

  // Get ordered tools for a category
  const getOrderedTools = (category) => {
    const tools = navItemsByCategory[category] || [];
    const storedOrder = toolOrder[category];
    if (!storedOrder || storedOrder.length === 0) {
      return tools;
    }
    // Merge stored order with any new tools
    const ordered = [...storedOrder];
    tools.forEach((tool) => {
      if (!ordered.includes(tool.path)) {
        ordered.push(tool.path);
      }
    });
    return ordered
      .map((path) => tools.find((t) => t.path === path))
      .filter(Boolean);
  };

  // Toggle category collapse
  const toggleCategoryCollapse = (category) => {
    setCollapsedCategories((prev) => {
      const updated = { ...prev, [category]: !prev[category] };
      localStorage.setItem("atf-dev-studio-collapsed-categories", JSON.stringify(updated));
      return updated;
    });
  };

  // Handle drag start
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    const id = event.active.id.toString();
    // Determine if it's a category or tool drag
    if (orderedCategories.includes(id)) {
      setDragType("category");
    } else {
      setDragType("tool");
    }
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      setDragType(null);
      return;
    }

    const activeIdStr = active.id.toString();
    const overIdStr = over.id.toString();
    
    // Determine if it's a category or tool drag
    const isCategoryDrag = orderedCategories.includes(activeIdStr);
    
    if (isCategoryDrag) {
      // Category drag
      const oldIndex = orderedCategories.indexOf(activeIdStr);
      const newIndex = orderedCategories.indexOf(overIdStr);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(orderedCategories, oldIndex, newIndex);
        setCategoryOrder(newOrder);
        localStorage.setItem("atf-dev-studio-category-order", JSON.stringify(newOrder));
      }
    } else {
      // Tool drag - Extract category from the tool ID (format: "category:toolPath")
      const activeParts = activeIdStr.split(":");
      const overParts = overIdStr.split(":");
      
      if (activeParts.length === 2 && overParts.length === 2) {
        const category = activeParts[0];
        const activeTool = activeParts[1];
        const overTool = overParts[1];
        
        if (category === overParts[0]) {
          // Same category - reorder tools
          const currentOrder = toolOrder[category] || getOrderedTools(category).map((t) => t.path);
          const oldIndex = currentOrder.indexOf(activeTool);
          const newIndex = currentOrder.indexOf(overTool);
          if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
            setToolOrder((prev) => {
              const updated = { ...prev, [category]: newOrder };
              localStorage.setItem("atf-dev-studio-tool-order", JSON.stringify(updated));
              return updated;
            });
          }
        }
      }
    }
    
    setActiveId(null);
    setDragType(null);
  };


  return (
    <div className={`dashboard-container ${darkMode ? "dark-mode" : ""} ${dashboardStyle === "modern" ? "modern-style" : ""} sidebar-${sidebarPosition}`}>
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">
            {!sidebarCollapsed && "ATF Dev Studio"}
            {sidebarCollapsed && "ATF"}
          </h1>
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed 
              ? (sidebarPosition === 'right' ? "←" : "→")
              : (sidebarPosition === 'right' ? "→" : "←")}
          </button>
        </div>

        <nav className="sidebar-nav">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedCategories}
              strategy={verticalListSortingStrategy}
            >
              {orderedCategories.map((category) => {
                const isCollapsed = collapsedCategories[category];
                const orderedTools = getOrderedTools(category);
                const toolIds = orderedTools.map((tool) => `${category}:${tool.path}`);

                return (
                  <SortableCategory
                    key={category}
                    category={category}
                    label={categoryLabels[category]}
                    isCollapsed={isCollapsed}
                    onToggleCollapse={toggleCategoryCollapse}
                    sidebarCollapsed={sidebarCollapsed}
                  >
                    <SortableContext
                      items={toolIds}
                      strategy={verticalListSortingStrategy}
                    >
                      <ul>
                        {orderedTools.map((tool) => (
                          <SortableTool
                            key={tool.path}
                            tool={tool}
                            category={category}
                            sidebarCollapsed={sidebarCollapsed}
                          />
                        ))}
                      </ul>
                    </SortableContext>
                  </SortableCategory>
                );
              })}
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <div className="drag-overlay-item">
                  {(() => {
                    const activeIdStr = activeId.toString();
                    const isCategory = orderedCategories.includes(activeIdStr);
                    
                    if (isCategory) {
                      return (
                        <div className="category-header">
                          <span className="category-label">
                            {categoryLabels[activeIdStr] || activeIdStr}
                          </span>
                        </div>
                      );
                    } else {
                      const toolParts = activeIdStr.split(":");
                      if (toolParts.length === 2) {
                        const category = toolParts[0];
                        const toolPath = toolParts[1];
                        const categoryTools = navItemsByCategory[category] || [];
                        const tool = categoryTools.find((item) => item.path === toolPath);
                        if (tool) {
                          return (
                            <div className="sidebar-item">
                              <span className="sidebar-icon">{tool.icon}</span>
                              <span className="sidebar-item-text">{tool.label}</span>
                            </div>
                          );
                        }
                      }
                      return (
                        <div className="sidebar-item">
                          <span className="sidebar-icon">📄</span>
                          <span className="sidebar-item-text">Tool</span>
                        </div>
                      );
                    }
                  })()}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </nav>

        <div className="sidebar-footer">
          <div className="version-badge">
            {!sidebarCollapsed && "Version 1.0.0"}
            {sidebarCollapsed && "v1.0"}
          </div>
        </div>
      </div>

      <div className="main-content">
        <header className="main-header">
          <h1>{getTitleFromPath(currentTool)}</h1>
          <div className="header-actions">
            <button
              className="theme-toggle-button"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button
              className={`config-button ${configPanelOpen ? "active" : ""}`}
              onClick={toggleConfigPanel}
              aria-label="Toggle configuration panel"
              title="Open settings panel"
            >
              <span className="config-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </header>

        <div className="content-area">
          {/* Config panel on left when sidebar is on right */}
          {configPanelOpen && sidebarPosition === 'right' && (
            <aside className="config-panel">
              <div className="config-header">
                <h3>Configuration</h3>
                <button
                  className="close-config-button"
                  onClick={() => setConfigPanelOpen(false)}
                  aria-label="Close configuration panel"
                  title="Close settings panel"
                >
                  ×
                </button>
              </div>
              <div className="config-content">
                {/* Show Dashboard Settings when no child component provides config */}
                <DashboardSettings
                  dashboardStyle={dashboardStyle}
                  setDashboardStyle={setDashboardStyle}
                  sidebarPosition={sidebarPosition}
                  setSidebarPosition={setSidebarPosition}
                  darkMode={darkMode}
                />
              </div>
            </aside>
          )}

          <main className="main-panel">
            <div className="tool-wrapper">
              {/* Child components are rendered here */}
              <Outlet
                context={[
                  configPanelOpen,
                  setConfigPanelOpen,
                  handleResultsUpdate,
                  darkMode,
                  setDarkMode,
                ]}
              />

              {/* Results Area – only show when NOT on /mems */}
              {currentTool !== "mems" &&
                currentTool !== "cheat-sheet" &&
                currentTool !== "config-samples" &&
                currentTool !== "markdown-previewer" &&
                currentTool !== "terms" &&
                currentTool !== "views" &&
                currentTool !== "bcrypts" &&
                currentTool !== "logs" && (
                  <div
                    className={`results-area ${
                      resultsMaximized ? "maximized" : ""
                    }`}
                  >
                    <div className="results-header">
                      <h2>Results</h2>
                      <div className="results-header-actions">
                        {validationResults.status && (
                          <button
                            className="results-action-button copy-results-button"
                            onClick={handleCopyResults}
                            data-shortcut={`${
                              isMac ? "⌘" : "Ctrl"
                            } + Shift + C`}
                          >
                            <span className="results-icon">📋</span>
                            Copy Results
                          </button>
                        )}
                        <button
                          className="results-action-button maximize-button"
                          onClick={toggleMaximizeResults}
                          data-shortcut={`${isMac ? "⌘" : "Ctrl"} + Shift + M`}
                        >
                          <span className="results-icon">
                            {resultsMaximized ? "↙️" : "↗️"}
                          </span>
                          {resultsMaximized ? "Minimize" : "Maximize"}
                        </button>
                        <button
                          className="results-action-button clear-results-button"
                          onClick={handleClearResults}
                          data-shortcut={`${isMac ? "⌘" : "Ctrl"} + Shift + X`}
                        >
                          Clear Results
                        </button>
                      </div>
                    </div>

                    {validationResults.status ? (
                      <div
                        className={`results-content ${validationResults.status}`}
                        style={{
                          maxHeight: resultsMaximized ? "calc(100vh - 120px)" : "calc(60vh - 80px)",
                          overflow: "auto",
                        }}
                      >
                        <div className="result-message">
                          {validationResults.status === "success" && (
                            <span className="success-icon">✓</span>
                          )}
                          {validationResults.status === "error" && (
                            <span className="error-icon">✗</span>
                          )}
                          {validationResults.status === "warning" && (
                            <span className="warning-icon">⚠️</span>
                          )}
                          {validationResults.status === "info" && (
                            <span className="info-icon">ℹ️</span>
                          )}
                          <span className="message-text">
                            {validationResults.message}
                          </span>
                        </div>

                        {validationResults.details && (
                          <div className="result-details">
                            {validationResults.details}
                          </div>
                        )}

                        {validationResults.content && (
                          <div
                            className="result-content"
                            dangerouslySetInnerHTML={{
                              __html: validationResults.content,
                            }}
                            style={{ maxHeight: "none" }}
                          ></div>
                        )}
                      </div>
                    ) : (
                      <div className="results-placeholder">
                        <p>
                          No results yet. Use the tools above to generate
                          results.
                        </p>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </main>

          {/* Config panel on right when sidebar is on left */}
          {configPanelOpen && sidebarPosition === 'left' && (
            <aside className="config-panel">
              <div className="config-header">
                <h3>Configuration</h3>
                <button
                  className="close-config-button"
                  onClick={() => setConfigPanelOpen(false)}
                  aria-label="Close configuration panel"
                  title="Close settings panel"
                >
                  ×
                </button>
              </div>
              <div className="config-content">
                {/* Show Dashboard Settings when no child component provides config */}
                <DashboardSettings
                  dashboardStyle={dashboardStyle}
                  setDashboardStyle={setDashboardStyle}
                  sidebarPosition={sidebarPosition}
                  setSidebarPosition={setSidebarPosition}
                  darkMode={darkMode}
                />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
