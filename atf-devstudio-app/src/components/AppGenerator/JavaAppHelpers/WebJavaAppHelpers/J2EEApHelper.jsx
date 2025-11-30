/**
 * Helper functions for J2EE application generation
 */

/**
 * Returns the standard directory structure for J2EE application
 * 
 * @param {string} appName - Application name
 * @returns {string} Directory structure as a string
 */
export function getJ2EEDirectoryStructure(appName) {
    return `${appName}/
  ├── src/
  │   ├── main/
  │   │   ├── java/
  │   │   │   └── com/
  │   │   │       └── company/
  │   │   │           └── web/
  │   │   │               ├── servlets/
  │   │   │               │   └── HelloServlet.java
  │   │   │               └── ejb/
  │   │   │                   └── HelloBean.java
  │   │   └── webapp/
  │   │       ├── WEB-INF/
  │   │       │   └── web.xml
  │   │       └── index.jsp
  ├── test/
  │   └── java/
  │       └── com/
  │           └── company/
  │               └── web/
  │                   └── servlets/
  │                       └── HelloServletTest.java
  ├── README.md
  └── pom.xml`;
  }
  
  /**
   * Return a detailed description for J2EE app type
   */
  export function getJ2EEAppTypeDescription() {
    return `A Java Enterprise Edition web application with servlet support. This template includes:
  
  • Standard JEE web application structure
  • Servlet API implementation with HelloServlet
  • EJB component structure
  • Web deployment descriptor (web.xml)
  • JSP page for view rendering
  • Maven build configuration
  
  This template is suitable for traditional Java EE applications requiring servlet containers like Tomcat or full JEE servers like WildFly.`;
  }
  
  /**
   * Creates a J2EE web application
   */
  export function createJ2EEApp(zip, options) {
    const { appName, description, version, author } = options;
    
    // Create directory structure
    zip.folder(`${appName}/src/main/java/com/company/web/servlets`);
    zip.folder(`${appName}/src/main/java/com/company/web/ejb`);
    zip.folder(`${appName}/src/main/webapp/WEB-INF`);
    zip.folder(`${appName}/src/test/java/com/company/web/servlets`);
    
    // Add HelloServlet.java
    zip.file(`${appName}/src/main/java/com/company/web/servlets/HelloServlet.java`,
  `package com.company.web.servlets;
  
  import java.io.IOException;
  import javax.servlet.ServletException;
  import javax.servlet.annotation.WebServlet;
  import javax.servlet.http.HttpServlet;
  import javax.servlet.http.HttpServletRequest;
  import javax.servlet.http.HttpServletResponse;
  
  /**
   * Hello Servlet
   * ${description}
   * 
   * @author ${author || "Developer"}
   * @version ${version}
   */
  @WebServlet("/hello")
  public class HelloServlet extends HttpServlet {
      private static final long serialVersionUID = 1L;
      
      protected void doGet(HttpServletRequest request, HttpServletResponse response) 
              throws ServletException, IOException {
          request.setAttribute("message", "${description} - Hello World!");
          request.getRequestDispatcher("/index.jsp").forward(request, response);
      }
  }
  `);
    
    // Add HelloBean.java
    zip.file(`${appName}/src/main/java/com/company/web/ejb/HelloBean.java`,
  `package com.company.web.ejb;
  
  import javax.ejb.Stateless;
  
  /**
   * Hello EJB Bean
   * 
   * @author ${author || "Developer"}
   * @version ${version}
   */
  @Stateless
  public class HelloBean {
      
      public String getMessage() {
          return "${description} - Hello from EJB!";
      }
  }
  `);
    
    // Add web.xml
    zip.file(`${appName}/src/main/webapp/WEB-INF/web.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>
  <web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee 
                               http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
           version="4.0">
      <display-name>${appName}</display-name>
      <description>${description}</description>
      
      <welcome-file-list>
          <welcome-file>index.jsp</welcome-file>
      </welcome-file-list>
  </web-app>
  `);
    
    // Add index.jsp
    zip.file(`${appName}/src/main/webapp/index.jsp`,
  `<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>${appName}</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 40px;
              line-height: 1.6;
          }
          .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 5px;
          }
          h1 {
              color: #333;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <h1>${appName}</h1>
          <p>\${message}</p>
          <p>Welcome to the J2EE Web Application.</p>
      </div>
  </body>
  </html>
  `);
    
    // Add test class
    zip.file(`${appName}/src/test/java/com/company/web/servlets/HelloServletTest.java`,
  `package com.company.web.servlets;
  
  import org.junit.jupiter.api.BeforeEach;
  import org.junit.jupiter.api.Test;
  import static org.junit.jupiter.api.Assertions.*;
  
  // Mock imports would normally be here (e.g., Spring MVC Test or Mockito)
  
  public class HelloServletTest {
      
      private HelloServlet servlet;
      
      @BeforeEach
      public void setUp() {
          servlet = new HelloServlet();
      }
      
      @Test
      public void testServletInitialization() {
          assertNotNull(servlet);
      }
      
      // More tests would be added in a real implementation
  }
  `);
    
    // Add pom.xml
    zip.file(`${appName}/pom.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>
  <project xmlns="http://maven.apache.org/POM/4.0.0"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
      <modelVersion>4.0.0</modelVersion>
  
      <groupId>com.company</groupId>
      <artifactId>${appName}</artifactId>
      <version>${version}</version>
      <packaging>war</packaging>
  
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
              <groupId>javax.servlet</groupId>
              <artifactId>javax.servlet-api</artifactId>
              <version>4.0.1</version>
              <scope>provided</scope>
          </dependency>
          <dependency>
              <groupId>javax.ejb</groupId>
              <artifactId>javax.ejb-api</artifactId>
              <version>3.2.2</version>
              <scope>provided</scope>
          </dependency>
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
                  <artifactId>maven-war-plugin</artifactId>
                  <version>3.3.2</version>
              </plugin>
          </plugins>
      </build>
  </project>
  `);
  }
  
  /**
   * Validates if a custom directory structure meets the minimum requirements for a J2EE app
   */
  export function validateJ2EEDirectoryStructure(directoryStructure) {
    const requiredPaths = [
      'src/main/java',
      'src/main/webapp/WEB-INF/web.xml',
      'pom.xml'
    ];
    
    const missingPaths = [];
    
    for (const path of requiredPaths) {
      if (!directoryStructure.includes(path)) {
        missingPaths.push(path);
      }
    }
    
    if (missingPaths.length > 0) {
      return {
        valid: false,
        message: `The directory structure is missing required paths for a J2EE application: ${missingPaths.join(', ')}`
      };
    }
    
    return { valid: true, message: 'Directory structure is valid.' };
  }