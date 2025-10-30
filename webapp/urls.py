from django.urls import path
from . import views

app_name = 'webapp'

urlpatterns = [
    # Hub - main landing page
    path('', views.hub, name='hub'),
    
    # Device Configuration Generator
    path('config/', views.index, name='index'),


    path('api/devices/', views.get_devices, name='get_devices'),
    path('api/device/save/', views.save_device, name='save_device'),
    path('api/device/<int:device_id>/', views.get_device, name='get_device'),
    path('api/device/<int:device_id>/delete/', views.delete_device, name='delete_device'),


    path('api/csv/generate/', views.generate_csv, name='generate_csv'),
    path('api/csv/upload/', views.upload_csv, name='upload_csv'),


    path('api/cid/upload/', views.upload_cid, name='upload_cid'),


    path('api/iec/xml/', views.generate_iec_xml_only, name='generate_iec_xml_only'),
]