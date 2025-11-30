/**
 * xml-utils.js
 * Utility functions for XML formatting, conversion, and display
 */

// Helper to escape HTML/XML characters
export const escapeXml = (unsafe) => {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

/**
 * Convert XML to JSON
 * @param {string} xml - XML string to convert
 * @returns {Object} JSON representation of the XML
 */
export const xmlToJson = (xml) => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        
        // Check for parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error(parserError.textContent);
        }
        
        // Function to convert XML node to JSON
        const convertNodeToJson = (node) => {
            // Create an empty object
            let obj = {};
            
            // If this is a text node, just return its value
            if (node.nodeType === 3) {
                return node.nodeValue.trim();
            }
            
            // Add attributes if there are any
            if (node.attributes && node.attributes.length > 0) {
                obj['@attributes'] = {};
                for (let i = 0; i < node.attributes.length; i++) {
                    const attribute = node.attributes[i];
                    obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
                }
            }
            
            // Process child nodes
            let hasTextContent = false;
            let textContent = '';
            const childNodes = [];
            
            for (let i = 0; i < node.childNodes.length; i++) {
                const childNode = node.childNodes[i];
                
                if (childNode.nodeType === 3) { // Text node
                    const text = childNode.nodeValue.trim();
                    if (text) {
                        hasTextContent = true;
                        textContent += text;
                    }
                } else if (childNode.nodeType === 1) { // Element node
                    childNodes.push(childNode);
                }
            }
            
            // If node has text content and no other child elements
            if (hasTextContent && childNodes.length === 0) {
                if (Object.keys(obj).length === 0) {
                    return textContent; // Just return the text if no attributes
                } else {
                    obj['#text'] = textContent; // Add text as a property
                    return obj;
                }
            }
            
            // Process child elements
            childNodes.forEach(childNode => {
                const childJson = convertNodeToJson(childNode);
                
                if (obj[childNode.nodeName] !== undefined) {
                    // If property already exists, convert it to an array
                    if (!Array.isArray(obj[childNode.nodeName])) {
                        obj[childNode.nodeName] = [obj[childNode.nodeName]];
                    }
                    obj[childNode.nodeName].push(childJson);
                } else {
                    obj[childNode.nodeName] = childJson;
                }
            });
            
            return obj;
        };
        
        // Start conversion from the root element
        const rootElement = xmlDoc.documentElement;
        const result = {};
        result[rootElement.nodeName] = convertNodeToJson(rootElement);
        
        return result;
    } catch (error) {
        throw error;
    }
};

/**
 * Convert XML to YAML
 * @param {string} xml - XML string to convert
 * @param {string} indentChar - Character(s) for indentation
 * @returns {string} YAML representation of the XML
 */
export const xmlToYaml = (xml, indentChar = '  ') => {
    // First convert XML to JSON
    const jsonObj = xmlToJson(xml);
    
    // Then use a function to convert JSON to YAML
    const jsonToYaml = (obj, indentLevel = 0, isListItem = false) => {
        const currentIndent = indentChar.repeat(indentLevel);
        let yaml = '';

        if (obj === null) {
            return 'null\n';
        }
        if (Array.isArray(obj)) {
            if (obj.length === 0) return '[]\n';
            obj.forEach(item => {
                // Add the list item marker '- '
                yaml += `${currentIndent}- `;
                const valueYaml = jsonToYaml(item, indentLevel + 1, true);

                if (typeof item === 'object' && item !== null) {
                     yaml += "\n" + valueYaml;
                } else {
                    yaml += valueYaml.trimEnd() + '\n';
                }
            });
            yaml = yaml.trimEnd() + '\n';
        } else if (typeof obj === 'object') {
            if (Object.keys(obj).length === 0) return '{}\n';
            let firstKey = true;
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                const keyIndent = (isListItem && firstKey) ? '' : currentIndent;
                yaml += `${keyIndent}${key}: `;
                firstKey = false;

                const valueYaml = jsonToYaml(value, indentLevel + 1, false);

                if (typeof value === 'object' && value !== null) {
                     yaml += "\n" + valueYaml;
                } else {
                    yaml += valueYaml.trimEnd() + '\n';
                }
            });
            yaml = yaml.trimEnd() + '\n';
        } else if (typeof obj === 'string') {
            if (obj.includes(': ') || obj.includes('#') || obj.match(/^[\s\-]/) || /^\d/.test(obj) || ['true', 'false', 'null', 'yes', 'no', 'on', 'off', '', '{}', '[]'].includes(obj.toLowerCase())) {
                yaml += `"${obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"\n`;
            } else if (obj.includes('\n')) {
                yaml += '|\n';
                obj.split('\n').forEach(line => {
                    yaml += `${currentIndent}${indentChar}${line}\n`;
                });
            }
            else {
                yaml += `${obj}\n`;
            }
        } else {
            yaml += `${obj}\n`;
        }

        if (indentLevel === 0) yaml = yaml.trimEnd();
        return yaml;
    };
    
    return jsonToYaml(jsonObj);
};

/**
 * Create HTML form representation of XML
 * @param {string} xml - XML string to convert
 * @returns {string} HTML form representation
 */
export const xmlToHtmlForm = (xml) => {
    try {
        // First convert XML to JSON for easier processing
        const jsonObj = xmlToJson(xml);
        
        // Format title from a key
        const formatTitle = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        
        // Helper to find a potential display name/id within an object
        const findDisplayName = (item) => {
            if (typeof item !== 'object' || item === null) return null;
            const commonKeys = ['name', 'title', 'label', 'id', 'key'];
            for (const key of commonKeys) {
                if (typeof item[key] === 'string' || typeof item[key] === 'number') {
                    return item[key];
                }
            }
            return null;
        };
        
        // Function to recursively build form HTML
        const buildFormHtml = (obj, parentKey = '', isRoot = true) => {
            let formHtml = '';
            
            if (Array.isArray(obj)) {
                const legend = parentKey ? formatTitle(parentKey) : 'Array';
                formHtml += `<fieldset class="json-fieldset"><legend>${escapeXml(legend)}</legend>`;
                obj.forEach((item, index) => {
                    if (typeof item !== 'object' || item === null) {
                        // Handle primitive values
                        const currentKey = `${parentKey}[${index}]`;
                        const itemLabel = `${formatTitle(parentKey.slice(0,-1) || 'Item')} ${index + 1}`;
                        formHtml += `<div class="form-group array-primitive-item">`;
                        formHtml += `<label for="${escapeXml(currentKey)}">${escapeXml(itemLabel)}:</label>`;
                        formHtml += `<input type="text" id="${escapeXml(currentKey)}" name="${escapeXml(currentKey)}" value="${escapeXml(item)}" disabled>`;
                        formHtml += `</div>`;
                    } else {
                        // Objects within arrays
                        const displayName = findDisplayName(item);
                        const singularParentKey = (typeof parentKey === 'string' && parentKey.length > 0) ? parentKey.slice(0, -1) : 'Item';
                        const itemHeader = displayName ? `${formatTitle(singularParentKey)} : ${escapeXml(displayName)}` : `${formatTitle(singularParentKey)} ${index + 1}`;
                        
                        formHtml += `<div class="array-item">`;
                        formHtml += `<div class="array-item-header">${itemHeader}</div>`;
                        formHtml += buildFormHtml(item, `${parentKey}[${index}]`, false);
                        formHtml += `</div>`;
                    }
                });
                formHtml += `</fieldset>`;
            } else if (typeof obj === 'object' && obj !== null) {
                // Only add fieldset if it's a nested object
                const needsFieldset = !isRoot && parentKey && !parentKey.endsWith(']');
                if (needsFieldset) {
                    formHtml += `<fieldset class="json-fieldset"><legend>${escapeXml(formatTitle(parentKey))}</legend>`;
                }
                
                Object.keys(obj).forEach(key => {
                    const value = obj[key];
                    // Skip @attributes objects at root level in display
                    if (key === '@attributes' && isRoot) return;
                    
                    // Construct unique key for inputs based on nesting
                    const currentKey = parentKey ? `${parentKey}.${key}` : key;
                    const formattedLabel = formatTitle(key);
                    
                    if (typeof value === 'object' && value !== null) {
                        // Recursive call for nested object/array
                        formHtml += buildFormHtml(value, key, false);
                    } else {
                        formHtml += `<div class="form-group">`;
                        formHtml += `<label for="${escapeXml(currentKey)}">${escapeXml(formattedLabel)}:</label>`;
                        
                        let inputType = 'text';
                        let inputValue = value;
                        if (typeof value === 'number') inputType = 'number';
                        if (typeof value === 'boolean') inputType = 'checkbox';
                        if (value === null) inputValue = '';
                        
                        if (inputType === 'checkbox') {
                            formHtml += `<input type="checkbox" id="${escapeXml(currentKey)}" name="${escapeXml(currentKey)}" ${value ? 'checked' : ''} disabled>`;
                        } else {
                            formHtml += `<input type="${inputType}" id="${escapeXml(currentKey)}" name="${escapeXml(currentKey)}" value="${escapeXml(inputValue)}" disabled>`;
                        }
                        
                        formHtml += `</div>`;
                    }
                });
                
                if (needsFieldset) {
                    formHtml += `</fieldset>`;
                }
            }
            
            // Wrap root call result in the form container class
            if (isRoot && typeof obj === 'object' && obj !== null) {
                return `<div class="json-form">${formHtml}</div>`;
            }
            
            return formHtml;
        };
        
        // Start building the form from the root JSON object
        return buildFormHtml(jsonObj);
    } catch (error) {
        throw error;
    }
};

/**
 * XML Minification function
 * Parses an XML string, serializes it (which normalizes some whitespace),
 * then applies regexes to remove comments, processing instructions,
 * and various whitespace patterns around tags and the document edges.
 *
 * @param {string} xml - XML string to minify
 * @returns {string} Minified XML
 * @throws {Error} Throws an error if the XML is invalid.
 */
export const minifyXml = (xml) => {
    try {
        // Use DOMParser to handle potential XML structure issues gracefully
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");

        // Check for parsing errors. parsererror is standard in modern browsers.
        // Check the root element tag name for consistency as well.
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
             // Provide a more informative error message if possible
            const errorText = parserError.textContent || 'Unknown XML parsing error';
            console.error("XML Parsing Error:", errorText, "\nOriginal XML snippet:", xml.substring(0, 200) + '...'); // Log error details
            throw new Error(`Failed to parse XML: ${errorText}`);
        }

        // Check if the root element is actually an element (and not e.g., just text or a comment)
         if (!xmlDoc.documentElement) {
             throw new Error("Parsed document does not contain a root element.");
         }

        // Serialize the DOM back to a string. This handles entities correctly
        // and removes some inconsequential whitespace, but usually keeps indentation.
        const serializer = new XMLSerializer();
        let xmlString = serializer.serializeToString(xmlDoc);

        // --- Apply further minification using regex ---

        // 1. Remove XML declaration (<?xml ... ?>) - Common minification step
        xmlString = xmlString.replace(/^<\?xml[\s\S]*?\?>/, '');

        // 2. Remove Processing Instructions (<? ... ?>) except XML declaration (handled above)
        xmlString = xmlString.replace(/<\?[\s\S]*?\?>/g, '');

        // 3. Remove Comments () - Already present, kept
        //xmlString = xmlString.replace(//g, '');
        xmlString = xmlString.replace(/<!--[\s\S]*?-->/g, '');

        // 4. Remove whitespace between any two tags (> <)
        // This handles cases like `</tag>\n<another>` -> `</tag><another>`
        xmlString = xmlString.replace(/>\s*</g, '><'); // Use \s* for zero or more whitespace

        // 5. Remove leading/trailing whitespace inside elements where it's just around tags
        // This handles cases like `<tag> <child/> </tag>` -> `<tag><child/></tag>`
        // Or `<tag>\n text \n</tag>` -> `<tag>text</tag>` (if 'text' has spaces)
        // More aggressively, remove whitespace after '>' and before '<'
        xmlString = xmlString.replace(/>\s+/g, '>'); // Remove one or more whitespace after '>'
        xmlString = xmlString.replace(/\s+<|(?<!>)\s+$/g, '<'); // Remove one or more whitespace before '<' or at the end if not preceded by '>'

         // 6. Trim leading/trailing whitespace from the entire document string
        xmlString = xmlString.trim();


        return xmlString;

    } catch (error) {
        // Re-throw the caught error after potentially logging it
        console.error("Error during XML minification:", error);
        throw error;
    }
};

/**
 * Format XML with proper indentation
 * @param {string} xml - XML string to format
 * @param {number} indentSpaces - Number of spaces for indentation
 * @returns {string} Formatted XML
 */
export const formatXml = (xml, indentSpaces = 2) => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        
        // Check for parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error(parserError.textContent);
        }
        
        // Convert to string with indentation
        const serializer = new XMLSerializer();
        let xmlString = serializer.serializeToString(xmlDoc);
        
        // Better XML formatting with more thorough replacements
        let formattedXml = '';
        let indentLevel = 0;
        let inTag = false;
        let inContent = false;
        
        // Split by < and > to handle tags better
        const parts = xmlString.split(/(<[^>]*>)/);
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            
            if (!part) continue; // Skip empty parts
            
            if (part.startsWith('</')) {
                // Closing tag - decrease indent before adding
                indentLevel--;
                formattedXml += '\n' + ' '.repeat(indentLevel * indentSpaces) + part;
            } else if (part.startsWith('<') && part.endsWith('/>')) {
                // Self-closing tag - same indent level
                formattedXml += '\n' + ' '.repeat(indentLevel * indentSpaces) + part;
            } else if (part.startsWith('<')) {
                // Opening tag - add at current indent and then increase
                formattedXml += '\n' + ' '.repeat(indentLevel * indentSpaces) + part;
                if (!part.startsWith('<?') && !part.startsWith('<!')) {
                    // Don't increase indent for XML declarations or comments
                    indentLevel++;
                }
            } else {
                // Text content - add without newline if it's not just whitespace
                const trimmed = part.trim();
                if (trimmed) {
                    formattedXml += trimmed;
                }
            }
        }
        
        // Trim leading/trailing whitespace
        return formattedXml.trim();
    } catch (error) {
        throw error;
    }
};

/**
 * Generate XML syntax-highlighted HTML
 * @param {string} xml - XML string to highlight
 * @returns {string} HTML with syntax highlighting
 */
export const xmlToHtml = (xml) => {
    const highlightedXml = escapeXml(xml)
        .replace(/(&lt;\?xml.*?\?&gt;)/g, '<span class="xml-declaration">$1</span>') // Declaration
        .replace(/(&lt;!--.*?--&gt;)/gs, '<span class="xml-comment">$1</span>') // Comments
        .replace(/(&lt;)(\/?)([^!&gt;\s]+)(.*?)?(&gt;)/g, // Match tags
            (match, lt, slash, tagName, attrs, gt) =>
                `${lt}${slash}<span class="tag">${tagName}</span>${
                    (attrs || '').replace(/([\w-]+)=&quot;(.*?)&quot;/g, // Match attributes
                     ' <span class="attribute">$1</span>=<span class="attribute-value">&quot;$2&quot;</span>'
                    )
                }${gt}`
        );
    
    return highlightedXml;
};

/**
 * Simple XML validation
 * @param {string} xml - XML string to validate
 * @returns {Object} Validation result with status and error message if applicable
 */
export const validateXml = (xml) => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        
        // Check for parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error(parserError.textContent);
        }
        
        return { 
            valid: true,
            xmlDoc
        };
    } catch (error) {
        return {
            valid: false,
            error: error.message
        };
    }
};