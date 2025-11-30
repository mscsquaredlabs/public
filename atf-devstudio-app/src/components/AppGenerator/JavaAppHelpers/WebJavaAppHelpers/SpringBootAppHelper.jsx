/**
 * Helper functions for Spring Boot application generation (Maven & Gradle)
 */

/**
 * Returns the standard directory structure for Spring Boot application
 * 
 * @param {string} javaType - Java application type (spring-boot-maven or spring-boot-gradle)
 * @param {string} appName - Application name
 * @returns {string} Directory structure as a string
 */
export function getSpringBootDirectoryStructure(javaType, appName) {
  if (javaType === 'spring-boot-maven') {
    return `${appName}/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           └── demo/
│   │   │               ├── DemoApplication.java
│   │   │               ├── controller/
│   │   │               │   └── HelloController.java
│   │   │               └── service/
│   │   │                   └── HelloService.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── static/
│   │       │   └── css/
│   │       │       └── main.css
│   │       └── templates/
│   │           └── index.html
├── test/
│   └── java/
│       └── com/
│           └── example/
│               └── demo/
│                   ├── DemoApplicationTests.java
│                   └── controller/
│                       └── HelloControllerTest.java
├── README.md
└── pom.xml`;
  } else if (javaType === 'spring-boot-gradle') {
    return `${appName}/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           ├── Application.java
│   │   │           ├── controller/
│   │   │           │   └── HelloController.java
│   │   │           └── service/
│   │   │               └── HelloService.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── static/
│   │       │   └── css/
│   │       │       └── style.css
│   │       └── templates/
│   │           └── hello.html
├── test/
│   └── java/
│       └── com/
│           └── example/
│               ├── ApplicationTests.java
│               └── controller/
│                   └── HelloControllerTest.java
├── README.md
├── build.gradle
└── settings.gradle`;
  }

  return '';
}

/**
 * Return a detailed description for Spring Boot app types
 */
export function getSpringBootAppTypeDescription(javaType) {
  if (javaType === 'spring-boot-maven') {
    return `A Spring Boot application with Maven build system. This template includes:

• Spring Boot main application class with auto-configuration
• REST controller implementation
• Service layer pattern
• Application properties configuration
• Static resources (CSS)
• Thymeleaf templates
• Spring Boot test framework setup
• Maven build with Spring Boot parent POM

This template provides everything needed for a modern Spring Boot application with Maven, ready for REST API development or web applications.`;
  } else if (javaType === 'spring-boot-gradle') {
    return `A Spring Boot application with Gradle build system. This template includes:

• Spring Boot main application with Gradle build
• YAML configuration instead of properties
• Controller and service layer implementation
• Thymeleaf templates and static resources
• Spring Boot test setup
• Gradle build scripts with dependencies

This template is ideal for teams that prefer Gradle over Maven for build automation, while leveraging Spring Boot's rapid development capabilities.`;
  }

  return '';
}

/**
 * Creates a Spring Boot Maven application
 */
export function createSpringBootMavenApp(zip, options) {
  const { appName, description, version, author } = options;
  
  // Create directory structure
  zip.folder(`${appName}/src/main/java/com/example/demo/controller`);
  zip.folder(`${appName}/src/main/java/com/example/demo/service`);
  zip.folder(`${appName}/src/main/resources/static/css`);
  zip.folder(`${appName}/src/main/resources/templates`);
  zip.folder(`${appName}/src/test/java/com/example/demo/controller`);
  
  // Add DemoApplication.java
  zip.file(`${appName}/src/main/java/com/example/demo/DemoApplication.java`,
`package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot Main Application
 * ${description}
 * 
 * @author ${author || "Developer"}
 * @version ${version}
 */
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
`);
  
  // Add HelloController.java
  zip.file(`${appName}/src/main/java/com/example/demo/controller/HelloController.java`,
`package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import com.example.demo.service.HelloService;

/**
 * Controller handling web requests
 */
@Controller
public class HelloController {
    
    private final HelloService helloService;
    
    @Autowired
    public HelloController(HelloService helloService) {
        this.helloService = helloService;
    }
    
    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("message", helloService.getMessage());
        model.addAttribute("appName", "${appName}");
        return "index";
    }
}
`);
  
  // Add HelloService.java
  zip.file(`${appName}/src/main/java/com/example/demo/service/HelloService.java`,
`package com.example.demo.service;

import org.springframework.stereotype.Service;

/**
 * Service providing business logic
 */
@Service
public class HelloService {
    
    public String getMessage() {
        return "${description} - Hello from Spring Boot!";
    }
}
`);
  
  // Add application.properties
  zip.file(`${appName}/src/main/resources/application.properties`,
`# Application configuration
spring.application.name=${appName}
server.port=8080

# Thymeleaf settings
spring.thymeleaf.cache=false

# Application info
app.description=${description}
app.version=${version}
`);
  
  // Add index.html
  zip.file(`${appName}/src/main/resources/templates/index.html`,
`<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title th:text="\${appName}">Spring Boot App</title>
    <link rel="stylesheet" th:href="@{/css/main.css}">
</head>
<body>
    <div class="container">
        <h1 th:text="\${appName}">App Name</h1>
        <div class="message">
            <p th:text="\${message}">Welcome message goes here</p>
        </div>
        <p>Welcome to your Spring Boot application!</p>
    </div>
</body>
</html>
`);
  
  // Add main.css
  zip.file(`${appName}/src/main/resources/static/css/main.css`,
`body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
}

.container {
    max-width: 800px;
    margin: 40px auto;
    padding: 20px;
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

h1 {
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

.message {
    background-color: #f9f9f9;
    border-left: 3px solid #4caf50;
    padding: 15px;
    margin: 20px 0;
}
`);
  
  // Add test classes
  zip.file(`${appName}/src/test/java/com/example/demo/DemoApplicationTests.java`,
`package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class DemoApplicationTests {

    @Test
    void contextLoads() {
        // Tests that the Spring context loads successfully
    }
}
`);
  
  zip.file(`${appName}/src/test/java/com/example/demo/controller/HelloControllerTest.java`,
`package com.example.demo.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import com.example.demo.service.HelloService;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@WebMvcTest(HelloController.class)
public class HelloControllerTest {

    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private HelloService helloService;
    
    @Test
    public void testHomePage() throws Exception {
        when(helloService.getMessage()).thenReturn("Test Message");
        
        mockMvc.perform(get("/"))
            .andExpect(status().isOk())
            .andExpect(view().name("index"));
    }
}
`);
  
  // Add pom.xml
  zip.file(`${appName}/pom.xml`,
`<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.5</version>
        <relativePath/>
    </parent>
    
    <groupId>com.example</groupId>
    <artifactId>${appName}</artifactId>
    <version>${version}</version>
    <name>${appName}</name>
    <description>${description}</description>
    
    <properties>
        <java.version>11</java.version>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
`);
}

/**
 * Creates a Spring Boot Gradle application
 */
export function createSpringBootGradleApp(zip, options) {
  const { appName, description, version, author } = options;
  
  // Create directory structure
  zip.folder(`${appName}/src/main/java/com/example/controller`);
  zip.folder(`${appName}/src/main/java/com/example/service`);
  zip.folder(`${appName}/src/main/resources/static/css`);
  zip.folder(`${appName}/src/main/resources/templates`);
  zip.folder(`${appName}/src/test/java/com/example/controller`);
  
  // Add Application.java
  zip.file(`${appName}/src/main/java/com/example/Application.java`,
`package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot Main Application
 * ${description}
 * 
 * @author ${author || "Developer"}
 * @version ${version}
 */
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
`);
  
  // Add HelloController.java
  zip.file(`${appName}/src/main/java/com/example/controller/HelloController.java`,
`package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import com.example.service.HelloService;

/**
 * Controller handling web requests
 */
@Controller
public class HelloController {
    
    private final HelloService helloService;
    
    @Autowired
    public HelloController(HelloService helloService) {
        this.helloService = helloService;
    }
    
    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("message", helloService.getMessage());
        model.addAttribute("appName", "${appName}");
        return "hello";
    }
}
`);
  
  // Add HelloService.java
  zip.file(`${appName}/src/main/java/com/example/service/HelloService.java`,
`package com.example.service;

import org.springframework.stereotype.Service;

/**
 * Service providing business logic
 */
@Service
public class HelloService {
    
    public String getMessage() {
        return "${description} - Hello from Spring Boot with Gradle!";
    }
}
`);
  
  // Add application.yml
  zip.file(`${appName}/src/main/resources/application.yml`,
`spring:
  application:
    name: ${appName}
  thymeleaf:
    cache: false

server:
  port: 8080

app:
  description: ${description}
  version: ${version}
`);
  
  // Add hello.html
  zip.file(`${appName}/src/main/resources/templates/hello.html`,
`<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title th:text="\${appName}">Spring Boot App</title>
    <link rel="stylesheet" th:href="@{/css/style.css}">
</head>
<body>
    <div class="container">
        <h1 th:text="\${appName}">App Name</h1>
        <div class="message">
            <p th:text="\${message}">Welcome message goes here</p>
        </div>
        <p>Welcome to your Spring Boot Gradle application!</p>
    </div>
</body>
</html>
`);
  
  // Add style.css
  zip.file(`${appName}/src/main/resources/static/css/style.css`,
`body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
}

.container {
    max-width: 800px;
    margin: 40px auto;
    padding: 20px;
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

h1 {
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

.message {
    background-color: #f9f9f9;
    border-left: 3px solid #4caf50;
    padding: 15px;
    margin: 20px 0;
}
`);
  
  // Add test classes
  zip.file(`${appName}/src/test/java/com/example/ApplicationTests.java`,
`package com.example;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ApplicationTests {

    @Test
    void contextLoads() {
        // Tests that the Spring context loads successfully
    }
}
`);
  
  zip.file(`${appName}/src/test/java/com/example/controller/HelloControllerTest.java`,
`package com.example.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import com.example.service.HelloService;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@WebMvcTest(HelloController.class)
public class HelloControllerTest {

    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private HelloService helloService;
    
    @Test
    public void testHomePage() throws Exception {
        when(helloService.getMessage()).thenReturn("Test Message");
        
        mockMvc.perform(get("/"))
            .andExpect(status().isOk())
            .andExpect(view().name("hello"));
    }
}
`);
  
  // Add build.gradle
  zip.file(`${appName}/build.gradle`,
`plugins {
    id 'org.springframework.boot' version '2.7.5'
    id 'io.spring.dependency-management' version '1.0.15.RELEASE'
    id 'java'
}

group = 'com.example'
version = '${version}'
sourceCompatibility = '11'

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
    developmentOnly 'org.springframework.boot:spring-boot-devtools'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

test {
    useJUnitPlatform()
}
`);
  
  // Add settings.gradle
  zip.file(`${appName}/settings.gradle`,
`rootProject.name = '${appName}'
`);
}

/**
 * Validates if a custom directory structure meets the minimum requirements for a Spring Boot app
 */
export function validateSpringBootDirectoryStructure(javaType, directoryStructure) {
  let requiredPaths = [];
  
  if (javaType === 'spring-boot-maven') {
    requiredPaths = [
      'src/main/java',
      'src/main/resources',
      'pom.xml'
    ];
  } else if (javaType === 'spring-boot-gradle') {
    requiredPaths = [
      'src/main/java',
      'src/main/resources',
      'build.gradle'
    ];
  }
  
  const missingPaths = [];
  
  for (const path of requiredPaths) {
    if (!directoryStructure.includes(path)) {
      missingPaths.push(path);
    }
  }
  
  if (missingPaths.length > 0) {
    return {
      valid: false,
      message: `The directory structure is missing required paths for a Spring Boot application: ${missingPaths.join(', ')}`
    };
  }
  
  return { valid: true, message: 'Directory structure is valid.' };
}