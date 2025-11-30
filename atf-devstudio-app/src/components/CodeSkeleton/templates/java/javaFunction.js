// src/templates/java/javaFunction.js
export const javaFunction = (opts) => {
    const { className = 'Utils', methodName = 'doSomething', includeComments = true } = opts;
    return `${includeComments ? `/**
   * ${methodName} – description of what this does.
   *
   * @param input  some input parameter
   * @return       result of processing
   */\n` : ''}public final class ${className} {
      private ${className}() {}  // no instances
  
      public static String ${methodName}(String input) {
          // TODO: implement logic
          return input;
      }
  }`;
  };
  