// templates/python/pythonDjango.js
// Python Django View Template

export const pyDjango = (options) => {
    const {
      includeComments = true,
      includeTests = false,
      className = 'Item', // Model name
      apiName = 'items'  // Base name for URL patterns
    } = options || {};
  
    const lowerClassName = className.toLowerCase();
    const modelName = className; // Django convention often uses capitalized model name
  
    return `from django.shortcuts import render, get_object_or_404
  from django.http import HttpResponse, JsonResponse, Http404
  from django.views import View
  from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
  from django.urls import reverse_lazy
  from django.contrib.auth.mixins import LoginRequiredMixin # Example Mixin
  import json # For API view parsing
  
  ${includeComments ? '# --- Model Definition (typically in models.py) ---' : ""}
  # from django.db import models
  #
  # class ${modelName}(models.Model):
  #     name = models.CharField(max_length=100)
  #     description = models.TextField(blank=True, null=True)
  #     price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
  #     is_available = models.BooleanField(default=True)
  #     created_at = models.DateTimeField(auto_now_add=True)
  #     updated_at = models.DateTimeField(auto_now=True)
  #
  #     def __str__(self):
  #         return self.name
  #
  #     class Meta:
  #         ordering = ['-created_at']
  #         # app_label = 'your_app_name' # Important if model is not in default app
  
  ${includeComments ? '# --- Form Definition (typically in forms.py) ---' : ""}
  # from django import forms
  # from .models import ${modelName}
  #
  # class ${modelName}Form(forms.ModelForm):
  #     class Meta:
  #         model = ${modelName}
  #         fields = ['name', 'description', 'price', 'is_available']
  #         widgets = {
  #             'description': forms.Textarea(attrs={'rows': 3}),
  #         }
  
  ${includeComments ? '# --- Class-Based Views (CBVs) for HTML Responses ---' : ""}
  
  ${includeComments ? '# List View: Displays a list of items' : ""}
  class ${modelName}ListView(ListView):
      # model = ${modelName} # Uncomment when model is defined
      template_name = '${lowerClassName}/${lowerClassName}_list.html' # e.g., item/item_list.html
      context_object_name = '${apiName}' # e.g., 'items'
  
      # Example: Add filtering based on query parameters
      # def get_queryset(self):
      #     queryset = super().get_queryset()
      #     is_available = self.request.GET.get('available')
      #     if is_available == 'true':
      #         queryset = queryset.filter(is_available=True)
      #     elif is_available == 'false':
      #         queryset = queryset.filter(is_available=False)
      #     return queryset
  
      # Example: Add extra context
      # def get_context_data(self, **kwargs):
      #     context = super().get_context_data(**kwargs)
      #     context['page_title'] = '${modelName} List'
      #     return context
      pass # Remove pass when model is set
  
  
  ${includeComments ? '# Detail View: Displays a single item' : ""}
  class ${modelName}DetailView(DetailView):
      # model = ${modelName} # Uncomment when model is defined
      template_name = '${lowerClassName}/${lowerClassName}_detail.html' # e.g., item/item_detail.html
      context_object_name = '${lowerClassName}' # e.g., 'item'
      pass # Remove pass when model is set
  
  
  ${includeComments ? '# Create View: Renders and handles the creation form' : ""}
  class ${modelName}CreateView(LoginRequiredMixin, CreateView): # Example: Require login
      # model = ${modelName} # Uncomment when model is defined
      # form_class = ${modelName}Form # Uncomment when form is defined
      template_name = '${lowerClassName}/${lowerClassName}_form.html' # Often uses the same form template
      success_url = reverse_lazy('${apiName}-list') # Redirect URL name after success
  
      # Example: Set owner automatically
      # def form_valid(self, form):
      #     form.instance.owner = self.request.user
      #     return super().form_valid(form)
      pass # Remove pass when model/form are set
  
  
  ${includeComments ? '# Update View: Renders and handles the update form for an existing item' : ""}
  class ${modelName}UpdateView(LoginRequiredMixin, UpdateView): # Example: Require login
      # model = ${modelName} # Uncomment when model is defined
      # form_class = ${modelName}Form # Uncomment when form is defined
      template_name = '${lowerClassName}/${lowerClassName}_form.html'
      # success_url = reverse_lazy('${apiName}-list') # Or redirect to detail view
      context_object_name = '${lowerClassName}'
  
      # Example: Redirect to detail view after update
      def get_success_url(self):
          return reverse_lazy('${apiName}-detail', kwargs={'pk': self.object.pk})
      pass # Remove pass when model/form are set
  
  
  ${includeComments ? '# Delete View: Shows confirmation and handles deletion' : ""}
  class ${modelName}DeleteView(LoginRequiredMixin, DeleteView): # Example: Require login
      # model = ${modelName} # Uncomment when model is defined
      template_name = '${lowerClassName}/${lowerClassName}_confirm_delete.html'
      success_url = reverse_lazy('${apiName}-list')
      context_object_name = '${lowerClassName}'
      pass # Remove pass when model is set
  
  
  ${includeComments ? '# --- API Views (Function-Based Views - FBVs - or use Django REST Framework) ---' : ""}
  
  # Example using simple function-based views for a JSON API
  
  from django.views.decorators.csrf import csrf_exempt # Use carefully for APIs
  from django.core.exceptions import ObjectDoesNotExist
  
  @csrf_exempt # Only if CSRF protection is handled differently (e.g., JWT)
  def ${lowerClassName}_api_list(request):
      ${includeComments ? '""" API endpoint for listing items or creating a new item. """' : ""}
      if request.method == 'GET':
          # try:
          #     items = ${modelName}.objects.all() # Fetch all items
          #     data = [{
          #         'id': item.id,
          #         'name': item.name,
          #         'description': item.description,
          #         # Convert Decimal to float/str for JSON
          #         'price': str(item.price),
          #         'is_available': item.is_available
          #     } for item in items]
          #     return JsonResponse(data, safe=False, status=200)
          # except Exception as e:
          #     return JsonResponse({'error': str(e)}, status=500)
          # Mock response
          return JsonResponse([{'id': 1, 'name': 'Sample GET'}], safe=False, status=200)
  
      elif request.method == 'POST':
          # try:
          #     data = json.loads(request.body)
          #     # Add validation here (e.g., using a form or serializer)
          #     if 'name' not in data:
          #         return JsonResponse({'error': 'Name is required'}, status=400)
          #
          #     item = ${modelName}.objects.create(
          #         name=data['name'],
          #         description=data.get('description'),
          #         price=data.get('price', 0),
          #         is_available=data.get('is_available', True)
          #     )
          #     response_data = {
          #        'id': item.id, 'name': item.name, 'price': str(item.price) # etc.
          #     }
          #     return JsonResponse(response_data, status=201) # Created
          # except json.JSONDecodeError:
          #      return JsonResponse({'error': 'Invalid JSON'}, status=400)
          # except Exception as e: # Catch other potential errors (DB, validation)
          #     return JsonResponse({'error': str(e)}, status=500)
           # Mock response
          return JsonResponse({'id': 99, 'name': 'Sample POST'}, status=201)
  
      else:
          return JsonResponse({'error': 'Method not allowed'}, status=405)
  
  
  @csrf_exempt # Only if CSRF protection is handled differently
  def ${lowerClassName}_api_detail(request, pk):
       ${includeComments ? '""" API endpoint for retrieving, updating, or deleting a specific item. """' : ""}
      # try:
      #     item = ${modelName}.objects.get(pk=pk)
      # except ObjectDoesNotExist:
      #      return JsonResponse({'error': '${modelName} not found'}, status=404)
      # Mock item finding
      if pk != 1: return JsonResponse({'error': '${modelName} not found'}, status=404)
      item = {'id': 1, 'name': 'Original Name'} # Mock object
  
      if request.method == 'GET':
          # try:
          #     response_data = {
          #        'id': item.id, 'name': item.name, 'price': str(item.price) # etc.
          #     }
          #     return JsonResponse(response_data, status=200)
          # except Exception as e:
          #     return JsonResponse({'error': str(e)}, status=500)
          # Mock response
          return JsonResponse(item, status=200)
  
  
      elif request.method == 'PUT':
          # try:
          #     data = json.loads(request.body)
          #     # Add validation here
          #     item.name = data.get('name', item.name)
          #     item.description = data.get('description', item.description)
          #     item.price = data.get('price', item.price)
          #     item.is_available = data.get('is_available', item.is_available)
          #     item.save()
          #     response_data = {
          #        'id': item.id, 'name': item.name, 'price': str(item.price) # etc.
          #     }
          #     return JsonResponse(response_data, status=200)
          # except json.JSONDecodeError:
          #      return JsonResponse({'error': 'Invalid JSON'}, status=400)
          # except Exception as e:
          #     return JsonResponse({'error': str(e)}, status=500)
           # Mock response
          return JsonResponse({'id': pk, 'name': 'Updated Name'}, status=200)
  
      elif request.method == 'DELETE':
          # try:
          #     item.delete()
          #     return HttpResponse(status=204) # No Content
          # except Exception as e:
          #      return JsonResponse({'error': str(e)}, status=500)
           # Mock response
          return HttpResponse(status=204)
  
      else:
          return JsonResponse({'error': 'Method not allowed'}, status=405)
  
  
  ${includeComments ? `# --- URL Configuration (typically in urls.py) ---
  # from django.urls import path
  # from . import views # Assuming views contains the classes/functions defined above
  
  # urlpatterns = [
  #     # HTML Views
  #     path('${apiName}/', views.${modelName}ListView.as_view(), name='${apiName}-list'),
  #     path('${apiName}/new/', views.${modelName}CreateView.as_view(), name='${apiName}-create'),
  #     path('${apiName}/<int:pk>/', views.${modelName}DetailView.as_view(), name='${apiName}-detail'),
  #     path('${apiName}/<int:pk>/edit/', views.${modelName}UpdateView.as_view(), name='${apiName}-update'),
  #     path('${apiName}/<int:pk>/delete/', views.${modelName}DeleteView.as_view(), name='${apiName}-delete'),
  #
  #     # API Views
  #     path('api/${apiName}/', views.${lowerClassName}_api_list, name='${apiName}-api-list'),
  #     path('api/${apiName}/<int:pk>/', views.${lowerClassName}_api_detail, name='${apiName}-api-detail'),
  # ]
  ` : ""}
  
  ${includeTests ? `
  # ================== TEST FILE (e.g., test_views.py or test_api.py) ==================
  # from django.test import TestCase, Client
  # from django.urls import reverse
  # from django.contrib.auth.models import User
  # from .models import ${modelName} # Import your model
  # import json
  
  # class ${modelName}APITests(TestCase):
  #
  #     def setUp(self):
  #         self.client = Client()
  #         # Create sample data
  #         self.item1 = ${modelName}.objects.create(name='API Test Item 1', price=10.0)
  #         self.item2 = ${modelName}.objects.create(name='API Test Item 2', price=20.0, is_available=False)
  #         self.list_url = reverse('${apiName}-api-list')
  #         self.detail_url = reverse('${apiName}-api-detail', kwargs={'pk': self.item1.pk})
  #         self.non_existent_detail_url = reverse('${apiName}-api-detail', kwargs={'pk': 9999})
  #
  #     def test_api_get_list(self):
  #         response = self.client.get(self.list_url)
  #         self.assertEqual(response.status_code, 200)
  #         data = response.json()
  #         self.assertEqual(len(data), 2)
  #         self.assertEqual(data[0]['name'], self.item1.name)
  #
  #     def test_api_get_detail_found(self):
  #         response = self.client.get(self.detail_url)
  #         self.assertEqual(response.status_code, 200)
  #         data = response.json()
  #         self.assertEqual(data['id'], self.item1.pk)
  #         self.assertEqual(data['name'], self.item1.name)
  #
  #     def test_api_get_detail_not_found(self):
  #         response = self.client.get(self.non_existent_detail_url)
  #         self.assertEqual(response.status_code, 404)
  #
  #     def test_api_post_create(self):
  #         payload = {'name': 'New API Item', 'price': 5.50}
  #         response = self.client.post(
  #             self.list_url,
  #             data=json.dumps(payload),
  #             content_type='application/json'
  #         )
  #         self.assertEqual(response.status_code, 201)
  #         data = response.json()
  #         self.assertEqual(data['name'], payload['name'])
  #         self.assertTrue(${modelName}.objects.filter(pk=data['id']).exists())
  #
  #     def test_api_post_create_invalid(self):
  #         payload = {'price': 10.0} # Missing name
  #         response = self.client.post(
  #             self.list_url,
  #             data=json.dumps(payload),
  #             content_type='application/json'
  #         )
  #         self.assertEqual(response.status_code, 400) # Or based on your validation
  #
  #     def test_api_put_update(self):
  #         payload = {'name': 'Updated API Item', 'is_available': False}
  #         response = self.client.put(
  #             self.detail_url,
  #             data=json.dumps(payload),
  #             content_type='application/json'
  #         )
  #         self.assertEqual(response.status_code, 200)
  #         data = response.json()
  #         self.assertEqual(data['name'], payload['name'])
  #         self.assertEqual(data['is_available'], payload['is_available'])
  #         self.item1.refresh_from_db() # Check database
  #         self.assertEqual(self.item1.name, payload['name'])
  #
  #     def test_api_put_update_not_found(self):
  #         payload = {'name': 'Wont update'}
  #         response = self.client.put(
  #             self.non_existent_detail_url,
  #             data=json.dumps(payload),
  #             content_type='application/json'
  #         )
  #         self.assertEqual(response.status_code, 404)
  #
  #     def test_api_delete(self):
  #         response = self.client.delete(self.detail_url)
  #         self.assertEqual(response.status_code, 204)
  #         self.assertFalse(${modelName}.objects.filter(pk=self.item1.pk).exists())
  #
  #     def test_api_delete_not_found(self):
  #         response = self.client.delete(self.non_existent_detail_url)
  #         self.assertEqual(response.status_code, 404)
  
  # Add similar tests for HTML views if needed, checking templates, context, etc.
  ` : ""}
  `;
  };