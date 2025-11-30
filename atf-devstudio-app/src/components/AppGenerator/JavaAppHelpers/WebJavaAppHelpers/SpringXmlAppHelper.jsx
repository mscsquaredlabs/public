/**
 * Helper functions for Spring XML application generation
 */

/**
 * Returns the standard directory structure for Spring XML application
 * 
 * @param {string} appName - Application name
 * @returns {string} Directory structure as a string
 */
export function getSpringXmlDirectoryStructure(appName) {
    return `${appName}/
  ├── src/
  │   ├── main/
  │   │   ├── java/
  │   │   │   └── com/
  │   │   │       └── example/
  │   │   │           ├── App.java
  │   │   │           ├── service/
  │   │   │           │   └── HelloService.java
  │   │   │           └── model/
  │   │   │               └── Message.java
  │   │   └── resources/
  │   │       └── spring-config.xml
  ├── test/
  │   └── java/
  │       └── com/
  │           └── example/
  │               └── service/
  │                   └── HelloServiceTest.java
  ├── README.md
  └── pom.xml`;
  }
  
  /**
   * Return a detailed description for Spring XML app type
   */
  export function getSpringXmlAppTypeDescription() {
    return `A Spring Framework application using XML-based configuration. This template includes:
  
  • Core Spring application structure
  • XML-based Spring context configuration
  • Service layer implementation
  • Model classes for business objects
  • Maven build configuration
  • Unit test setup with Spring Test
  
  This template is useful for Spring applications that prefer XML configuration over annotations, often used in enterprise settings with existing XML configurations.`;
  }
  
  /**
   * Creates a Spring with XML configuration application
   */
  export function createSpringXmlApp(zip, options) {
    const { appName, description, version, author } = options;
    
    // Create directory structure
    zip.folder(`${appName}/src/main/java/com/example/service`);
    zip.folder(`${appName}/src/main/java/com/example/model`);
    zip.folder(`${appName}/src/main/resources`);
    zip.folder(`${appName}/src/test/java/com/example/service`);
    
    // Add App.java
    zip.file(`${appName}/src/main/java/com/example/App.java`,
  `package com.example;
  
  import org.springframework.context.ApplicationContext;
  import org.springframework.context.support.ClassPathXmlApplicationContext;
  import com.example.service.HelloService;
  
  /**
   * Main Application with Spring XML Configuration
   * ${description}
   * 
   * @author ${author || "Developer"}
   * @version ${version}
   */
  public class App {
      public static void main(String[] args) {
          // Initialize Spring context with XML configuration
          ApplicationContext context = new ClassPathXmlApplicationContext("spring-config.xml");
          
          // Get service bean from context
          HelloService helloService = context.getBean(HelloService.class);
          
          // Output message
          System.out.println(helloService.getMessage());
      }
  }
  `);
    
    // Add HelloService.java
    zip.file(`${appName}/src/main/java/com/example/service/HelloService.java`,
  `package com.example.service;
  
  import com.example.model.Message;
  
  /**
   * Service class for providing hello message
   */
  public class HelloService {
      
      private Message message;
      
      public void setMessage(Message message) {
          this.message = message;
      }
      
      public String getMessage() {
          return message.getContent();
      }
  }
  `);
    
    // Add Message.java
    zip.file(`${appName}/src/main/java/com/example/model/Message.java`,
  `package com.example.model;
  
  /**
   * Model class representing a message
   */
  public class Message {
      
      private String content;
      
      public String getContent() {
          return content;
      }
      
      public void setContent(String content) {
          this.content = content;
      }
  }
  `);
    
    // Add spring-config.xml
    zip.file(`${appName}/src/main/resources/spring-config.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>
  <beans xmlns="http://www.springframework.org/schema/beans"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns:context="http://www.springframework.org/schema/context"
         xsi:schemaLocation="http://www.springframework.org/schema/beans
                             http://www.springframework.org/schema/beans/spring-beans.xsd
                             http://www.springframework.org/schema/context
                             http://www.springframework.org/schema/context/spring-context.xsd">
  
      <!-- Bean definitions -->
      <bean id="message" class="com.example.model.Message">
          <property name="content" value="${description} - Hello from Spring XML Configuration!" />
      </bean>
      
      <bean id="helloService" class="com.example.service.HelloService">
          <property name="message" ref="message" />
      </bean>
      
  </beans>
  `);
    
    // Add test class
    zip.file(`${appName}/src/test/java/com/example/service/HelloServiceTest.java`,
  `package com.example.service;
  
  import org.junit.jupiter.api.BeforeEach;
  import org.junit.jupiter.api.Test;
  import com.example.model.Message;
  import static org.junit.jupiter.api.Assertions.*;
  
  public class HelloServiceTest {
      
      private HelloService helloService;
      private Message message;
      
      @BeforeEach
      public void setUp() {
          helloService = new HelloService();
          message = new Message();
          message.setContent("Test Message");
          helloService.setMessage(message);
      }
      
      @Test
      public void testGetMessage() {
          assertEquals("Test Message", helloService.getMessage());
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
  
      <n>${appName}</n>
      <description>${description}</description>
  
      <properties>
          <java.version>11</java.version>
          <maven.compiler.source>11</maven.compiler.source>
          <maven.compiler.target>11</maven.compiler.target>
          <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
          <spring.version>5.3.20</spring.version>
      </properties>
  
      <dependencies>
          <dependency>
              <groupId>org.springframework</groupId>
              <artifactId>spring-context</artifactId>
              <version>\${spring.version}</version>
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
                  <artifactId>maven-jar-plugin</artifactId>
                  <version>3.2.2</version>
                  <configuration>
                      <archive>
                          <manifest>
                              <addClasspath>true</addClasspath>
                              <mainClass>com.example.App</mainClass>
                          </manifest>
                      </archive>
                  </configuration>
              </plugin>
          </plugins>
      </build>
  </project>
  `);
  }
  
  /**
   * Validates if a custom directory structure meets the minimum requirements for a Spring XML app
   */
  export function validateSpringXmlDirectoryStructure(directoryStructure) {
    const requiredPaths = [
      'src/main/java',
      'src/main/resources/spring-config.xml',
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
        message: `The directory structure is missing required paths for a Spring XML application: ${missingPaths.join(', ')}`
      };
    }
    
    return { valid: true, message: 'Directory structure is valid.' };
  }