/**
 * Main helper module for web-based Java applications
 * Imports and re-exports functions from specialized helpers
 */

// Import helpers for specific web Java app types
import { 
  getJ2EEDirectoryStructure, 
  getJ2EEAppTypeDescription, 
  createJ2EEApp,
  validateJ2EEDirectoryStructure
} from './WebJavaAppHelpers/J2EEApHelper';

import { 
  getSpringXmlDirectoryStructure, 
  getSpringXmlAppTypeDescription, 
  createSpringXmlApp,
  validateSpringXmlDirectoryStructure
} from './WebJavaAppHelpers/SpringXmlAppHelper';

import { 
  getSpringBootDirectoryStructure, 
  getSpringBootAppTypeDescription, 
  createSpringBootMavenApp,
  createSpringBootGradleApp,
  validateSpringBootDirectoryStructure
} from './WebJavaAppHelpers/SpringBootAppHelper';

/**
 * Returns the standard directory structure for web-based Java apps
 * 
 * @param {string} javaType - Java application type
 * @param {string} appName - Application name
 * @returns {string} Directory structure as a string
 */
export function getWebJavaDirectoryStructure(javaType, appName) {
  switch (javaType) {
    case 'j2ee':
      return getJ2EEDirectoryStructure(appName);
    case 'spring-xml':
      return getSpringXmlDirectoryStructure(appName);
    case 'spring-mvc':
      // Spring MVC is a special case of Spring XML with web components
      return getSpringXmlDirectoryStructure(appName); // Enhanced in the future
    case 'spring-boot-maven':
    case 'spring-boot-gradle':
      return getSpringBootDirectoryStructure(javaType, appName);
    default:
      return '';
  }
}

/**
 * Return a detailed description for web-based Java app types
 */
export function getWebJavaAppTypeDescription(javaType) {
  switch (javaType) {
    case 'j2ee':
      return getJ2EEAppTypeDescription();
    case 'spring-xml':
      return getSpringXmlAppTypeDescription();
    case 'spring-mvc':
      return `A Spring MVC web application using Java configuration. This template includes:

• Spring MVC controller structure
• Java-based Spring configuration
• JSP views with JSTL support
• CSS assets organization
• Web application deployment descriptor
• Controller unit tests with MockMVC
• Maven build configuration

This template is ideal for developing web applications using the Spring MVC framework with traditional JSP views.`;
    case 'spring-boot-maven':
    case 'spring-boot-gradle':
      return getSpringBootAppTypeDescription(javaType);
    default:
      return '';
  }
}

/**
 * Generates a web-based Java application
 * 
 * @param {Object} zip - JSZip instance
 * @param {string} javaType - Java application type
 * @param {Object} options - App generation options
 */
export function createWebJavaApp(zip, javaType, options) {
  switch (javaType) {
    case 'j2ee':
      createJ2EEApp(zip, options);
      break;
    case 'spring-xml':
      createSpringXmlApp(zip, options);
      break;
    case 'spring-mvc':
      // Spring MVC is a special case of Spring XML with web components
      // In the future, implement a dedicated createSpringMvcApp function
      createSpringXmlApp(zip, options);
      break;
    case 'spring-boot-maven':
      createSpringBootMavenApp(zip, options);
      break;
    case 'spring-boot-gradle':
      createSpringBootGradleApp(zip, options);
      break;
    default:
      // Default to J2EE if the type is not recognized
      createJ2EEApp(zip, options);
  }
}

/**
 * Validates if a custom directory structure meets the minimum requirements for a web-based Java app
 * 
 * @param {string} javaType - Java application type
 * @param {string} directoryStructure - Custom directory structure provided by user
 * @returns {Object} Validation result {valid: boolean, message: string}
 */
export function validateWebJavaDirectoryStructure(javaType, directoryStructure) {
  switch (javaType) {
    case 'j2ee':
      return validateJ2EEDirectoryStructure(directoryStructure);
    case 'spring-xml':
    case 'spring-mvc':
      return validateSpringXmlDirectoryStructure(directoryStructure);
    case 'spring-boot-maven':
    case 'spring-boot-gradle':
      return validateSpringBootDirectoryStructure(javaType, directoryStructure);
    default:
      return { valid: false, message: 'Unknown Java application type.' };
  }
}