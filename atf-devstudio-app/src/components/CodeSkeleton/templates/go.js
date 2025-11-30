// templates/go.js
// Go templates for various code skeletons

/**
 * Go Function Template
 */
export const function_ = (options) => {
    const {
      includeComments = true,
      includeTests = false,
      functionName = 'MyFunction'
    } = options;
  
    return `package main
  
  ${includeComments ? `// ${functionName} performs a specific operation on the given input
  // and returns the processed result.` : ""}
  func ${functionName}(input string) string {
      // Function implementation
      return input
  }
  
  ${includeTests ? `
  // Test file: ${functionName}_test.go
  package main
  
  import (
      "testing"
  )
  
  func Test${functionName}(t *testing.T) {
      // Test cases
      testCases := []struct {
          name     string
          input    string
          expected string
      }{
          {
              name:     "regular input",
              input:    "test",
              expected: "test",
          },
          {
              name:     "empty input",
              input:    "",
              expected: "",
          },
      }
  
      // Run the test cases
      for _, tc := range testCases {
          t.Run(tc.name, func(t *testing.T) {
              result := ${functionName}(tc.input)
              if result != tc.expected {
                  t.Errorf("expected %q, got %q", tc.expected, result)
              }
          })
      }
  }` : ""}`;
  };
  
  /**
   * Go Struct Template
   */
  export const struct = (options) => {
    const {
      includeComments = true,
      includeTests = false,
      className = 'MyStruct'
    } = options;
  
    return `package main
  
  import (
      "fmt"
      ${includeTests ? `"testing"` : ""}
  )
  
  ${includeComments ? `// ${className} represents a data structure with various properties.` : ""}
  type ${className} struct {
      ID        int    ${includeComments ? "// Unique identifier" : ""}
      Name      string ${includeComments ? "// Name of the item" : ""}
      Value     float64 ${includeComments ? "// Numeric value" : ""}
      IsEnabled bool   ${includeComments ? "// Status flag" : ""}
  }
  
  ${includeComments ? `// New${className} creates a new instance of ${className} with default values.` : ""}
  func New${className}() *${className} {
      return &${className}{
          ID:        1,
          Name:      "Default",
          Value:     0.0,
          IsEnabled: true,
      }
  }
  
  ${includeComments ? `// New${className}WithParams creates a new instance of ${className} with the given parameters.` : ""}
  func New${className}WithParams(id int, name string, value float64, isEnabled bool) *${className} {
      return &${className}{
          ID:        id,
          Name:      name,
          Value:     value,
          IsEnabled: isEnabled,
      }
  }
  
  ${includeComments ? `// String returns a string representation of the ${className}.` : ""}
  func (s *${className}) String() string {
      return fmt.Sprintf("${className}{ID: %d, Name: %s, Value: %.2f, IsEnabled: %t}",
          s.ID, s.Name, s.Value, s.IsEnabled)
  }
  
  ${includeComments ? `// Process performs an operation on the ${className}.` : ""}
  func (s *${className}) Process() float64 {
      // Example processing
      if s.IsEnabled {
          return s.Value * 2
      }
      return s.Value
  }
  
  ${includeTests ? `
  // Test file: ${className}_test.go
  package main
  
  import (
      "testing"
  )
  
  func Test${className}Creation(t *testing.T) {
      // Test default constructor
      s1 := New${className}()
      if s1.ID != 1 || s1.Name != "Default" || s1.Value != 0.0 || !s1.IsEnabled {
          t.Errorf("Default constructor failed: %v", s1)
      }
      
      // Test parameterized constructor
      s2 := New${className}WithParams(2, "Test", 10.5, false)
      if s2.ID != 2 || s2.Name != "Test" || s2.Value != 10.5 || s2.IsEnabled {
          t.Errorf("Parameterized constructor failed: %v", s2)
      }
  }
  
  func Test${className}Process(t *testing.T) {
      // Test enabled case
      s1 := New${className}WithParams(1, "Test", 5.0, true)
      if s1.Process() != 10.0 {
          t.Errorf("Process with enabled flag failed: expected 10.0, got %.2f", s1.Process())
      }
      
      // Test disabled case
      s2 := New${className}WithParams(2, "Test", 5.0, false)
      if s2.Process() != 5.0 {
          t.Errorf("Process with disabled flag failed: expected 5.0, got %.2f", s2.Process())
      }
  }` : ""}`;
  };
  
  /**
   * Go HTTP Handler Template
   */
  export const handler = (options) => {
    const {
      includeComments = true,
      includeTests = false,
      apiName = 'items',
      className = 'Item'
    } = options;
  
    const handlerName = `${className}Handler`;
    const lowerClassName = className.toLowerCase();
  
    return `package main
  
  import (
      "encoding/json"
      "fmt"
      "log"
      "net/http"
      "strconv"
      "strings"
      ${includeTests ? `"net/http/httptest"
      "testing"
      "bytes"` : ""}
  )
  
  ${includeComments ? `// ${className} represents the data model for our API.` : ""}
  type ${className} struct {
      ID          int     \`json:"id"\`
      Name        string  \`json:"name"\`
      Description string  \`json:"description,omitempty"\`
      Price       float64 \`json:"price"\`
      IsAvailable bool    \`json:"isAvailable"\`
  }
  
  ${includeComments ? `// ${className}Store provides access to ${className} storage.` : ""}
  type ${className}Store struct {
      items map[int]${className}
  }
  
  ${includeComments ? `// New${className}Store creates a new storage for ${className}s.` : ""}
  func New${className}Store() *${className}Store {
      return &${className}Store{
          items: make(map[int]${className}),
      }
  }
  
  ${includeComments ? `// ${handlerName} handles HTTP requests for ${className} resources.` : ""}
  type ${handlerName} struct {
      store *${className}Store
  }
  
  ${includeComments ? `// New${handlerName} creates a new handler for ${className} resources.` : ""}
  func New${handlerName}(store *${className}Store) *${handlerName} {
      return &${handlerName}{
          store: store,
      }
  }
  
  ${includeComments ? `// ServeHTTP handles all HTTP requests for ${className} resources.` : ""}
  func (h *${handlerName}) ServeHTTP(w http.ResponseWriter, r *http.Request) {
      switch r.Method {
      case http.MethodGet:
          h.handleGet(w, r)
      case http.MethodPost:
          h.handlePost(w, r)
      case http.MethodPut:
          h.handlePut(w, r)
      case http.MethodDelete:
          h.handleDelete(w, r)
      default:
          http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
      }
  }
  
  ${includeComments ? `// handleGet handles GET requests to retrieve ${className}s.` : ""}
  func (h *${handlerName}) handleGet(w http.ResponseWriter, r *http.Request) {
      // Extract the ID from the URL if present
      parts := strings.Split(r.URL.Path, "/")
      id := ""
      if len(parts) > 2 {
          id = parts[2]
      }
      
      w.Header().Set("Content-Type", "application/json")
      
      // Get all items if no ID is provided
      if id == "" {
          items := make([]${className}, 0, len(h.store.items))
          for _, item := range h.store.items {
              items = append(items, item)
          }
          
          if err := json.NewEncoder(w).Encode(items); err != nil {
              http.Error(w, err.Error(), http.StatusInternalServerError)
              return
          }
          return
      }
      
      // Get a specific item by ID
      itemID, err := strconv.Atoi(id)
      if err != nil {
          http.Error(w, "Invalid ID", http.StatusBadRequest)
          return
      }
      
      item, exists := h.store.items[itemID]
      if !exists {
          http.Error(w, "Item not found", http.StatusNotFound)
          return
      }
      
      if err := json.NewEncoder(w).Encode(item); err != nil {
          http.Error(w, err.Error(), http.StatusInternalServerError)
          return
      }
  }
  
  ${includeComments ? `// handlePost handles POST requests to create new ${className}s.` : ""}
  func (h *${handlerName}) handlePost(w http.ResponseWriter, r *http.Request) {
      var item ${className}
      if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
          http.Error(w, err.Error(), http.StatusBadRequest)
          return
      }
      
      // Generate a new ID (in a real app, this would be handled better)
      nextID := len(h.store.items) + 1
      item.ID = nextID
      
      // Store the new item
      h.store.items[nextID] = item
      
      w.Header().Set("Content-Type", "application/json")
      w.WriteHeader(http.StatusCreated)
      
      if err := json.NewEncoder(w).Encode(item); err != nil {
          http.Error(w, err.Error(), http.StatusInternalServerError)
          return
      }
  }
  
  ${includeComments ? `// handlePut handles PUT requests to update existing ${className}s.` : ""}
  func (h *${handlerName}) handlePut(w http.ResponseWriter, r *http.Request) {
      // Extract the ID from the URL
      parts := strings.Split(r.URL.Path, "/")
      if len(parts) <= 2 {
          http.Error(w, "ID is required", http.StatusBadRequest)
          return
      }
      
      id := parts[2]
      itemID, err := strconv.Atoi(id)
      if err != nil {
          http.Error(w, "Invalid ID", http.StatusBadRequest)
          return
      }
      
      // Check if the item exists
      _, exists := h.store.items[itemID]
      if !exists {
          http.Error(w, "Item not found", http.StatusNotFound)
          return
      }
      
      // Parse the updated item
      var item ${className}
      if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
          http.Error(w, err.Error(), http.StatusBadRequest)
          return
      }
      
      // Ensure the ID matches
      item.ID = itemID
      
      // Update the item
      h.store.items[itemID] = item
      
      w.Header().Set("Content-Type", "application/json")
      
      if err := json.NewEncoder(w).Encode(item); err != nil {
          http.Error(w, err.Error(), http.StatusInternalServerError)
          return
      }
  }
  
  ${includeComments ? `// handleDelete handles DELETE requests to remove ${className}s.` : ""}
  func (h *${handlerName}) handleDelete(w http.ResponseWriter, r *http.Request) {
      // Extract the ID from the URL
      parts := strings.Split(r.URL.Path, "/")
      if len(parts) <= 2 {
          http.Error(w, "ID is required", http.StatusBadRequest)
          return
      }
      
      id := parts[2]
      itemID, err := strconv.Atoi(id)
      if err != nil {
          http.Error(w, "Invalid ID", http.StatusBadRequest)
          return
      }
      
      // Check if the item exists
      _, exists := h.store.items[itemID]
      if !exists {
          http.Error(w, "Item not found", http.StatusNotFound)
          return
      }
      
      // Delete the item
      delete(h.store.items, itemID)
      
      w.WriteHeader(http.StatusNoContent)
  }
  
  ${includeComments ? `// setupRoutes configures the HTTP server with the handlers.` : ""}
  func setupRoutes() http.Handler {
      store := New${className}Store()
      
      // Add some sample data
      store.items[1] = ${className}{
          ID:          1,
          Name:        "Sample ${className}",
          Description: "This is a sample ${className}",
          Price:       19.99,
          IsAvailable: true,
      }
      
      // Create the handler
      handler := New${handlerName}(store)
      
      // Create a new mux
      mux := http.NewServeMux()
      
      // Register the handler for the /api/${apiName} endpoint
      mux.Handle("/api/${apiName}/", handler)
      
      return mux
  }
  
  ${includeComments ? `// Example main function to start the server` : ""}
  func main() {
      // Set up the routes
      router := setupRoutes()
      
      // Start the server
      port := 8080
      log.Printf("Starting server on :%d", port)
      log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), router))
  }
  
  ${includeTests ? `
  // Test file: ${handlerName}_test.go
  package main
  
  import (
      "bytes"
      "encoding/json"
      "net/http"
      "net/http/httptest"
      "testing"
  )
  
  func Test${handlerName}GetAll(t *testing.T) {
      // Create test store and handler
      store := New${className}Store()
      store.items[1] = ${className}{
          ID:          1,
          Name:        "Test ${className}",
          Price:       19.99,
          IsAvailable: true,
      }
      handler := New${handlerName}(store)
      
      // Create test request
      req, err := http.NewRequest("GET", "/api/${apiName}/", nil)
      if err != nil {
          t.Fatal(err)
      }
      
      // Create test response recorder
      rr := httptest.NewRecorder()
      
      // Serve the request
      handler.ServeHTTP(rr, req)
      
      // Check the status code
      if status := rr.Code; status != http.StatusOK {
          t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
      }
      
      // Check the content type
      contentType := rr.Header().Get("Content-Type")
      if contentType != "application/json" {
          t.Errorf("handler returned wrong content type: got %v want %v", contentType, "application/json")
      }
      
      // Decode the response
      var items []${className}
      if err := json.NewDecoder(rr.Body).Decode(&items); err != nil {
          t.Fatalf("could not decode response: %v", err)
      }
      
      // Check the response body
      if len(items) != 1 {
          t.Errorf("expected 1 item, got %d", len(items))
      }
      
      if items[0].ID != 1 || items[0].Name != "Test ${className}" {
          t.Errorf("unexpected item: %+v", items[0])
      }
  }
  
  func Test${handlerName}GetByID(t *testing.T) {
      // Create test store and handler
      store := New${className}Store()
      store.items[1] = ${className}{
          ID:          1,
          Name:        "Test ${className}",
          Price:       19.99,
          IsAvailable: true,
      }
      handler := New${handlerName}(store)
      
      // Create test request
      req, err := http.NewRequest("GET", "/api/${apiName}/1", nil)
      if err != nil {
          t.Fatal(err)
      }
      
      // Create test response recorder
      rr := httptest.NewRecorder()
      
      // Serve the request
      handler.ServeHTTP(rr, req)
      
      // Check the status code
      if status := rr.Code; status != http.StatusOK {
          t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
      }
      
      // Decode the response
      var item ${className}
      if err := json.NewDecoder(rr.Body).Decode(&item); err != nil {
          t.Fatalf("could not decode response: %v", err)
      }
      
      // Check the response body
      if item.ID != 1 || item.Name != "Test ${className}" {
          t.Errorf("unexpected item: %+v", item)
      }
  }` : ""}`;
  };
  
  /**
   * Go CRUD Operations Template
   */
  export const crud = (options) => {
    const {
      includeComments = true,
      includeTests = false,
      className = 'Item'
    } = options;
  
    const lowerClassName = className.toLowerCase();
  
    return `package main
  
  import (
      "errors"
      "fmt"
      ${includeTests ? `"testing"` : ""}
  )
  
  ${includeComments ? `// ${className} represents a data entity.` : ""}
  type ${className} struct {
      ID          int
      Name        string
      Description string
      Price       float64
      IsAvailable bool
  }
  
  ${includeComments ? `// ${className}Repository defines the interface for ${className} data operations.` : ""}
  type ${className}Repository interface {
      Create(${lowerClassName} *${className}) error
      GetAll() ([]${className}, error)
      GetByID(id int) (*${className}, error)
      Update(${lowerClassName} *${className}) error
      Delete(id int) error
  }
  
  ${includeComments ? `// In-memory implementation of ${className}Repository` : ""}
  type ${className}MemRepository struct {
      items     map[int]${className}
      nextID    int
  }
  
  ${includeComments ? `// New${className}MemRepository creates a new in-memory repository.` : ""}
  func New${className}MemRepository() *${className}MemRepository {
      return &${className}MemRepository{
          items:     make(map[int]${className}),
          nextID:    1,
      }
  }
  
  ${includeComments ? `// Create adds a new ${className} to the repository.` : ""}
  func (r *${className}MemRepository) Create(${lowerClassName} *${className}) error {
      // Assign a new ID
      ${lowerClassName}.ID = r.nextID
      r.nextID++
      
      // Store the item
      r.items[${lowerClassName}.ID] = *${lowerClassName}
      
      return nil
  }
  
  ${includeComments ? `// GetAll returns all ${className}s from the repository.` : ""}
  func (r *${className}MemRepository) GetAll() ([]${className}, error) {
      items := make([]${className}, 0, len(r.items))
      for _, item := range r.items {
          items = append(items, item)
      }
      
      return items, nil
  }
  
  ${includeComments ? `// GetByID returns a ${className} by its ID.` : ""}
  func (r *${className}MemRepository) GetByID(id int) (*${className}, error) {
      ${lowerClassName}, exists := r.items[id]
      if !exists {
          return nil, errors.New("${lowerClassName} not found")
      }
      
      return &${lowerClassName}, nil
  }
  
  ${includeComments ? `// Update modifies an existing ${className} in the repository.` : ""}
  func (r *${className}MemRepository) Update(${lowerClassName} *${className}) error {
      if _, exists := r.items[${lowerClassName}.ID]; !exists {
          return errors.New("${lowerClassName} not found")
      }
      
      r.items[${lowerClassName}.ID] = *${lowerClassName}
      
      return nil
  }
  
  ${includeComments ? `// Delete removes a ${className} from the repository.` : ""}
  func (r *${className}MemRepository) Delete(id int) error {
      if _, exists := r.items[id]; !exists {
          return errors.New("${lowerClassName} not found")
      }
      
      delete(r.items, id)
      
      return nil
  }
  
  ${includeComments ? `// ${className}Service provides business logic for ${className} operations.` : ""}
  type ${className}Service struct {
      repo ${className}Repository
  }
  
  ${includeComments ? `// New${className}Service creates a new service for ${className} operations.` : ""}
  func New${className}Service(repo ${className}Repository) *${className}Service {
      return &${className}Service{
          repo: repo,
      }
  }
  
  ${includeComments ? `// Create${className} adds a new ${className}.` : ""}
  func (s *${className}Service) Create${className}(${lowerClassName} *${className}) error {
      // Validate the item
      if ${lowerClassName}.Name == "" {
          return errors.New("name cannot be empty")
      }
      
      if ${lowerClassName}.Price < 0 {
          return errors.New("price cannot be negative")
      }
      
      // Create the item
      return s.repo.Create(${lowerClassName})
  }
  
  ${includeComments ? `// GetAll${className}s returns all ${className}s.` : ""}
  func (s *${className}Service) GetAll${className}s() ([]${className}, error) {
      return s.repo.GetAll()
  }
  
  ${includeComments ? `// Get${className}ByID returns a ${className} by its ID.` : ""}
  func (s *${className}Service) Get${className}ByID(id int) (*${className}, error) {
      return s.repo.GetByID(id)
  }
  
  ${includeComments ? `// Update${className} modifies an existing ${className}.` : ""}
  func (s *${className}Service) Update${className}(${lowerClassName} *${className}) error {
      // Validate the item
      if ${lowerClassName}.ID <= 0 {
          return errors.New("invalid ID")
      }
      
      if ${lowerClassName}.Name == "" {
          return errors.New("name cannot be empty")
      }
      
      if ${lowerClassName}.Price < 0 {
          return errors.New("price cannot be negative")
      }
      
      // Update the item
      return s.repo.Update(${lowerClassName})
  }
  
  ${includeComments ? `// Delete${className} removes a ${className}.` : ""}
  func (s *${className}Service) Delete${className}(id int) error {
      if id <= 0 {
          return errors.New("invalid ID")
      }
      
      return s.repo.Delete(id)
  }
  
  func main() {
      ${includeComments ? `// Create a new repository and service` : ""}
      repo := New${className}MemRepository()
      service := New${className}Service(repo)
      
      ${includeComments ? `// Create a new item` : ""}
      newItem := &${className}{
          Name:        "Sample ${className}",
          Description: "This is a sample ${className}",
          Price:       19.99,
          IsAvailable: true,
      }
      
      err := service.Create${className}(newItem)
      if err != nil {
          fmt.Printf("Error creating ${lowerClassName}: %v\\n", err)
          return
      }
      
      ${includeComments ? `// Get all items` : ""}
      items, err := service.GetAll${className}s()
      if err != nil {
          fmt.Printf("Error getting all ${lowerClassName}s: %v\\n", err)
          return
      }
      
      fmt.Println("All ${lowerClassName}s:")
      for _, item := range items {
          fmt.Printf("- %d: %s ($%.2f)\\n", item.ID, item.Name, item.Price)
      }
      
      ${includeComments ? `// Get an item by ID` : ""}
      item, err := service.Get${className}ByID(1)
      if err != nil {
          fmt.Printf("Error getting ${lowerClassName}: %v\\n", err)
          return
      }
      
      fmt.Printf("${className} with ID 1: %s ($%.2f)\\n", item.Name, item.Price)
      
      ${includeComments ? `// Update an item` : ""}
      item.Price = 24.99
      err = service.Update${className}(item)
      if err != nil {
          fmt.Printf("Error updating ${lowerClassName}: %v\\n", err)
          return
      }
      
      ${includeComments ? `// Delete an item` : ""}
      err = service.Delete${className}(1)
      if err != nil {
          fmt.Printf("Error deleting ${lowerClassName}: %v\\n", err)
          return
      }
      
      fmt.Println("${className} deleted successfully")
  }
  
  ${includeTests ? `
  // Test file: ${className}_test.go
  package main
  
  import (
      "testing"
  )
  
  func Test${className}Service(t *testing.T) {
      // Create repository and service
      repo := New${className}MemRepository()
      service := New${className}Service(repo)
      
      // Test Create
      newItem := &${className}{
          Name:        "Test ${className}",
          Description: "This is a test",
          Price:       19.99,
          IsAvailable: true,
      }
      
      err := service.Create${className}(newItem)
      if err != nil {
          t.Fatalf("Error creating ${lowerClassName}: %v", err)
      }
      
      if newItem.ID != 1 {
          t.Errorf("Expected ID 1, got %d", newItem.ID)
      }
      
      // Test validation
      invalidItem := &${className}{
          Name:        "",  // Invalid name
          Price:       19.99,
      }
      
      err = service.Create${className}(invalidItem)
      if err == nil {
          t.Error("Expected error for invalid name, got nil")
      }
      
      // Test GetAll
      items, err := service.GetAll${className}s()
      if err != nil {
          t.Fatalf("Error getting all ${lowerClassName}s: %v", err)
      }
      
      if len(items) != 1 {
          t.Errorf("Expected 1 item, got %d", len(items))
      }
      
      // Test GetByID
      item, err := service.Get${className}ByID(1)
      if err != nil {
          t.Fatalf("Error getting ${lowerClassName}: %v", err)
      }
      
      if item.Name != "Test ${className}" {
          t.Errorf("Expected name 'Test ${className}', got '%s'", item.Name)
      }
      
      // Test Update
      item.Price = 24.99
      err = service.Update${className}(item)
      if err != nil {
          t.Fatalf("Error updating ${lowerClassName}: %v", err)
      }
      
      updatedItem, _ := service.Get${className}ByID(1)
      if updatedItem.Price != 24.99 {
          t.Errorf("Expected price 24.99, got %.2f", updatedItem.Price)
      }
      
      // Test Delete
      err = service.Delete${className}(1)
      if err != nil {
          t.Fatalf("Error deleting ${lowerClassName}: %v", err)
      }
      
      items, _ = service.GetAll${className}s()
      if len(items) != 0 {
          t.Errorf("Expected 0 items after deletion, got %d", len(items))
      }
      
      // Test getting non-existent item
      _, err = service.Get${className}ByID(1)
      if err == nil {
          t.Error("Expected error for non-existent item, got nil")
      }
  }` : ""}`;
  };
  
  /**
   * Go Test Suite Template
   */
  export const test = (options) => {
    const {
      includeComments = true,
      className = 'MyStruct'
    } = options;
  
    return `package main
  
  import (
      "testing"
  )
  
  ${includeComments ? `// Test${className} is a test suite for ${className}.` : ""}
  func Test${className}(t *testing.T) {
      ${includeComments ? `// Define test cases` : ""}
      t.Run("creation", test${className}Creation)
      t.Run("operations", test${className}Operations)
      t.Run("validation", test${className}Validation)
      t.Run("edge_cases", test${className}EdgeCases)
  }
  
  ${includeComments ? `// test${className}Creation tests the creation of a ${className}.` : ""}
  func test${className}Creation(t *testing.T) {
      ${includeComments ? `// Test default constructor` : ""}
      item := New${className}()
      if item == nil {
          t.Fatal("Failed to create ${className}")
      }
      
      ${includeComments ? `// Test constructor with parameters` : ""}
      customItem := New${className}WithParams("Test", 42)
      if customItem.Name != "Test" || customItem.Value != 42 {
          t.Errorf("Custom constructor failed: got name=%s, value=%d; want name=Test, value=42",
              customItem.Name, customItem.Value)
      }
  }
  
  ${includeComments ? `// test${className}Operations tests the operations of a ${className}.` : ""}
function test${className}Operations(t *testing.T) {
    item := New${className}()
    
    ${includeComments ? `// Test process method` : ""}
    result := item.Process()
    if result != "Default" {
        t.Errorf("Process failed: got %s, want Default", result)
    }
    
    ${includeComments ? `// Test update method` : ""}
    item.Update("Updated", 100)
    if item.Name != "Updated" || item.Value != 100 {
        t.Errorf("Update failed: got name=%s, value=%d; want name=Updated, value=100",
            item.Name, item.Value)
    }
}

${includeComments ? `// test${className}Validation tests the validation of a ${className}.` : ""}
func test${className}Validation(t *testing.T) {
    item := New${className}()
    
    ${includeComments ? `// Test valid cases` : ""}
    if err := item.Validate(); err != nil {
        t.Errorf("Valid item failed validation: %v", err)
    }
    
    ${includeComments ? `// Test invalid cases` : ""}
    item.Name = ""
    if err := item.Validate(); err == nil {
        t.Error("Invalid item passed validation, expected error for empty name")
    }
    
    item.Name = "Valid"
    item.Value = -1
    if err := item.Validate(); err == nil {
        t.Error("Invalid item passed validation, expected error for negative value")
    }
}

${includeComments ? `// test${className}EdgeCases tests edge cases for ${className}.` : ""}
func test${className}EdgeCases(t *testing.T) {
    ${includeComments ? `// Test with zero values` : ""}
    item := &${className}{}
    if item.Name != "" || item.Value != 0 {
        t.Errorf("Zero value initialization failed: got name=%s, value=%d; want name='', value=0",
            item.Name, item.Value)
    }
    
    ${includeComments ? `// Test with maximum values` : ""}
    maxItem := New${className}WithParams("MaxTest", 9999)
    result := maxItem.Process()
    if result != "MaxTest" {
        t.Errorf("Process with max values failed: got %s, want MaxTest", result)
    }
}
`;
};