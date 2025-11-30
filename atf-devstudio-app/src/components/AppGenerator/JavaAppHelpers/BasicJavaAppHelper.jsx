/**
 * Helper functions for basic Java application types (Core, CLI)
 */

/**
 * Returns the standard directory structure for basic Java apps
 * 
 * @param {string} javaType - Java application type
 * @param {string} appName - Application name
 * @returns {string} Directory structure as a string
 */
export function getBasicJavaDirectoryStructure(javaType, appName) {
  switch (javaType) {
    case 'java-core':
      return `${appName}/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           └── Main.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/
│           └── com/
│               └── example/
│                   └── MainTest.java
├── README.md
└── pom.xml`;
  
    case 'cli-app':
      return `${appName}/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           └── cli/
│   │   │               ├── Main.java
│   │   │               ├── command/
│   │   │               │   └── CommandHandler.java
│   │   │               └── util/
│   │   │                   └── ConfigLoader.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/
│           └── com/
│               └── example/
│                   └── cli/
│                       └── command/
│                           └── CommandHandlerTest.java
├── scripts/
│   └── run.sh
├── README.md
└── pom.xml`;
  
    default:
      return '';
  }
}
  
/**
 * Return a detailed description for basic Java app types
 */
export function getBasicJavaAppTypeDescription(javaType) {
  switch (javaType) {
    case 'java-core':
      return `A standard Java application with a simple main class. This template includes:

• Basic project structure with src/main/java and src/test/java directories
• Maven build configuration with pom.xml
• A Main class with a simple entry point
• Properties file for configuration
• JUnit test setup

This template is ideal for simple Java applications, utilities, or as a starting point for more complex projects.`;
  
    case 'cli-app':
      return `A command-line interface (CLI) application. This template includes:

• Main entry point for command processing
• Command handler pattern for organizing CLI commands
• Configuration loading utilities
• Properties file for application settings
• Shell script for easy execution
• Unit tests for command handlers
• Maven build configuration

This template is ideal for building command-line tools, utilities, or admin interfaces that run in terminal environments.`;
  
    default:
      return '';
  }
}
  
/**
 * Creates a basic Java Core application
 */
export function createJavaCoreApp(zip, options) {
  const { appName, description, version, author } = options;
  
  // Create directory structure
  zip.folder(`${appName}/src/main/java/com/example`);
  zip.folder(`${appName}/src/main/resources`);
  zip.folder(`${appName}/src/test/java/com/example`);
  
  // Add Main.java file
  zip.file(`${appName}/src/main/java/com/example/Main.java`, 
`package com.example;

/**
 * Main application class
 * ${description}
 * 
 * @author ${author || "Developer"}
 * @version ${version}
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("${description} - Hello World!");
    }
}
`);
  
  // Add application.properties
  zip.file(`${appName}/src/main/resources/application.properties`,
`# Application properties
app.name=${appName}
app.description=${description}
app.version=${version}
`);
  
  // Add test class
  zip.file(`${appName}/src/test/java/com/example/MainTest.java`,
`package com.example;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class MainTest {
    @Test
    public void testMain() {
        // Basic test to ensure the main method doesn't throw exceptions
        Main.main(new String[]{});
        assertTrue(true); // If we get here, the test passes
    }
}
`);
  
  // Add pom.xml
  zip.file(`${appName}/pom.xml`,
`<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>${appName}</artifactId>
    <version>${version}</version>
    <packaging>jar</packaging>

    <name>${appName}</name>
    <description>${description}</description>

    <properties>
        <java.version>11</java.version>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.8.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.10.1</version>
                <configuration>
                    <source>11</source>
                    <target>11</target>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.2.2</version>
                <configuration>
                    <archive>
                        <manifest>
                            <addClasspath>true</addClasspath>
                            <mainClass>com.example.Main</mainClass>
                        </manifest>
                    </archive>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
`);

  // Add README.md if not already included
  if (options.includeReadme !== false) {
    zip.file(`${appName}/README.md`,
`# ${appName}

${description}

## Overview

A simple Java application with a main class.

## Building

\`\`\`bash
mvn clean package
\`\`\`

## Running

\`\`\`bash
java -jar target/${appName}-${version}.jar
\`\`\`
`);
  }

  // Add .gitignore if not already included
  if (options.includeGitignore !== false) {
    zip.file(`${appName}/.gitignore`,
`# Compiled class files
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

# IDE files
.idea/
*.iml
.vscode/
.classpath
.project
.settings/

# OS-specific files
.DS_Store
Thumbs.db
`);
  }
}
  
/**
 * Creates a CLI Java application
 */
export function createCliApp(zip, options) {
  const { appName, description, version, author } = options;
  
  // Create directory structure
  zip.folder(`${appName}/src/main/java/com/example/cli/command`);
  zip.folder(`${appName}/src/main/java/com/example/cli/util`);
  zip.folder(`${appName}/src/main/resources`);
  zip.folder(`${appName}/src/test/java/com/example/cli/command`);
  zip.folder(`${appName}/scripts`);
  
  // Add Main.java
  zip.file(`${appName}/src/main/java/com/example/cli/Main.java`,
`package com.example.cli;

import java.util.Scanner;
import java.util.Properties;
import java.io.InputStream;
import com.example.cli.command.CommandHandler;
import com.example.cli.util.ConfigLoader;

/**
 * Main CLI application entry point
 * ${description}
 * 
 * @author ${author || "Developer"}
 * @version ${version}
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("${description}");
        System.out.println("---------------------------");
        
        try {
            // Load application properties
            ConfigLoader configLoader = new ConfigLoader();
            Properties properties = configLoader.loadProperties("application.properties");
            System.out.println("Application version: " + properties.getProperty("app.version"));
            
            // Initialize command handler
            CommandHandler commandHandler = new CommandHandler();
            
            // Simple CLI interface
            Scanner scanner = new Scanner(System.in);
            System.out.print("Enter a command (help, version, exit): ");
            String command = scanner.nextLine();
            
            while (!command.equalsIgnoreCase("exit")) {
                commandHandler.handleCommand(command);
                System.out.print("Enter a command (help, version, exit): ");
                command = scanner.nextLine();
            }
            
            System.out.println("Exiting application. Goodbye!");
            scanner.close();
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}
`);
  
  // Add CommandHandler.java
  zip.file(`${appName}/src/main/java/com/example/cli/command/CommandHandler.java`,
`package com.example.cli.command;

/**
 * Handler for CLI commands
 */
public class CommandHandler {
    
    public void handleCommand(String command) {
        switch (command.toLowerCase()) {
            case "help":
                showHelp();
                break;
            case "version":
                showVersion();
                break;
            default:
                System.out.println("Unknown command: " + command);
                showHelp();
        }
    }
    
    private void showHelp() {
        System.out.println("Available commands:");
        System.out.println("  help    - Show this help message");
        System.out.println("  version - Show application version");
        System.out.println("  exit    - Exit the application");
    }
    
    private void showVersion() {
        System.out.println("Application version: ${version}");
    }
}
`);
  
  // Add ConfigLoader.java
  zip.file(`${appName}/src/main/java/com/example/cli/util/ConfigLoader.java`,
`package com.example.cli.util;

import java.io.InputStream;
import java.util.Properties;

/**
 * Utility class for loading configuration
 */
public class ConfigLoader {
    
    public Properties loadProperties(String filename) throws Exception {
        Properties properties = new Properties();
        InputStream input = getClass().getClassLoader().getResourceAsStream(filename);
        
        if (input == null) {
            throw new Exception("Unable to find " + filename);
        }
        
        try {
            properties.load(input);
        } finally {
            input.close();
        }
        
        return properties;
    }
}
`);

  // Add application.properties
  zip.file(`${appName}/src/main/resources/application.properties`,
`# Application configuration
app.name=${appName}
app.version=${version}
app.description=${description}
`);

  // Add CommandHandlerTest.java
  zip.file(`${appName}/src/test/java/com/example/cli/command/CommandHandlerTest.java`,
`package com.example.cli.command;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class CommandHandlerTest {
    
    private CommandHandler commandHandler;
    
    @BeforeEach
    public void setUp() {
        commandHandler = new CommandHandler();
    }
    
    @Test
    public void testCommandHandlerInitialization() {
        assertNotNull(commandHandler);
    }
    
    // More tests would be added in a real implementation
}
`);

  // Add run.sh script
  zip.file(`${appName}/scripts/run.sh`,
`#!/bin/bash
# Run script for ${appName}
echo "Starting ${description}..."
java -jar ../target/${appName}-${version}.jar
`);

  // Add pom.xml
  zip.file(`${appName}/pom.xml`,
`<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>${appName}</artifactId>
    <version>${version}</version>
    <packaging>jar</packaging>

    <name>${appName}</name>
    <description>${description}</description>

    <properties>
        <java.version>11</java.version>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.8.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.10.1</version>
                <configuration>
                    <source>11</source>
                    <target>11</target>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.2.2</version>
                <configuration>
                    <archive>
                        <manifest>
                            <addClasspath>true</addClasspath>
                            <mainClass>com.example.cli.Main</mainClass>
                        </manifest>
                    </archive>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
`);

  // Add README.md if not already included
  if (options.includeReadme !== false) {
    zip.file(`${appName}/README.md`,
`# ${appName}

${description}

## Overview

A command-line interface application with command handling.

## Building

\`\`\`bash
mvn clean package
\`\`\`

## Running

\`\`\`bash
java -jar target/${appName}-${version}.jar
\`\`\`

Or use the provided script:

\`\`\`bash
cd scripts
./run.sh
\`\`\`
`);
  }

  // Add .gitignore if not already included
  if (options.includeGitignore !== false) {
    zip.file(`${appName}/.gitignore`,
`# Compiled class files
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

# IDE files
.idea/
*.iml
.vscode/
.classpath
.project
.settings/

# OS-specific files
.DS_Store
Thumbs.db
`);
  }
}

/**
 * Validates if a custom directory structure meets the minimum requirements for a basic Java app type
 * 
 * @param {string} javaType - Java application type
 * @param {string} directoryStructure - Custom directory structure provided by user
 * @returns {Object} Validation result {valid: boolean, message: string}
 */
export function validateBasicJavaDirectoryStructure(javaType, directoryStructure) {
  // Define required files/directories for each Java app type
  const requiredPaths = {
    'java-core': [
      'src/main/java', 
      'pom.xml'
    ],
    'cli-app': [
      'src/main/java',
      'src/main/resources',
      'pom.xml'
    ]
  };
  
  // Define recommended paths for warnings
  const recommendedPaths = {
    'java-core': [
      'src/main/resources',
      'src/test/java',
      'README.md',
      '.gitignore'
    ],
    'cli-app': [
      'src/test/java',
      'scripts/run.sh',
      'README.md',
      '.gitignore'
    ]
  };
  
  // Extract paths from directory structure
  const paths = extractPaths(directoryStructure);
  
  // Check for required paths
  const required = requiredPaths[javaType] || [];
  const missingPaths = [];
  
  for (const path of required) {
    if (!hasPath(paths, path)) {
      missingPaths.push(path);
    }
  }
  
  // Check for recommended paths for warnings
  const recommended = recommendedPaths[javaType] || [];
  const missingRecommended = [];
  
  for (const path of recommended) {
    if (!hasPath(paths, path)) {
      missingRecommended.push(path);
    }
  }
  
  if (missingPaths.length > 0) {
    return {
      valid: false,
      message: `The directory structure is missing required paths for a ${javaType} application: ${missingPaths.join(', ')}`,
      hasWarnings: missingRecommended.length > 0,
      warnings: missingRecommended.length > 0 
        ? `Consider adding these recommended paths: ${missingRecommended.join(', ')}`
        : null
    };
  }
  
  return { 
    valid: true, 
    message: 'Directory structure is valid.',
    hasWarnings: missingRecommended.length > 0,
    warnings: missingRecommended.length > 0 
      ? `Consider adding these recommended paths: ${missingRecommended.join(', ')}`
      : null
  };
}

/**
 * Extract paths from a directory structure string
 */
function extractPaths(directoryStructure) {
  const lines = directoryStructure.trim().split('\n');
  const paths = [];
  
  // Get app name from first line
  let appName = '';
  if (lines.length > 0) {
    appName = lines[0].trim().replace(/\/$/, '');
  }
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;
    
    // Remove tree characters
    line = line.replace(/[├└│├─]+/, '').trim();
    
    // Calculate depth based on original line indentation
    const originalLine = lines[i];
    const depth = (originalLine.length - originalLine.trimLeft().length) / 2;
    
    // Build path based on depth
    if (depth === 0) {
      // Root level
      paths.push(line);
    } else {
      // Find all parent directories
      let currentPath = line;
      let currentDepth = depth;
      
      // Walk up the tree to build the full path
      for (let j = i - 1; j >= 0 && currentDepth > 0; j--) {
        const prevLine = lines[j];
        const prevDepth = (prevLine.length - prevLine.trimLeft().length) / 2;
        
        // Found a parent directory
        if (prevDepth < currentDepth) {
          const parent = prevLine.replace(/[├└│├─]+/, '').trim();
          currentPath = `${parent}/${currentPath}`;
          currentDepth = prevDepth;
          
          // Reached root level
          if (prevDepth === 0) break;
        }
      }
      
      paths.push(currentPath);
      
      // Also add the path without the app name prefix to handle different formats
      if (currentPath.startsWith(`${appName}/`)) {
        paths.push(currentPath.substring(appName.length + 1));
      }
    }
  }
  
  return paths;
}

/**
 * Check if a specific path exists in the extracted paths
 */
function hasPath(paths, pathToFind) {
  // Check for exact match
  if (paths.includes(pathToFind)) {
    return true;
  }
  
  // Check for path within any parent directory
  for (const path of paths) {
    // If this is a file (contains a dot), check for exact match or with parent
    if (pathToFind.includes('.')) {
      const fileName = pathToFind.split('/').pop();
      if (path.endsWith(`/${fileName}`)) {
        return true;
      }
    } else {
      // For directories, check if included in path
      if (path === pathToFind || path.startsWith(`${pathToFind}/`) || path.includes(`/${pathToFind}/`)) {
        return true;
      }
    }
  }
  
  return false;
}