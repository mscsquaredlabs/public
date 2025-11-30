/**
 * shared/utils/schemaUtils.js
 * ---------------------------
 * Utilities for database schema operations and visualization
 */

// Escape HTML for safe display
const escapeHtml = (str = '') =>
  str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');

/**
 * Validate a database schema
 * @param {string} ddlString - SQL DDL statements
 * @returns {Object} Result with valid flag and error message if invalid
 */
export const validateDDL = (ddlString) => {
  if (!ddlString || !ddlString.trim()) {
    return { valid: false, message: 'DDL input cannot be empty' };
  }

  try {
    // Check for balanced parentheses
    const openParens = (ddlString.match(/\(/g) || []).length;
    const closeParens = (ddlString.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      return { valid: false, message: `Unbalanced parentheses: ${openParens} opening vs ${closeParens} closing` };
    }

    // Check for CREATE TABLE statements
    if (!ddlString.match(/CREATE\s+TABLE/i)) {
      return { valid: false, message: 'No CREATE TABLE statements found' };
    }

    // Check for semicolons at the end of statements
    const statements = ddlString.split(/;/g).filter(s => s.trim());
    const lastStatement = statements[statements.length - 1];
    if (lastStatement && !lastStatement.trim().endsWith(';') && !ddlString.trim().endsWith(';')) {
      return { valid: false, message: 'Missing semicolon at the end of the statement' };
    }

    return { valid: true, message: 'Schema appears valid' };
  } catch (err) {
    return { valid: false, message: `Validation error: ${err.message}` };
  }
};

/**
 * Extract database metadata from DDL statements
 * @param {string} ddl - DDL SQL statements
 * @returns {Object} Metadata including table count, column count, etc.
 */
export const extractDatabaseMetadata = (ddl) => {
  const metadata = {
    tableCount: 0,
    columnCount: 0,
    primaryKeyCount: 0,
    foreignKeyCount: 0,
    relationshipCount: 0,
    complexityScore: 0
  };

  try {
    // Count tables
    const tableMatches = ddl.match(/CREATE\s+TABLE\s+(?:`|")?(\w+)(?:`|")?/gi);
    metadata.tableCount = tableMatches ? tableMatches.length : 0;

    // Count columns (improved regex to handle complex data types)
    const columnMatches = ddl.match(/^\s*(?:`|")?(\w+)(?:`|")?\s+[\w(),\s]+(?:,|$)/gmi);
    metadata.columnCount = columnMatches ? columnMatches.length : 0;

    // Count primary keys
    const pkMatches = ddl.match(/PRIMARY\s+KEY/gi);
    metadata.primaryKeyCount = pkMatches ? pkMatches.length : 0;

    // Count foreign keys
    const fkMatches = ddl.match(/FOREIGN\s+KEY/gi);
    metadata.foreignKeyCount = fkMatches ? fkMatches.length : 0;

    // Relationships are equivalent to foreign keys
    metadata.relationshipCount = metadata.foreignKeyCount;

    // Calculate complexity (simple heuristic)
    metadata.complexityScore = metadata.tableCount * 2 + metadata.relationshipCount * 3;

    return metadata;
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return metadata;
  }
};

/**
 * Generate sample DDL for different database schemas
 * @param {string} schemaType - Type of schema to generate (ecommerce, blog, complex)
 * @returns {string} DDL SQL statements
 */
export const generateSampleDDL = (schemaType) => {
  // If no schema type provided, return ecommerce as default
  const type = schemaType || 'ecommerce';
  
  switch (type) {
    case 'ecommerce':
      return `CREATE TABLE users (
  user_id INT AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  PRIMARY KEY (user_id),
  UNIQUE KEY (email),
  UNIQUE KEY (username)
);

CREATE TABLE products (
  product_id INT AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  inventory_count INT NOT NULL DEFAULT 0,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id)
);

CREATE TABLE orders (
  order_id INT AUTO_INCREMENT,
  user_id INT NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (order_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE order_items (
  order_item_id INT AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price_per_unit DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (order_item_id),
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE reviews (
  review_id INT AUTO_INCREMENT,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (review_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);`;

    case 'blog':
      return `CREATE TABLE authors (
  author_id INT AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (author_id)
);

CREATE TABLE categories (
  category_id INT AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  PRIMARY KEY (category_id)
);

CREATE TABLE posts (
  post_id INT AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id INT NOT NULL,
  category_id INT,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id),
  FOREIGN KEY (author_id) REFERENCES authors(author_id),
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE comments (
  comment_id INT AUTO_INCREMENT,
  post_id INT NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comment_id),
  FOREIGN KEY (post_id) REFERENCES posts(post_id)
);

CREATE TABLE tags (
  tag_id INT AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (tag_id)
);

CREATE TABLE post_tags (
  post_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(post_id),
  FOREIGN KEY (tag_id) REFERENCES tags(tag_id)
);`;

    case 'complex':
      return `CREATE TABLE departments (
  department_id INT AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  budget DECIMAL(15, 2),
  location VARCHAR(100),
  PRIMARY KEY (department_id)
);

CREATE TABLE employees (
  employee_id INT AUTO_INCREMENT,
  department_id INT NOT NULL,
  manager_id INT,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  hire_date DATE NOT NULL,
  salary DECIMAL(10, 2) NOT NULL,
  job_title VARCHAR(100),
  PRIMARY KEY (employee_id),
  FOREIGN KEY (department_id) REFERENCES departments(department_id),
  FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
);

CREATE TABLE projects (
  project_id INT AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15, 2),
  department_id INT,
  manager_id INT NOT NULL,
  PRIMARY KEY (project_id),
  FOREIGN KEY (department_id) REFERENCES departments(department_id),
  FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
);

CREATE TABLE project_assignments (
  employee_id INT NOT NULL,
  project_id INT NOT NULL,
  assignment_date DATE NOT NULL,
  role VARCHAR(50),
  hours_allocated INT DEFAULT 40,
  PRIMARY KEY (employee_id, project_id),
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
  FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE TABLE skills (
  skill_id INT AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  category VARCHAR(50),
  PRIMARY KEY (skill_id)
);

CREATE TABLE employee_skills (
  employee_id INT NOT NULL,
  skill_id INT NOT NULL,
  proficiency_level INT,
  PRIMARY KEY (employee_id, skill_id),
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
  FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
);

CREATE TABLE salaries (
  salary_id INT AUTO_INCREMENT,
  employee_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  effective_date DATE NOT NULL,
  end_date DATE,
  PRIMARY KEY (salary_id),
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);`;
      
    default:
      // Return ecommerce sample as default
      return generateSampleDDL('ecommerce');
  }
};

/**
 * Improved parser for DDL statements to extract schema with better handling of data types and constraints
 * @param {string} ddl - DDL SQL statements
 * @returns {Object} Parsed schema object
 */
export const parseDDL = (ddl) => {
  // Initialize schema structure
  const schema = {
    tables: {},
    relationships: []
  };
  
  try {
    // Regular expressions for parsing with improved handling of complex data types
    const createTableRegex = /CREATE\s+TABLE\s+(?:`|")?(\w+)(?:`|")?\s*\(([\s\S]*?)(?:\);)/gmi;
    const columnDefRegex = /\s*(?:`|")?(\w+)(?:`|")?\s+([^,]+?)(?:,|$)/gm;
    const primaryKeyRegex = /PRIMARY\s+KEY\s*\(([^)]+)\)/gmi;
    const foreignKeyRegex = /FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+(?:`|")?(\w+)(?:`|")?\s*\(([^)]+)\)/gmi;
    const uniqueKeyRegex = /UNIQUE(?:\s+KEY|\s+INDEX)?\s*(?:\w+\s*)?\(([^)]+)\)/gmi;
    
    // Extract CREATE TABLE statements
    let tableMatch;
    while ((tableMatch = createTableRegex.exec(ddl)) !== null) {
      const tableName = tableMatch[1];
      const tableBody = tableMatch[0]; // Full CREATE TABLE statement
      
      // Initialize table structure
      schema.tables[tableName] = {
        name: tableName,
        columns: [],
        primaryKey: [],
        uniqueKeys: [],
        foreignKeys: []
      };
      
      // Extract column definitions with improved regex for handling complex types
      const columnSection = tableBody.substring(
        tableBody.indexOf('(') + 1, 
        tableBody.lastIndexOf(')')
      );
      
      // Process each line to handle column definitions better
      const lines = columnSection.split('\n');
      for (const line of lines) {
        // Skip empty lines or non-column definitions
        if (!line.trim() || 
            line.trim().startsWith('PRIMARY KEY') || 
            line.trim().startsWith('FOREIGN KEY') ||
            line.trim().startsWith('UNIQUE') ||
            line.trim().startsWith('CHECK') ||
            line.trim().startsWith('INDEX')) {
          continue;
        }
        
        // Attempt to parse this as a column definition
        const lineMatch = line.match(/^\s*(?:`|")?(\w+)(?:`|")?\s+([\w\s(),.']+)(?:,|$)/);
        if (lineMatch) {
          const columnName = lineMatch[1];
          const columnType = lineMatch[2].trim();
          
          // Parse column type and constraints
          const typeMatch = columnType.match(/^(\w+(?:\s*\(\s*[\w,.']+\s*\))?)(?:\s+(.*))?$/);
          if (typeMatch) {
            const dataType = typeMatch[1].trim();
            const constraints = typeMatch[2] || '';
            
            // Check for various constraints
            const isNotNull = /NOT\s+NULL/i.test(constraints);
            const hasDefault = /DEFAULT\s+/i.test(constraints);
            const isAutoIncrement = /AUTO_INCREMENT|IDENTITY|SERIAL/i.test(constraints);
            const isUnique = /UNIQUE/i.test(constraints);
            
            // Extract default value if present
            let defaultValue = null;
            const defaultMatch = constraints.match(/DEFAULT\s+([^,\s]+)/i);
            if (defaultMatch) {
              defaultValue = defaultMatch[1];
            }
            
            // Add the column to the table
            schema.tables[tableName].columns.push({
              name: columnName,
              type: dataType,
              nullable: !isNotNull,
              hasDefault: hasDefault,
              defaultValue: defaultValue,
              isAutoIncrement: isAutoIncrement,
              isUnique: isUnique
            });
          }
        }
      }
      
      // Extract primary keys
      let primaryKeyMatch;
      while ((primaryKeyMatch = primaryKeyRegex.exec(tableBody)) !== null) {
        const pkColumns = primaryKeyMatch[1].split(',').map(col => 
          col.trim().replace(/^`|`$|^"|"$/g, '') // Remove backticks or quotes
        );
        
        schema.tables[tableName].primaryKey = pkColumns;
        
        // Mark columns as primary key
        pkColumns.forEach(pkCol => {
          const column = schema.tables[tableName].columns.find(col => col.name === pkCol);
          if (column) {
            column.isPrimaryKey = true;
          }
        });
      }
      
      // Extract unique keys
      let uniqueKeyMatch;
      while ((uniqueKeyMatch = uniqueKeyRegex.exec(tableBody)) !== null) {
        const uniqueColumns = uniqueKeyMatch[1].split(',').map(col => 
          col.trim().replace(/^`|`$|^"|"$/g, '') // Remove backticks or quotes
        );
        
        schema.tables[tableName].uniqueKeys.push(uniqueColumns);
        
        // Mark columns as unique
        uniqueColumns.forEach(uniqueCol => {
          const column = schema.tables[tableName].columns.find(col => col.name === uniqueCol);
          if (column) {
            column.isUnique = true;
          }
        });
      }
      
      // Extract foreign keys and relationships
      let foreignKeyMatch;
      while ((foreignKeyMatch = foreignKeyRegex.exec(tableBody)) !== null) {
        const fkColumns = foreignKeyMatch[1].split(',').map(col => 
          col.trim().replace(/^`|`$|^"|"$/g, '')
        );
        const referencedTable = foreignKeyMatch[2];
        const referencedColumns = foreignKeyMatch[3].split(',').map(col => 
          col.trim().replace(/^`|`$|^"|"$/g, '')
        );
        
        // Add to table's foreign keys
        schema.tables[tableName].foreignKeys.push({
          columns: fkColumns,
          referencedTable: referencedTable,
          referencedColumns: referencedColumns
        });
        
        // Mark columns as foreign key
        fkColumns.forEach((fkCol, index) => {
          const column = schema.tables[tableName].columns.find(col => col.name === fkCol);
          if (column) {
            column.isForeignKey = true;
            column.references = {
              table: referencedTable,
              column: referencedColumns[index] || referencedColumns[0]
            };
          }
        });
        
        // Add to relationships list
        schema.relationships.push({
          sourceTable: tableName,
          sourceColumns: fkColumns,
          targetTable: referencedTable,
          targetColumns: referencedColumns
        });
      }
    }
    
    return schema;
  } catch (error) {
    console.error('Error parsing DDL:', error);
    throw new Error(`Failed to parse schema: ${error.message}`);
  }
};

/**
 * Convert ER diagram schema to HTML visualization
 * @param {Object} schema - Parsed schema object
 * @param {Object} options - Display options
 * @returns {string} HTML for visualization
 */
export const generateERDiagramHtml = (schema, options = {}) => {
  const defaultOptions = {
    showDataTypes: true,
    showConstraints: true,
    highlightKeys: true,
    showRelationships: true,
    compactView: false
  };
  
  const displayOptions = { ...defaultOptions, ...options };
  const tables = Object.values(schema.tables);
  const relationships = schema.relationships;
  
  // Generate Mermaid diagram syntax
  let mermaidCode = 'erDiagram\n';
  
  // Add tables and columns
  tables.forEach(table => {
    mermaidCode += `    ${table.name} {\n`;
    
    table.columns.forEach(column => {
      let columnType = displayOptions.showDataTypes ? column.type : '';
      let constraints = '';
      
      if (displayOptions.highlightKeys && column.isPrimaryKey) {
        constraints += 'PK ';
      }
      
      if (displayOptions.highlightKeys && column.isForeignKey) {
        constraints += 'FK ';
      }
      
      if (displayOptions.showConstraints) {
        if (!column.nullable) constraints += 'NOT_NULL ';
        if (column.hasDefault) constraints += 'DEFAULT ';
        if (column.isAutoIncrement) constraints += 'AUTO_INC ';
      }
      
      mermaidCode += `        ${constraints}${column.name} ${columnType}\n`;
    });
    
    mermaidCode += '    }\n';
  });
  
  // Add relationships if option is enabled
  if (displayOptions.showRelationships) {
    relationships.forEach(rel => {
      // Determine cardinality (simplified)
      let cardinality = '1--n'; // Default to one-to-many
      
      // Check if target column is primary key
      const targetTable = schema.tables[rel.targetTable];
      const isTargetPK = targetTable && rel.targetColumns.every(col => 
        targetTable.primaryKey.includes(col)
      );
      
      // Check if source column is part of a composite primary key
      const sourceTable = schema.tables[rel.sourceTable];
      const isSourcePK = sourceTable && rel.sourceColumns.some(col => 
        sourceTable.primaryKey.includes(col)
      );
      
      // Determine cardinality based on constraints
      if (isTargetPK && isSourcePK) {
        cardinality = 'n--n'; // Many-to-many
      } else if (isTargetPK && !isSourcePK) {
        cardinality = '1--n'; // One-to-many
      } else if (!isTargetPK && isSourcePK) {
        cardinality = 'n--1'; // Many-to-one
      } else {
        cardinality = '1--1'; // One-to-one
      }
      
      mermaidCode += `    ${rel.sourceTable} ${cardinality} ${rel.targetTable} : references\n`;
    });
  }
  
  // Return the completed Mermaid diagram HTML with script to ensure rendering
  return `<div class="mermaid">${mermaidCode}</div>
<script>
(function() {
  if (window.mermaid) {
    try {
      setTimeout(function() {
        window.mermaid.initialize({
          startOnLoad: true,
          securityLevel: 'loose',
          er: { 
            diagramPadding: 20,
            layoutDirection: 'TB',
            minEntityWidth: 100,
            entityPadding: 15
          }
        });
        window.mermaid.init(undefined, document.querySelectorAll('.mermaid:not(.mermaid-processed)'));
        document.querySelectorAll('.mermaid').forEach(el => el.classList.add('mermaid-processed'));
      }, 100);
    } catch (e) {
      console.error('Mermaid initialization error:', e);
    }
  }
})();
</script>`;
};

/**
 * Convert schema to JSON view
 * @param {Object} schema - Parsed schema object
 * @param {Object} options - Display options
 * @returns {string} HTML for visualization
 */
export const generateSchemaJsonHtml = (schema, options = {}) => {
  const defaultOptions = {
    showDataTypes: true,
    showConstraints: true,
    highlightKeys: true,
    showRelationships: true
  };
  
  const displayOptions = { ...defaultOptions, ...options };
  
  // Create a clean, structured version of the schema for display
  const displaySchema = {};
  
  // Extract tables with essential information
  Object.values(schema.tables).forEach(table => {
    displaySchema[table.name] = {
      columns: table.columns.map(col => {
        const columnInfo = {
          name: col.name
        };
        
        if (displayOptions.showDataTypes) {
          columnInfo.type = col.type;
        }
        
        if (displayOptions.highlightKeys) {
          if (col.isPrimaryKey) columnInfo.primaryKey = true;
          if (col.isForeignKey) columnInfo.foreignKey = true;
        }
        
        if (displayOptions.showConstraints) {
          if (col.nullable === false) columnInfo.nullable = false;
          if (col.hasDefault) columnInfo.hasDefault = true;
          if (col.isAutoIncrement) columnInfo.autoIncrement = true;
          if (col.isUnique) columnInfo.unique = true;
          
          if (col.isForeignKey && col.references) {
            columnInfo.references = col.references;
          }
        }
        
        return columnInfo;
      })
    };
    
    // Add primary and unique keys if they exist and option is enabled
    if (displayOptions.highlightKeys) {
      if (table.primaryKey && table.primaryKey.length > 0) {
        displaySchema[table.name].primaryKey = table.primaryKey;
      }
      
      if (table.uniqueKeys && table.uniqueKeys.length > 0) {
        displaySchema[table.name].uniqueKeys = table.uniqueKeys;
      }
    }
    
    // Add relationships if they exist and option is enabled
    if (displayOptions.showRelationships && table.foreignKeys && table.foreignKeys.length > 0) {
      displaySchema[table.name].relationships = table.foreignKeys.map(fk => ({
        columns: fk.columns,
        references: {
          table: fk.referencedTable,
          columns: fk.referencedColumns
        }
      }));
    }
  });
  
  // Format JSON with indentation
  const formattedJson = JSON.stringify(displaySchema, null, 2);
  
  // Return the HTML with syntax highlighting
  return `<pre class="json-schema">${escapeHtml(formattedJson)}</pre>`;
};

/**
 * Generate Markdown table HTML from schema
 * @param {Object} schema - Parsed schema object
 * @param {Object} options - Display options
 * @returns {string} HTML for visualization
 */
export const generateMarkdownTablesHtml = (schema, options = {}) => {
  const defaultOptions = {
    showDataTypes: true,
    showConstraints: true,
    highlightKeys: true,
    showRelationships: true
  };
  
  const displayOptions = { ...defaultOptions, ...options };
  let markdown = '';
  
  // Generate a table for each database table with improved formatting
  Object.values(schema.tables).forEach(table => {
    markdown += `## ${table.name}\n\n`;
    
    // Create markdown table header with better spacing
    let header = '| Column';
    let separator = '| --- ';
    
    if (displayOptions.showDataTypes) {
      header += ' | Type';
      separator += '| --- ';
    }
    
    if (displayOptions.highlightKeys) {
      header += ' | Key';
      separator += '| --- ';
    }
    
    if (displayOptions.showConstraints) {
      header += ' | Constraints';
      separator += '| --- ';
    }
    
    header += ' |\n';
    separator += '|\n';
    
    markdown += header + separator;
    
    // Add rows for each column with better formatting
    table.columns.forEach(column => {
      let row = `| ${column.name} `;
      
      if (displayOptions.showDataTypes) {
        row += `| ${column.type} `;
      }
      
      if (displayOptions.highlightKeys) {
        let keyInfo = '';
        if (column.isPrimaryKey) keyInfo += 'PK ';
        if (column.isForeignKey) keyInfo += 'FK ';
        if (column.isUnique && !column.isPrimaryKey) keyInfo += 'UQ ';
        row += `| ${keyInfo} `;
      }
      
      if (displayOptions.showConstraints) {
        let constraints = [];
        if (!column.nullable) constraints.push('NOT NULL');
        if (column.hasDefault) {
          if (column.defaultValue) {
            constraints.push(`DEFAULT ${column.defaultValue}`);
          } else {
            constraints.push('DEFAULT');
          }
        }
        if (column.isAutoIncrement) constraints.push('AUTO INCREMENT');
        if (column.isForeignKey && column.references) {
          constraints.push(`REFERENCES ${column.references.table}(${column.references.column})`);
        }
        
        row += `| ${constraints.join(', ')} `;
      }
      
      row += '|\n';
      markdown += row;
    });
    
    markdown += '\n';
  });
  
  // Add relationships section if option is enabled
  if (displayOptions.showRelationships && schema.relationships.length > 0) {
    markdown += '## Relationships\n\n';
    markdown += '| Source Table | Source Columns | Target Table | Target Columns |\n';
    markdown += '| --- | --- | --- | --- |\n';
    
    schema.relationships.forEach(rel => {
      markdown += `| ${rel.sourceTable} | ${rel.sourceColumns.join(', ')} | ${rel.targetTable} | ${rel.targetColumns.join(', ')} |\n`;
    });
  }
  
  // Convert markdown to HTML for display
  return `<div class="markdown-schema">${convertMarkdownToHtml(markdown)}</div>`;
};

/**
 * Simple Markdown to HTML converter for table display
 * @param {string} markdown - Markdown text
 * @returns {string} HTML
 */
export const convertMarkdownToHtml = (markdown) => {
  // Convert headers
  let html = markdown
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\n\n/g, '<br/>');
  
  // Convert tables (simple implementation)
  const tableRegex = /(\|[^\n]+\|\n)((?:\|[^\n]+\|\n)+)/g;
  html = html.replace(tableRegex, (match, headerRow, bodyRows) => {
    // Process header
    const header = headerRow
      .replace(/\|/g, '<td>')
      .replace(/<td>\s*<td>/g, '<td>')
      .replace(/^\s*<td>/g, '<tr><th>')
      .replace(/<td>\s*$/g, '</th></tr>')
      .replace(/<td>/g, '<th>')
      .replace(/<\/td>/g, '</th>');
    
    // Process separator row (skip it)
    bodyRows = bodyRows.replace(/\|[\s-:]+\|\n/g, '');
    
    // Process body rows
    const body = bodyRows
      .replace(/\|/g, '<td>')
      .replace(/<td>\s*<td>/g, '<td>')
      .replace(/^\s*<td>/g, '<tr><td>')
      .replace(/<td>\s*$/g, '</td></tr>')
      .trim();
    
    return `<table class="schema-table"><thead>${header}</thead><tbody>${body}</tbody></table>`;
  });
  
  return html;
};