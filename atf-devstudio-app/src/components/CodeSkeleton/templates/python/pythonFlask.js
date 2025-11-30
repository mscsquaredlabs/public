// templates/python/pythonFlask.js
// Python Flask Route Template

export const pyFlask = (options) => {
    const {
      includeComments = true,
      includeTests = false,
      apiName = 'items'
    } = options || {};
  
    // Determine class/schema names
    const baseName = apiName.endsWith('s') ? apiName.slice(0, -1) : apiName; // e.g., item
    const schemaName = baseName.charAt(0).toUpperCase() + baseName.slice(1) + 'Schema'; // e.g., ItemSchema
    const itemListResourceName = baseName.charAt(0).toUpperCase() + baseName.slice(1) + 'List'; // e.g., ItemList
    const itemResourceName = baseName.charAt(0).toUpperCase() + baseName.slice(1); // e.g., Item
  
    return `from flask import Flask, request, jsonify, Blueprint
  from flask_restful import Api, Resource, reqparse
  from marshmallow import Schema, fields, ValidationError, post_load
  ${includeTests ? 'import pytest\n# from app import create_app # Assuming factory pattern for app creation\n' : ''}
  
  ${includeComments ? '# --- Blueprint Setup ---' : ""}
  ${apiName}_bp = Blueprint('${apiName}', __name__, url_prefix='/api/${apiName}')
  api = Api(${apiName}_bp)
  
  ${includeComments ? '# --- Data Schema (using Marshmallow) ---' : ""}
  class ${schemaName}(Schema):
      id = fields.Int(dump_only=True) # Read-only field
      name = fields.Str(required=True, error_messages={"required": "Name is required."})
      description = fields.Str()
      price = fields.Float(validate=lambda p: p >= 0) # Example validation
      is_available = fields.Bool(missing=True) # Default value if missing on load
  
      # Example: Use post_load to create an object instance if needed
      # @post_load
      # def make_object(self, data, **kwargs):
      #     return YourDataObject(**data)
  
  # --- Sample data (replace with database interaction) ---
  items_db = {
      1: {"id": 1, "name": "Flask Item 1", "description": "First item", "price": 19.99, "is_available": True},
      2: {"id": 2, "name": "Flask Item 2", "description": "Second item", "price": 29.99, "is_available": False}
  }
  next_item_id = 3
  
  # --- Resources ---
  
  ${includeComments ? '# Resource for the collection of items (/api/' + apiName + ')' : ""}
  class ${itemListResourceName}(Resource):
      def get(self):
          ${includeComments ? '"""Get all items."""' : ""}
          schema = ${schemaName}(many=True)
          # Apply filtering/pagination here if needed
          result = schema.dump(items_db.values())
          return jsonify(result)
  
      def post(self):
          ${includeComments ? '"""Create a new item."""' : ""}
          schema = ${schemaName}()
          try:
              # Validate and deserialize input
              data = schema.load(request.get_json())
  
              # Logic to add item (replace with DB logic)
              global next_item_id
              new_item = {"id": next_item_id, **data}
              items_db[next_item_id] = new_item
              next_item_id += 1
  
              # Serialize the created item for response
              return schema.dump(new_item), 201
          except ValidationError as err:
              return {"errors": err.messages}, 400
          except Exception as e:
              # Generic error handler
               return {"message": "An error occurred creating the item.", "error": str(e)}, 500
  
  
  ${includeComments ? '# Resource for a single item (/api/' + apiName + '/<int:item_id>)' : ""}
  class ${itemResourceName}(Resource):
      def get(self, item_id):
          ${includeComments ? '"""Get a specific item by ID."""' : ""}
          schema = ${schemaName}()
          item = items_db.get(item_id)
          if item is None:
              return {"message": f"Item with ID {item_id} not found"}, 404
          return schema.dump(item)
  
      def put(self, item_id):
          ${includeComments ? '"""Update an existing item."""' : ""}
          schema = ${schemaName}()
          item = items_db.get(item_id)
          if item is None:
              return {"message": f"Item with ID {item_id} not found"}, 404
  
          try:
              # Validate and deserialize input (allow partial updates if needed)
              # Marshmallow load defaults to requiring all fields unless partial=True
              update_data = schema.load(request.get_json(), partial=True)
  
              # Logic to update item (replace with DB logic)
              item.update(update_data)
  
              # Serialize the updated item
              return schema.dump(item)
          except ValidationError as err:
              return {"errors": err.messages}, 400
          except Exception as e:
               return {"message": "An error occurred updating the item.", "error": str(e)}, 500
  
      def delete(self, item_id):
          ${includeComments ? '"""Delete an item."""' : ""}
          global items_db
          if item_id not in items_db:
              return {"message": f"Item with ID {item_id} not found"}, 404
  
          # Logic to delete item (replace with DB logic)
          del items_db[item_id]
  
          return '', 204 # No Content response
  
  ${includeComments ? '# Register resources with the API' : ""}
  api.add_resource(${itemListResourceName}, '/') # Route is relative to blueprint prefix
  api.add_resource(${itemResourceName}, '/<int:item_id>')
  
  ${includeComments ? '# You would register this blueprint in your main Flask app:\n# from .routes import ' + apiName + '_bp\n# app.register_blueprint(' + apiName + '_bp)' : ''}
  
  ${includeTests ? `
  # ================== TEST FILE (e.g., test_${apiName}.py) ==================
  # import json
  # from flask import url_for
  
  # Note: These tests assume the blueprint is registered in the app fixture
  
  def test_get_all_${apiName}(client): # Pass test client fixture
      """Test GET /api/${apiName}/"""
      response = client.get(url_for('${apiName}.${itemListResourceName.lower()}')) # Use endpoint name
      assert response.status_code == 200
      data = response.get_json()
      assert isinstance(data, list)
      # assert len(data) >= 2 # Depending on initial state
  
  def test_get_${baseName}_by_id(client):
      """Test GET /api/${apiName}/<item_id>"""
      item_id = 1 # Assuming item 1 exists
      response = client.get(url_for('${apiName}.${itemResourceName.lower()}', item_id=item_id))
      assert response.status_code == 200
      data = response.get_json()
      assert data['id'] == item_id
  
  def test_get_${baseName}_by_id_not_found(client):
      """Test GET /api/${apiName}/<item_id> for non-existent ID."""
      response = client.get(url_for('${apiName}.${itemResourceName.lower()}', item_id=9999))
      assert response.status_code == 404
  
  def test_create_${baseName}(client):
      """Test POST /api/${apiName}/"""
      new_item_data = {"name": "Flask New Item", "price": 50.0}
      response = client.post(
          url_for('${apiName}.${itemListResourceName.lower()}'),
          json=new_item_data
      )
      assert response.status_code == 201
      data = response.get_json()
      assert data['name'] == new_item_data['name']
      assert 'id' in data
  
  def test_create_${baseName}_validation_error(client):
       """Test POST /api/${apiName}/ with invalid data."""
       invalid_data = {"price": -10} # Missing name, invalid price
       response = client.post(
          url_for('${apiName}.${itemListResourceName.lower()}'),
          json=invalid_data
       )
       assert response.status_code == 400
       assert 'errors' in response.get_json()
       assert 'name' in response.get_json()['errors'] # Check for missing name error
  
  def test_update_${baseName}(client):
      """Test PUT /api/${apiName}/<item_id>"""
      item_id = 1 # Assuming item 1 exists
      update_data = {"name": "Updated Flask Item", "description": "New Desc"}
      response = client.put(
          url_for('${apiName}.${itemResourceName.lower()}', item_id=item_id),
          json=update_data
      )
      assert response.status_code == 200
      data = response.get_json()
      assert data['id'] == item_id
      assert data['name'] == update_data['name']
      assert data['description'] == update_data['description']
  
  def test_update_${baseName}_not_found(client):
      """Test PUT /api/${apiName}/<item_id> for non-existent ID."""
      response = client.put(
          url_for('${apiName}.${itemResourceName.lower()}', item_id=9999),
          json={"name": "Wont Update"}
      )
      assert response.status_code == 404
  
  def test_delete_${baseName}(client):
      """Test DELETE /api/${apiName}/<item_id>"""
      # Create an item to delete first if needed, or use existing ID
      item_id = 2 # Assuming item 2 exists
      response = client.delete(url_for('${apiName}.${itemResourceName.lower()}', item_id=item_id))
      assert response.status_code == 204
  
      # Verify deletion
      response_get = client.get(url_for('${apiName}.${itemResourceName.lower()}', item_id=item_id))
      assert response_get.status_code == 404
  
  def test_delete_${baseName}_not_found(client):
      """Test DELETE /api/${apiName}/<item_id> for non-existent ID."""
      response = client.delete(url_for('${apiName}.${itemResourceName.lower()}', item_id=9999))
      assert response.status_code == 404
  ` : ""}
  `;
  };