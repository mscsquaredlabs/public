/**
 * shared/utils/cronUtils.js
 * --------------------------
 * Utilities for cron expression parsing, validation, and calculation
 */

// Month names for reference
const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// Day of week names for reference
const DAY_OF_WEEK_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Field definitions for reference
const CRON_FIELDS = [
  { name: 'minutes', label: 'Minutes', range: '0-59', min: 0, max: 59 },
  { name: 'hours', label: 'Hours', range: '0-23', min: 0, max: 23 },
  { name: 'dayOfMonth', label: 'Day of Month', range: '1-31', min: 1, max: 31 },
  { name: 'month', label: 'Month', range: '1-12 or JAN-DEC', min: 1, max: 12 },
  { name: 'dayOfWeek', label: 'Day of Week', range: '0-6 or SUN-SAT', min: 0, max: 6 }
];

/**
 * Common cron expressions
 * @returns {Array} Array of common cron expressions with descriptions
 */
export const getCommonExpressions = () => [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
  { label: 'Every day at noon', value: '0 12 * * *' },
  { label: 'Every Sunday at midnight', value: '0 0 * * 0' },
  { label: 'Every Monday at 9am', value: '0 9 * * 1' },
  { label: 'First day of each month', value: '0 0 1 * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Every weekday at 6am', value: '0 6 * * 1-5' },
  { label: 'Every weekend at 9am', value: '0 9 * * 0,6' },
  { label: 'Every quarter hour', value: '0,15,30,45 * * * *' },
  { label: 'Every 4 hours', value: '0 */4 * * *' },
  { label: 'Monday to Friday at 10:30pm', value: '30 22 * * 1-5' }
];

/**
 * Validate a cron expression
 * @param {string} expression - Cron expression to validate
 * @returns {Object} Validation result with status and error message
 */
export const validateCronExpression = (expression) => {
  if (!expression || !expression.trim()) {
    return { valid: false, message: 'Cron expression cannot be empty' };
  }

  try {
    const parts = expression.trim().split(/\s+/);
    
    if (parts.length < 5) {
      return { 
        valid: false, 
        message: 'Invalid cron expression. Expected at least 5 fields (minutes, hours, day of month, month, day of week)' 
      };
    }
    
    const [minutes, hours, dayOfMonth, month, dayOfWeek] = parts;
    
    // Validate each field
    const minutesResult = validateCronField(minutes, 0, 59, 'Minutes');
    if (!minutesResult.valid) return minutesResult;
    
    const hoursResult = validateCronField(hours, 0, 23, 'Hours');
    if (!hoursResult.valid) return hoursResult;
    
    const dayOfMonthResult = validateCronField(dayOfMonth, 1, 31, 'Day of month');
    if (!dayOfMonthResult.valid) return dayOfMonthResult;
    
    const monthResult = validateCronField(month, 1, 12, 'Month', true);
    if (!monthResult.valid) return monthResult;
    
    const dayOfWeekResult = validateCronField(dayOfWeek, 0, 6, 'Day of week', false, true);
    if (!dayOfWeekResult.valid) return dayOfWeekResult;
    
    return { valid: true };
  } catch (error) {
    return { valid: false, message: error.message };
  }
};

/**
 * Validate a cron field
 * @param {string} field - Cron field value
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {string} fieldName - Field name for error messages
 * @param {boolean} isMonth - Whether the field is month
 * @param {boolean} isDayOfWeek - Whether the field is day of week
 * @returns {Object} Validation result with status and error message
 */
export const validateCronField = (field, min, max, fieldName, isMonth = false, isDayOfWeek = false) => {
  // Replace month names with numbers if needed
  let processedField = field;
  if (isMonth) {
    MONTH_NAMES.forEach((name, index) => {
      processedField = processedField.replace(new RegExp(name, 'gi'), (index + 1).toString());
    });
  }
  
  // Replace day of week names with numbers if needed
  if (isDayOfWeek) {
    DAY_OF_WEEK_NAMES.forEach((name, index) => {
      processedField = processedField.replace(new RegExp(name, 'gi'), index.toString());
    });
  }
  
  // Check for valid syntax
  if (processedField === '*') {
    return { valid: true }; // Every value
  }
  
  if (processedField.includes(',')) {
    // List of values
    const values = processedField.split(',');
    for (const val of values) {
      const result = validateCronField(val, min, max, fieldName, isMonth, isDayOfWeek);
      if (!result.valid) return result;
    }
    return { valid: true };
  }
  
  if (processedField.includes('-')) {
    // Range
    const [start, end] = processedField.split('-');
    if (isNaN(parseInt(start)) || isNaN(parseInt(end))) {
      return { 
        valid: false, 
        message: `Invalid range in ${fieldName} field: ${field}` 
      };
    }
    
    if (parseInt(start) < min || parseInt(end) > max || parseInt(start) > parseInt(end)) {
      return { 
        valid: false, 
        message: `Range out of bounds in ${fieldName} field: ${field}. Valid range is ${min}-${max}` 
      };
    }
    return { valid: true };
  }
  
  if (processedField.includes('/')) {
    // Step values
    const [range, step] = processedField.split('/');
    if (range !== '*' && !range.includes('-')) {
      return { 
        valid: false, 
        message: `Invalid step format in ${fieldName} field: ${field}` 
      };
    }
    
    if (isNaN(parseInt(step)) || parseInt(step) < 1) {
      return { 
        valid: false, 
        message: `Invalid step value in ${fieldName} field: ${field}` 
      };
    }
    
    if (range !== '*') {
      return validateCronField(range, min, max, fieldName, isMonth, isDayOfWeek);
    }
    return { valid: true };
  }
  
  // Single value
  if (isNaN(parseInt(processedField)) || parseInt(processedField) < min || parseInt(processedField) > max) {
    return { 
      valid: false, 
      message: `Value out of bounds in ${fieldName} field: ${field}. Valid range is ${min}-${max}` 
    };
  }
  
  return { valid: true };
};

/**
 * Generate human-readable explanation for a cron expression
 * @param {string} expression - Cron expression to explain
 * @returns {Object} Explanation and next execution times
 */
export const explainCronExpression = (expression) => {
  if (!expression || !expression.trim()) {
    throw new Error('Cron expression cannot be empty');
  }

  // Parse cron expression
  const parts = expression.trim().split(/\s+/);
  
  if (parts.length < 5) {
    throw new Error('Invalid cron expression. Expected at least 5 fields (minutes, hours, day of month, month, day of week)');
  }
  
  const [minutes, hours, dayOfMonth, month, dayOfWeek] = parts;
  
  // Generate human-readable explanation
  const explanation = {
    minutes: explainField(minutes, 0, 59, 'minute'),
    hours: explainField(hours, 0, 23, 'hour'),
    dayOfMonth: explainField(dayOfMonth, 1, 31, 'day of month'),
    month: explainField(month, 1, 12, 'month', true),
    dayOfWeek: explainField(dayOfWeek, 0, 6, 'day of week', false, true),
  };
  
  // Generate next execution times
  const nextExecutions = calculateNextExecutions(parts, 5);
  
  return { explanation, nextExecutions };
};

/**
 * Generate human-readable explanation for a cron field
 * @param {string} field - Cron field value
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {string} fieldName - Field name for explanation
 * @param {boolean} isMonth - Whether the field is month
 * @param {boolean} isDayOfWeek - Whether the field is day of week
 * @returns {string} Human-readable explanation
 */
export const explainField = (field, min, max, fieldName, isMonth = false, isDayOfWeek = false) => {
  // Replace month names with numbers if needed
  let processedField = field;
  if (isMonth) {
    MONTH_NAMES.forEach((name, index) => {
      processedField = processedField.replace(new RegExp(name, 'gi'), (index + 1).toString());
    });
  }
  
  // Replace day of week names with numbers if needed
  if (isDayOfWeek) {
    DAY_OF_WEEK_NAMES.forEach((name, index) => {
      processedField = processedField.replace(new RegExp(name, 'gi'), index.toString());
    });
  }
  
  if (processedField === '*') {
    return `Every ${fieldName}`;
  }
  
  if (processedField.includes(',')) {
    const values = processedField.split(',').map(v => {
      if (isMonth && !isNaN(parseInt(v)) && parseInt(v) >= 1 && parseInt(v) <= 12) {
        return `${MONTH_NAMES[parseInt(v) - 1]} (${v})`;
      } else if (isDayOfWeek && !isNaN(parseInt(v)) && parseInt(v) >= 0 && parseInt(v) <= 6) {
        return `${DAY_OF_WEEK_NAMES[parseInt(v)]} (${v})`;
      }
      return v;
    });
    return `At ${fieldName}(s): ${values.join(', ')}`;
  }
  
  if (processedField.includes('-')) {
    const [start, end] = processedField.split('-');
    let startLabel = start;
    let endLabel = end;
    
    if (isMonth) {
      if (!isNaN(parseInt(start)) && parseInt(start) >= 1 && parseInt(start) <= 12) {
        startLabel = `${MONTH_NAMES[parseInt(start) - 1]} (${start})`;
      }
      if (!isNaN(parseInt(end)) && parseInt(end) >= 1 && parseInt(end) <= 12) {
        endLabel = `${MONTH_NAMES[parseInt(end) - 1]} (${end})`;
      }
    } else if (isDayOfWeek) {
      if (!isNaN(parseInt(start)) && parseInt(start) >= 0 && parseInt(start) <= 6) {
        startLabel = `${DAY_OF_WEEK_NAMES[parseInt(start)]} (${start})`;
      }
      if (!isNaN(parseInt(end)) && parseInt(end) >= 0 && parseInt(end) <= 6) {
        endLabel = `${DAY_OF_WEEK_NAMES[parseInt(end)]} (${end})`;
      }
    }
    
    return `From ${startLabel} to ${endLabel}`;
  }
  
  if (processedField.includes('/')) {
    const [range, step] = processedField.split('/');
    if (range === '*') {
      return `Every ${step} ${fieldName}(s)`;
    } else {
      const rangeExplanation = explainField(range, min, max, fieldName, isMonth, isDayOfWeek);
      return `${rangeExplanation}, every ${step} ${fieldName}(s)`;
    }
  }
  
  // Single value
  if (isMonth && !isNaN(parseInt(processedField)) && parseInt(processedField) >= 1 && parseInt(processedField) <= 12) {
    return `In ${MONTH_NAMES[parseInt(processedField) - 1]} (${processedField})`;
  } else if (isDayOfWeek && !isNaN(parseInt(processedField)) && parseInt(processedField) >= 0 && parseInt(processedField) <= 6) {
    return `On ${DAY_OF_WEEK_NAMES[parseInt(processedField)]} (${processedField})`;
  }
  
  return `At ${fieldName} ${processedField}`;
};

/**
 * Calculate next execution times for a cron expression
 * @param {Array} cronParts - Array of cron expression parts
 * @param {number} count - Number of execution times to calculate
 * @returns {Array} Array of Date objects for next executions
 */
export const calculateNextExecutions = (cronParts, count = 5) => {
  const results = [];
  let currentDate = new Date();
  
  // Simple implementation for common cases
  // In a real app, you'd want a more robust cron parser library
  for (let i = 0; i < count; i++) {
    currentDate = getNextCronTime(currentDate, cronParts);
    results.push(new Date(currentDate));
    // Move forward 1 minute to find the next occurrence
    currentDate = new Date(currentDate.getTime() + 60000);
  }
  
  return results;
};

/**
 * Get the next cron execution time
 * @param {Date} startDate - Starting date
 * @param {Array} cronParts - Array of cron expression parts
 * @returns {Date} Next execution time
 */
export const getNextCronTime = (startDate, cronParts) => {
  // This is a simplified implementation
  // In a real app, use a dedicated library for accurate cron calculations
  
  const [minutesPart, hoursPart, dayOfMonthPart, monthPart, dayOfWeekPart] = cronParts;
  
  // Start with current date
  const result = new Date(startDate);
  result.setSeconds(0);
  result.setMilliseconds(0);
  
  // Always move at least 1 minute ahead
  result.setMinutes(result.getMinutes() + 1);
  
  // Check if the current time matches the cron expression
  // If not, increment until it does
  
  // This is a very simplified approach
  // For a production app, use a dedicated cron parser library
  
  // Adjust month if needed (1-12 in cron, 0-11 in JS Date)
  if (monthPart !== '*') {
    const validMonths = expandCronField(monthPart, 1, 12);
    while (!validMonths.includes(result.getMonth() + 1)) {
      result.setMonth(result.getMonth() + 1);
      result.setDate(1);
      result.setHours(0);
      result.setMinutes(0);
    }
  }
  
  // Adjust day of month
  if (dayOfMonthPart !== '*') {
    const validDays = expandCronField(dayOfMonthPart, 1, 31);
    while (!validDays.includes(result.getDate())) {
      result.setDate(result.getDate() + 1);
      result.setHours(0);
      result.setMinutes(0);
    }
  }
  
  // Adjust day of week
  if (dayOfWeekPart !== '*') {
    const validDaysOfWeek = expandCronField(dayOfWeekPart, 0, 6);
    while (!validDaysOfWeek.includes(result.getDay())) {
      result.setDate(result.getDate() + 1);
      result.setHours(0);
      result.setMinutes(0);
    }
  }
  
  // Adjust hours
  if (hoursPart !== '*') {
    const validHours = expandCronField(hoursPart, 0, 23);
    while (!validHours.includes(result.getHours())) {
      result.setHours(result.getHours() + 1);
      result.setMinutes(0);
    }
  }
  
  // Adjust minutes
  if (minutesPart !== '*') {
    const validMinutes = expandCronField(minutesPart, 0, 59);
    while (!validMinutes.includes(result.getMinutes())) {
      result.setMinutes(result.getMinutes() + 1);
    }
  }
  
  return result;
};

/**
 * Expand a cron field to all valid values
 * @param {string} field - Cron field value
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {Array} Array of valid values
 */
export const expandCronField = (field, min, max) => {
  if (field === '*') {
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }
  
  if (field.includes(',')) {
    return field.split(',').flatMap(part => expandCronField(part, min, max));
  }
  
  if (field.includes('-')) {
    const [start, end] = field.split('-').map(Number);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  
  if (field.includes('/')) {
    const [range, step] = field.split('/');
    const stepNum = parseInt(step);
    
    if (range === '*') {
      return Array.from({ length: Math.ceil((max - min + 1) / stepNum) }, (_, i) => min + i * stepNum)
        .filter(val => val <= max);
    } else {
      const expandedRange = expandCronField(range, min, max);
      return expandedRange.filter((_, i) => i % stepNum === 0);
    }
  }
  
  // Single value
  return [parseInt(field)];
};

/**
 * Generate a cron expression from form fields
 * @param {Object} fields - Form fields for cron expression
 * @returns {string} Generated cron expression
 */
export const generateCronExpression = (fields) => {
  if (!fields) return '* * * * *';
  
  return [
    fields.minutes.value,
    fields.hours.value,
    fields.dayOfMonth.value,
    fields.month.value,
    fields.dayOfWeek.value
  ].join(' ');
};

/**
 * Update a field's value based on its type
 * @param {Object} field - Field object
 * @param {string} type - New field type
 * @returns {Object} Updated field
 */
export const updateFieldValueByType = (field, type) => {
  const newField = { ...field, type };
  
  // Update the value based on the new type
  switch (type) {
    case 'every':
      newField.value = '*';
      break;
    case 'specific':
      newField.value = newField.specific;
      break;
    case 'range':
      newField.value = `${newField.range.start}-${newField.range.end}`;
      break;
    case 'every-n':
      newField.value = `*/${newField.every.step}`;
      break;
    case 'specific-every-n':
      newField.value = `${newField.every.start}/${newField.every.step}`;
      break;
    default:
      newField.value = '*';
  }
  
  return newField;
};

/**
 * Generate HTML for cron expression results
 * @param {string} expression - Cron expression
 * @param {Object} explanation - Explanation object
 * @param {Array} nextExecutions - Array of next execution times
 * @returns {string} HTML for results display
 */
export const generateResultsHtml = (expression, explanation, nextExecutions) => {
  return `
    <div class="cron-results">
      <div class="cron-expression-summary">
        <div class="expression-header">
          <h3>Cron Expression:</h3>
          <div class="expression-parts">
            <code>${expression}</code>
          </div>
        </div>
        
        <div class="expression-meaning">
          <p>This cron job will run:</p>
          <ul class="meaning-list">
            <li><strong>${explanation.minutes}</strong></li>
            <li><strong>${explanation.hours}</strong></li>
            <li><strong>${explanation.dayOfMonth}</strong></li>
            <li><strong>${explanation.month}</strong></li>
            <li><strong>${explanation.dayOfWeek}</strong></li>
          </ul>
        </div>
      </div>
      
      <div class="next-executions">
        <h3>Next Execution Times:</h3>
        <ul class="execution-list">
          ${(nextExecutions || []).map(date => {
            // Handle both Date objects and date strings (from localStorage)
            // This is important because Date objects get serialized to strings in localStorage
            let dateObj;
            if (date instanceof Date) {
              dateObj = date;
            } else if (typeof date === 'string' || typeof date === 'number') {
              dateObj = new Date(date);
            } else {
              return '<li><span class="execution-date">Invalid date format</span></li>';
            }
            
            // Check if date is valid
            if (!dateObj || isNaN(dateObj.getTime())) {
              return '<li><span class="execution-date">Invalid date</span></li>';
            }
            
            try {
              return `
            <li>
              <span class="execution-date">${dateObj.toLocaleDateString()}</span>
              <span class="execution-time">${dateObj.toLocaleTimeString()}</span>
            </li>
          `;
            } catch (e) {
              // Fallback if toLocaleDateString/toLocaleTimeString fail
              return `
            <li>
              <span class="execution-date">${dateObj.toISOString().split('T')[0]}</span>
              <span class="execution-time">${dateObj.toISOString().split('T')[1].split('.')[0]}</span>
            </li>
          `;
            }
          }).join('')}
        </ul>
      </div>
      
      <div class="cron-reference">
        <h3>Cron Format Reference:</h3>
        <div class="reference-table-wrapper">
          <table class="reference-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Range</th>
                <th>Special Characters</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Minutes</td>
                <td>0-59</td>
                <td rowspan="5">
                  <ul class="special-chars">
                    <li><code>*</code>: any value</li>
                    <li><code>,</code>: value list separator</li>
                    <li><code>-</code>: range of values</li>
                    <li><code>/</code>: step values</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td>Hours</td>
                <td>0-23</td>
              </tr>
              <tr>
                <td>Day of month</td>
                <td>1-31</td>
              </tr>
              <tr>
                <td>Month</td>
                <td>1-12 or JAN-DEC</td>
              </tr>
              <tr>
                <td>Day of week</td>
                <td>0-6 or SUN-SAT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
};

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
export const escapeHtml = (text) => {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};