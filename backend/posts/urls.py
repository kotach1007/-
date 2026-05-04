from django.urls import path
from . import views

urlpatterns = [
    path('', views.post_list, name='post_list'),
    path('<int:pk>/', views.post_detail, name='post_detail'),
    path('<int:pk>/comments/', views.comment_create, name='comment_create'),
    path('comments/<int:pk>/', views.comment_delete, name='comment_delete'),
]
