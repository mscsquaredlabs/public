/**
 * Helper function to convert Java package name to a directory path.
 * @param {string} packageName - The Java package name (e.g., com.example.myapp).
 * @returns {string} The corresponding path (e.g., com/example/myapp).
 */
export const getPackagePath = (packageName) => {
    if (!packageName) return ''; // Handle potential undefined/null input
    return packageName.replace(/\./g, '/');
};