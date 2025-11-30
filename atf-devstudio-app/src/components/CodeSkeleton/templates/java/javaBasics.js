// templates/java/javaBasics.js
// Provides skeletons for individual Java code constructs

/**
 * Map of basic Java code snippets keyed by template ID
 * Each function returns a string containing the snippet.
 * @param {object} options
 * @param {boolean} options.includeComments - Whether to include explanatory comments
 */
export const javaBasics = {
    interface: ({ includeComments = true } = {}) => `
  ${includeComments ? '/**\n * Interface skeleton\n */\n' : ''}public interface MyService {\n    void perform();\n}`,
  
    enum: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Enum skeleton\n' : ''}public enum Status {\n    STARTED,\n    RUNNING,\n    FINISHED;\n}`,
  
    annotation: ({ includeComments = true } = {}) => `
  ${includeComments ? '/**\n * Annotation skeleton\n */\n' : ''}import java.lang.annotation.*;\n
  @Retention(RetentionPolicy.RUNTIME)\n@Target(ElementType.TYPE)\npublic @interface Auditable {}`,
  
    method: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Method skeleton\n' : ''}public void myMethod() {\n    // TODO: implement\n}`,
  
    constructor: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Constructor skeleton\n' : ''}public MyClass() {\n    // TODO: initialize\n}`,
  
    forLoop: ({ includeComments = true } = {}) => `
  ${includeComments ? '// For loop skeleton\n' : ''}for (int i = 0; i < 10; i++) {\n    // TODO: loop body\n}`,
  
    whileLoop: ({ includeComments = true } = {}) => `
  ${includeComments ? '// While loop skeleton\n' : ''}while (condition) {\n    // TODO: loop body\n}`,
  
    doWhileLoop: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Do-while loop skeleton\n' : ''}do {\n    // TODO: loop body\n} while (condition);`,
  
    ifStatement: ({ includeComments = true } = {}) => `
  ${includeComments ? '// If statement skeleton\n' : ''}if (condition) {\n    // TODO: then branch\n} else {\n    // TODO: else branch\n}`,
  
    switchCase: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Switch statement skeleton\n' : ''}switch (value) {\n    case 1:\n        // TODO: case 1\n        break;\n    default:\n        // TODO: default case\n        break;\n}`,
  
    tryCatch: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Try-catch skeleton\n' : ''}try {\n    // TODO: risky operation\n} catch (Exception e) {\n    e.printStackTrace();\n}`,
  
    staticBlock: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Static initializer block skeleton\n' : ''}static {\n    // TODO: static initialization\n}`,
  
    synchronizedBlock: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Synchronized block skeleton\n' : ''}synchronized (lock) {\n    // TODO: synchronized code\n}`,
  
    packageDeclaration: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Package declaration skeleton\n' : ''}package com.example.myapp;`,
  
    importStatement: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Import statement skeleton\n' : ''}import java.util.List;`,
  
    codeBlock: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Code block skeleton\n' : ''}{\n    // TODO: block of code\n}`,
  
    commentBlock: ({ includeComments = true } = {}) => `
  /*\n * Comment block skeleton\n */`
  };
  