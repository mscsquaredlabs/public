// templates/python/pythonFastApi.js
// Python FastAPI Endpoint Template

export const pyFastApi = (options) => {
    const {
      includeComments = true,
      includeTests = false,
      className = 'Item', // Pydantic model name
      apiName = 'items'  // Route prefix
    } = options || {};
  
    // Ensure className is capitalized for Pydantic model
    const modelName = className.charAt(0).toUpperCase() + className.slice(1);
  
    return `from fastapi import APIRouter, HTTPException, Depends, Query, Path, Body, status
  from typing import List, Optional
  from pydantic import BaseModel, Field
  ${includeTests ? 'from fastapi.testclient import TestClient\n# from main import app # Assuming your main app instance is here\n' : ''}
  
  ${includeComments ? '# In-memory storage for demonstration (Replace with database logic)\n' : ''}fake_db = {}
  next_id = 1
  
  ${includeComments ? '# --- Pydantic Models ---' : ""}
  class ${modelName}Base(BaseModel):
      name: str = Field(..., description="Name of the ${modelName}")
      description: Optional[str] = Field(None, description="Optional description")
      price: Optional[float] = Field(None, description="Price of the ${modelName}")
      is_available: bool = Field(True, description="Availability status")
  
  class ${modelName}Create(${modelName}Base):
      ${includeComments ? '# Fields required for creation' : ''}
      pass
  
  class ${modelName}Update(${modelName}Base):
      ${includeComments ? '# Fields allowed for update (make optional if needed)' : ''}
      name: Optional[str] = None
      description: Optional[str] = None
      price: Optional[float] = None
      is_available: Optional[bool] = None
  
  class ${modelName}InDB(${modelName}Base):
      id: int = Field(..., description="Unique identifier")
  
      class Config:
          orm_mode = True # Enable compatibility with ORM objects
  
  
  ${includeComments ? '# --- API Router ---' : ''}
  router = APIRouter(
      prefix=f"/${apiName.toLowerCase()}",
      tags=["${modelName}s"], # Tag for Swagger UI grouping
      responses={404: {"description": "${modelName} not found"}},
  )
  
  
  ${includeComments ? '# --- CRUD Endpoints ---' : ""}
  
  @router.post(
      "/",
      response_model=${modelName}InDB,
      status_code=status.HTTP_201_CREATED,
      summary="Create a new ${modelName}"
  )
  async def create_${modelName.toLowerCase()}(item_in: ${modelName}Create):
      ${includeComments ? '"""\n    Create a new item in the database.\n    - **item_in**: Data for the new item.\n    """\n' : ''}
      global next_id
      db_item = ${modelName}InDB(**item_in.dict(), id=next_id)
      fake_db[next_id] = db_item
      next_id += 1
      return db_item
  
  
  @router.get(
      "/",
      response_model=List[${modelName}InDB],
      summary="Get all ${modelName}s"
  )
  async def get_all_${apiName.toLowerCase()}(
      skip: int = Query(0, description="Number of items to skip", ge=0),
      limit: int = Query(100, description="Max number of items to return", ge=1, le=500),
      available_only: Optional[bool] = Query(None, description="Filter by availability")
  ):
      ${includeComments ? '"""\n    Retrieve all items with optional filtering and pagination.\n    - **skip**: Offset to start retrieving items.\n    - **limit**: Maximum number of items to return.\n    - **available_only**: If True, only return available items.\n    """\n' : ''}
      all_items = list(fake_db.values())
      if available_only is not None:
          filtered_items = [item for item in all_items if item.is_available == available_only]
      else:
          filtered_items = all_items
  
      return filtered_items[skip : skip + limit]
  
  
  @router.get(
      "/{item_id}",
      response_model=${modelName}InDB,
      summary="Get a specific ${modelName} by ID"
  )
  async def get_${modelName.toLowerCase()}_by_id(
      item_id: int = Path(..., description="The ID of the item to retrieve", ge=1)
  ):
      ${includeComments ? '"""\n    Retrieve a specific item by its unique ID.\n    - **item_id**: The primary key of the item.\n    """\n' : ''}
      db_item = fake_db.get(item_id)
      if db_item is None:
          raise HTTPException(
              status_code=status.HTTP_404_NOT_FOUND,
              detail=f"${modelName} with ID {item_id} not found"
          )
      return db_item
  
  
  @router.put(
      "/{item_id}",
      response_model=${modelName}InDB,
      summary="Update an existing ${modelName}"
  )
  async def update_${modelName.toLowerCase()}(
      *, # Makes subsequent parameters keyword-only
      item_id: int = Path(..., description="The ID of the item to update", ge=1),
      item_in: ${modelName}Update = Body(..., description="Data to update the item with")
  ):
      ${includeComments ? '"""\n    Update an existing item by ID. Only provided fields are updated.\n    - **item_id**: The ID of the item to update.\n    - **item_in**: The fields to update.\n    """\n' : ''}
      db_item = fake_db.get(item_id)
      if db_item is None:
          raise HTTPException(
              status_code=status.HTTP_404_NOT_FOUND,
              detail=f"${modelName} with ID {item_id} not found"
          )
  
      update_data = item_in.dict(exclude_unset=True) # Get only provided fields
      updated_item = db_item.copy(update=update_data)
      fake_db[item_id] = updated_item
      return updated_item
  
  
  @router.delete(
      "/{item_id}",
      status_code=status.HTTP_204_NO_CONTENT,
      summary="Delete a ${modelName}"
  )
  async def delete_${modelName.toLowerCase()}(
      item_id: int = Path(..., description="The ID of the item to delete", ge=1)
  ):
      ${includeComments ? '"""\n    Delete an item by ID.\n    - **item_id**: The ID of the item to delete.\n    """\n' : ''}
      if item_id not in fake_db:
          raise HTTPException(
              status_code=status.HTTP_404_NOT_FOUND,
              detail=f"${modelName} with ID {item_id} not found"
          )
      del fake_db[item_id]
      return None # Return None for 204 No Content
  
  ${includeTests ? `
  # ================== TEST FILE (e.g., test_${apiName.toLowerCase()}_api.py) ==================
  # Assuming 'app' is your FastAPI instance including this router
  # from main import app # Example: from your main app file
  # client = TestClient(app)
  
  # Mock data for testing
  # def override_dependency(): # If you have dependencies to override
  #    pass
  # app.dependency_overrides[your_dependency] = override_dependency
  
  def test_create_${modelName.toLowerCase()}(client): # Pass test client fixture
      """Test creating an item."""
      response = client.post(
          "/${apiName.toLowerCase()}/",
          json={"name": "Test Item Create", "price": 10.99}
      )
      assert response.status_code == 201
      data = response.json()
      assert data["name"] == "Test Item Create"
      assert data["price"] == 10.99
      assert "id" in data
      # Check if it's actually in the fake_db (if accessible or stateful across tests)
      # assert data["id"] in fake_db
  
  def test_get_${modelName.toLowerCase()}_by_id_found(client):
      """Test getting an existing item by ID."""
      # Assume item with ID 1 exists from setup or previous test
      item_id = 1 # Or use ID from create test if state persists
      response = client.get(f"/${apiName.toLowerCase()}/{item_id}")
      if response.status_code == 404: # Handle case where test runs independently
          # Create item first if needed for isolated test run
          client.post("/${apiName.toLowerCase()}/", json={"name": "Test Item 1", "id": item_id}) # Note: Mock DB doesn't auto-assign ID here
          response = client.get(f"/${apiName.toLowerCase()}/{item_id}")
  
      assert response.status_code == 200
      data = response.json()
      assert data["id"] == item_id
      # assert data["name"] == "Test Item 1"
  
  def test_get_${modelName.toLowerCase()}_by_id_not_found(client):
      """Test getting a non-existent item."""
      response = client.get(f"/${apiName.toLowerCase()}/99999")
      assert response.status_code == 404
  
  def test_get_all_${apiName.toLowerCase()}(client):
      """Test getting all items, possibly with pagination/filtering."""
      # Create some items first if DB is empty
      client.post("/${apiName.toLowerCase()}/", json={"name": "Item A", "is_available": True})
      client.post("/${apiName.toLowerCase()}/", json={"name": "Item B", "is_available": False})
  
      response = client.get(f"/${apiName.toLowerCase()}/")
      assert response.status_code == 200
      assert isinstance(response.json(), list)
      assert len(response.json()) >= 2
  
      # Test filtering
      response_filtered = client.get(f"/${apiName.toLowerCase()}/?available_only=true")
      assert response_filtered.status_code == 200
      for item in response_filtered.json():
          assert item["is_available"] is True
  
  def test_update_${modelName.toLowerCase()}(client):
      """Test updating an existing item."""
      # Ensure item exists (e.g., ID 1)
      client.post("/${apiName.toLowerCase()}/", json={"name": "Item to Update", "id": 1}) # Ensure item 1 exists
  
      item_id = 1
      update_data = {"name": "Updated Name", "price": 123.45, "is_available": False}
      response = client.put(
          f"/${apiName.toLowerCase()}/{item_id}",
          json=update_data
      )
      assert response.status_code == 200
      data = response.json()
      assert data["id"] == item_id
      assert data["name"] == update_data["name"]
      assert data["price"] == update_data["price"]
      assert data["is_available"] == update_data["is_available"]
  
  def test_update_${modelName.toLowerCase()}_not_found(client):
      """Test updating a non-existent item."""
      response = client.put(
          f"/${apiName.toLowerCase()}/99999",
          json={"name": "Won't Update"}
      )
      assert response.status_code == 404
  
  def test_delete_${modelName.toLowerCase()}(client):
      """Test deleting an item."""
       # Ensure item exists (e.g., create one to delete)
      create_resp = client.post("/${apiName.toLowerCase()}/", json={"name": "Item to Delete"})
      item_id = create_resp.json()["id"]
  
      response = client.delete(f"/${apiName.toLowerCase()}/{item_id}")
      assert response.status_code == 204
  
      # Verify it's gone
      response_get = client.get(f"/${apiName.toLowerCase()}/{item_id}")
      assert response_get.status_code == 404
  
  def test_delete_${modelName.toLowerCase()}_not_found(client):
      """Test deleting a non-existent item."""
      response = client.delete(f"/${apiName.toLowerCase()}/99999")
      assert response.status_code == 404
  ` : ""}
  `;
  };