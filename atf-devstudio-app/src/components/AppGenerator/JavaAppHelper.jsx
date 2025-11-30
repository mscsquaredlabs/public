/**
 * Main helper module for Java applications
 * Imports and re-exports functions from specialized helpers
 */

// Import helpers for specific Java app types
import { 
  getBasicJavaDirectoryStructure, 
  getBasicJavaAppTypeDescription, 
  createJavaCoreApp,
  createCliApp,
  validateBasicJavaDirectoryStructure
} from './JavaAppHelpers/BasicJavaAppHelper';

import { 
  getWebJavaDirectoryStructure, 
  getWebJavaAppTypeDescription, 
  createWebJavaApp,
  validateWebJavaDirectoryStructure
} from './JavaAppHelpers/WebJavaAppHelper';

// Import specialized Java app helpers
// These would be implemented in separate files like MicroservicesAppHelper.jsx
// For now, we'll add placeholder functions

/**
 * Return a complete directory structure for each Java app type
 */
export function getJavaDirectoryStructure(javaType, appName) {
  // Basic Java applications (Core, CLI)
  if (javaType === 'java-core' || javaType === 'cli-app') {
    return getBasicJavaDirectoryStructure(javaType, appName);
  }
  
  // Web-based Java applications (J2EE, Spring variants)
  if (['j2ee', 'spring-xml', 'spring-mvc', 'spring-boot-maven', 'spring-boot-gradle'].includes(javaType)) {
    return getWebJavaDirectoryStructure(javaType, appName);
  }
  
  // Future specialized applications
  switch (javaType) {
    case 'microservices':
      return getMicroservicesDirectoryStructure(appName);
    case 'hibernate':
      return getHibernateDirectoryStructure(appName);
    case 'desktop-app':
      return getDesktopAppDirectoryStructure(appName);
    default:
      return getBasicJavaDirectoryStructure('java-core', appName);
  }
}

/**
 * Return a one-liner describing each Java app type
 */
export function getJavaAppTypeDescription(javaType) {
  // Basic Java applications (Core, CLI)
  if (javaType === 'java-core' || javaType === 'cli-app') {
    return getBasicJavaAppTypeDescription(javaType);
  }
  
  // Web-based Java applications (J2EE, Spring variants)
  if (['j2ee', 'spring-xml', 'spring-mvc', 'spring-boot-maven', 'spring-boot-gradle'].includes(javaType)) {
    return getWebJavaAppTypeDescription(javaType);
  }
  
  // Future specialized applications
  switch (javaType) {
    case 'microservices':
      return "Multi-service architecture with Docker Compose";
    case 'hibernate':
      return "Hibernate ORM example with entity, DAO and cfg.xml";
    case 'desktop-app':
      return "A Swing desktop application with JFrame entry point";
    default:
      return "";
  }
}

/**
 * Generates Java application files
 * 
 * @param {Object} zip - JSZip instance
 * @param {string} javaType - Java application type
 * @param {Object} options - App generation options
 */
export const generateJavaApp = (zip, javaType, options) => {
  // Basic Java applications (Core, CLI)
  if (javaType === 'java-core') {
    createJavaCoreApp(zip, options);
    return;
  } else if (javaType === 'cli-app') {
    createCliApp(zip, options);
    return;
  }
  
  // Web-based Java applications (J2EE, Spring variants)
  if (['j2ee', 'spring-xml', 'spring-mvc', 'spring-boot-maven', 'spring-boot-gradle'].includes(javaType)) {
    createWebJavaApp(zip, javaType, options);
    return;
  }
  
  // Specialized applications (placeholder - to be moved to separate helper files)
  switch (javaType) {
    case 'microservices':
      createMicroservicesApp(zip, options);
      break;
    case 'hibernate':
      createHibernateApp(zip, options);
      break;
    case 'desktop-app':
      createDesktopApp(zip, options);
      break;
    default:
      // Default to Java Core if the type is not recognized
      createJavaCoreApp(zip, options);
  }
  
  // Add common files (README.md, .gitignore) if specified in options
  if (options.includeReadme) {
    addReadme(zip, javaType, options);
  }
  
  if (options.includeGitignore) {
    addGitignore(zip, javaType);
  }
};

/**
 * Validates if a custom directory structure meets the minimum requirements for a Java app type
 * 
 * @param {string} javaType - Java application type
 * @param {string} directoryStructure - Custom directory structure provided by user
 * @returns {Object} Validation result {valid: boolean, message: string}
 */
export function validateJavaDirectoryStructure(javaType, directoryStructure) {
  // Basic Java applications (Core, CLI)
  if (javaType === 'java-core' || javaType === 'cli-app') {
    return validateBasicJavaDirectoryStructure(javaType, directoryStructure);
  }
  
  // Web-based Java applications (J2EE, Spring variants)
  if (['j2ee', 'spring-xml', 'spring-mvc', 'spring-boot-maven', 'spring-boot-gradle'].includes(javaType)) {
    return validateWebJavaDirectoryStructure(javaType, directoryStructure);
  }
  
  // For other types, implement basic validation until specialized validators are created
  const requiredPaths = ['src/main/java', 'pom.xml'];
  const missingPaths = [];
  
  for (const path of requiredPaths) {
    if (!directoryStructure.includes(path)) {
      missingPaths.push(path);
    }
  }
  
  if (missingPaths.length > 0) {
    return {
      valid: false,
      message: `The directory structure is missing required paths for a Java application: ${missingPaths.join(', ')}`
    };
  }
  
  return { valid: true, message: 'Directory structure is valid.' };
}

/**
 * Add a README.md file to the application
 * 
 * @param {Object} zip - JSZip instance
 * @param {string} javaType - Java application type
 * @param {Object} options - App generation options
 */
function addReadme(zip, javaType, options) {
  const { appName, description, version } = options;
  
  // Create a basic README template
  let readmeContent = `# ${appName}\n\n${description}\n\n`;
  
  // Add specific sections based on app type
  switch (javaType) {
    case 'spring-boot-maven':
    case 'spring-boot-gradle':
      readmeContent += `## Getting Started\n\n`;
      readmeContent += `### Prerequisites\n\n`;
      readmeContent += `- Java JDK 11 or higher\n`;
      readmeContent += javaType === 'spring-boot-maven' 
        ? `- Maven 3.6+\n\n` 
        : `- Gradle 7.0+\n\n`;
      
      readmeContent += `### Running the Application\n\n`;
      readmeContent += javaType === 'spring-boot-maven'
        ? `\`\`\`bash\nmvn spring-boot:run\n\`\`\`\n\n`
        : `\`\`\`bash\n./gradlew bootRun\n\`\`\`\n\n`;
      
      readmeContent += `### Building the Application\n\n`;
      readmeContent += javaType === 'spring-boot-maven'
        ? `\`\`\`bash\nmvn clean package\n\`\`\`\n\n`
        : `\`\`\`bash\n./gradlew build\n\`\`\`\n\n`;
      
      readmeContent += `The application will be available at http://localhost:8080\n`;
      break;
      
    case 'microservices':
      readmeContent += `## Microservices Architecture\n\n`;
      readmeContent += `This project demonstrates a microservices architecture with the following components:\n\n`;
      readmeContent += `- API Gateway: Entry point for client requests\n`;
      readmeContent += `- Discovery Service: Service registry and discovery\n`;
      readmeContent += `- User Service: Manages user data\n`;
      readmeContent += `- Order Service: Handles order processing\n`;
      readmeContent += `- Payment Service: Processes payments\n\n`;
      
      readmeContent += `### Running with Docker Compose\n\n`;
      readmeContent += `\`\`\`bash\ndocker-compose up\n\`\`\`\n`;
      break;
      
    case 'hibernate':
      readmeContent += `## Hibernate ORM Application\n\n`;
      readmeContent += `This application demonstrates database operations using Hibernate ORM.\n\n`;
      readmeContent += `### Features\n\n`;
      readmeContent += `- Entity model with annotations\n`;
      readmeContent += `- DAO pattern for database operations\n`;
      readmeContent += `- In-memory H2 database for development\n\n`;
      
      readmeContent += `### Running the Application\n\n`;
      readmeContent += `\`\`\`bash\n`;
      readmeContent += `mvn clean compile exec:java -Dexec.mainClass="com.example.App"\n`;
      readmeContent += `\`\`\`\n`;
      break;
      
    case 'desktop-app':
      readmeContent += `## Desktop Application\n\n`;
      readmeContent += `A Java Swing desktop application.\n\n`;
      readmeContent += `### Running the Application\n\n`;
      readmeContent += `\`\`\`bash\n`;
      readmeContent += `mvn clean compile exec:java -Dexec.mainClass="com.example.ui.MainFrame"\n`;
      readmeContent += `\`\`\`\n`;
      break;
      
    default:
      readmeContent += `## Java Application\n\n`;
      readmeContent += `### Building\n\n`;
      readmeContent += `\`\`\`bash\n`;
      readmeContent += `mvn clean package\n`;
      readmeContent += `\`\`\`\n\n`;
      
      readmeContent += `### Running\n\n`;
      readmeContent += `\`\`\`bash\n`;
      readmeContent += `java -jar target/${appName}-${version}.jar\n`;
      readmeContent += `\`\`\`\n`;
  }
  
  // Add the README.md to the ZIP
  zip.file(`${appName}/README.md`, readmeContent);
}

/**
 * Add a .gitignore file to the application
 * 
 * @param {Object} zip - JSZip instance
 * @param {string} javaType - Java application type
 */
function addGitignore(zip, javaType) {
  const { appName } = { appName: 'app' }; // Default app name if not provided
  
  // Create a comprehensive .gitignore for Java projects
  const gitignoreContent = `# Compiled class files
*.class

# Log files
*.log

# Package files
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml

# Gradle
.gradle/
build/

# IntelliJ IDEA
.idea/
*.iml
*.iws
*.ipr

# Eclipse
.settings/
.classpath
.project
.metadata/

# VS Code
.vscode/

# OS-specific files
.DS_Store
Thumbs.db
`;
  
  // Add additional entries based on app type
  let additionalContent = '';
  
  if (javaType === 'spring-boot-maven' || javaType === 'spring-boot-gradle') {
    additionalContent += `
# Spring Boot
.spring-boot-devtools/
`;
  }
  
  // Add the .gitignore to the ZIP
  zip.file(`${appName}/.gitignore`, gitignoreContent + additionalContent);
}

// Placeholder functions for specialized app types
// These would ideally be moved to separate files

function getMicroservicesDirectoryStructure(appName) {
  return `${appName}/
├── api-gateway/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── example/
│   │       │           └── apigateway/
│   │       │               └── ApiGatewayApplication.java
│   │       └── resources/
│   │           └── application.yml
│   └── pom.xml
├── discovery-service/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── example/
│   │       │           └── discovery/
│   │       │               └── DiscoveryServiceApplication.java
│   │       └── resources/
│   │           └── application.yml
│   └── pom.xml
├── user-service/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── example/
│   │       │           └── userservice/
│   │       │               ├── UserServiceApplication.java
│   │       │               ├── controller/
│   │       │               │   └── UserController.java
│   │       │               └── model/
│   │       │                   └── User.java
│   │       └── resources/
│   │           └── application.yml
│   └── pom.xml
├── order-service/
│   └── ...
├── payment-service/
│   └── ...
├── README.md
└── docker-compose.yml`;
}

function getHibernateDirectoryStructure(appName) {
  return `${appName}/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           ├── App.java
│   │   │           ├── model/
│   │   │           │   └── User.java
│   │   │           └── dao/
│   │   │               └── UserDao.java
│   │   └── resources/
│   │       ├── hibernate.cfg.xml
│   │       └── sql/
│   │           └── schema.sql
├── test/
│   └── java/
│       └── com/
│           └── example/
│               └── dao/
│                   └── UserDaoTest.java
├── README.md
└── pom.xml`;
}

function getDesktopAppDirectoryStructure(appName) {
  return `${appName}/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           ├── ui/
│   │   │           │   ├── MainFrame.java
│   │   │           │   └── components/
│   │   │           │       └── CustomPanel.java
│   │   │           └── model/
│   │   │               └── AppModel.java
│   │   └── resources/
│   │       ├── images/
│   │       │   └── icon.png
│   │       └── application.properties
├── test/
│   └── java/
│       └── com/
│           └── example/
│               └── ui/
│                   └── MainFrameTest.java
├── README.md
└── pom.xml`;
}

function createMicroservicesApp(zip, options) {
  // This would be implemented in a separate MicroservicesAppHelper.jsx file
  // For now, we'll just create a placeholder structure
  const { appName, description } = options;
  
  // Create basic directory structure
  zip.folder(`${appName}/api-gateway/src/main/java/com/example/apigateway`);
  zip.folder(`${appName}/api-gateway/src/main/resources`);
  zip.folder(`${appName}/discovery-service/src/main/java/com/example/discovery`);
  zip.folder(`${appName}/discovery-service/src/main/resources`);
  zip.folder(`${appName}/user-service/src/main/java/com/example/userservice/controller`);
  zip.folder(`${appName}/user-service/src/main/java/com/example/userservice/model`);
  zip.folder(`${appName}/user-service/src/main/resources`);
  
  // Add docker-compose.yml
  zip.file(`${appName}/docker-compose.yml`, 
`version: '3.8'
services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      
  discovery-service:
    build: ./discovery-service
    ports:
      - "8761:8761"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      
  user-service:
    build: ./user-service
    environment:
      - SPRING_PROFILES_ACTIVE=docker
    depends_on:
      - discovery-service
`);
  
  // Add basic service files
  zip.file(`${appName}/api-gateway/src/main/java/com/example/apigateway/ApiGatewayApplication.java`,
`package com.example.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
`);
  
  // More files would be added here
}

function createHibernateApp(zip, options) {
  // This would be implemented in a separate HibernateAppHelper.jsx file
  // Placeholder implementation
  const { appName, description } = options;
  
  // Create basic directory structure
  zip.folder(`${appName}/src/main/java/com/example/model`);
  zip.folder(`${appName}/src/main/java/com/example/dao`);
  zip.folder(`${appName}/src/main/resources/sql`);
  zip.folder(`${appName}/src/test/java/com/example/dao`);
  
  // Add placeholder files
  zip.file(`${appName}/src/main/java/com/example/App.java`,
`package com.example;

// Placeholder
public class App {
    public static void main(String[] args) {
        System.out.println("${description} - Hibernate App");
    }
}
`);
}

function createDesktopApp(zip, options) {
  // This would be implemented in a separate DesktopAppHelper.jsx file
  // Placeholder implementation
  const { appName, description } = options;
  
  // Create basic directory structure
  zip.folder(`${appName}/src/main/java/com/example/ui/components`);
  zip.folder(`${appName}/src/main/java/com/example/model`);
  zip.folder(`${appName}/src/main/resources/images`);
  zip.folder(`${appName}/src/test/java/com/example/ui`);
  
  // Add placeholder files
  zip.file(`${appName}/src/main/java/com/example/ui/MainFrame.java`,
`package com.example.ui;

import javax.swing.*;

// Placeholder
public class MainFrame extends JFrame {
    public MainFrame() {
        setTitle("${description}");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }
    
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            new MainFrame().setVisible(true);
        });
    }
}
`);
}