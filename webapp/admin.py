from django.contrib import admin
from .models import Device, Variable, Alarm, Trend


class VariableInline(admin.TabularInline):
    model = Variable
    extra = 0
    fields = ['item_name', 'io_device', 'tag_name', 'address', 'equipment', 'data_type']


class AlarmInline(admin.TabularInline):
    model = Alarm
    extra = 0
    fields = ['alarm_name', 'alarm_type', 'category', 'alarm_tag', 'equipment', 'item_name']


class TrendInline(admin.TabularInline):
    model = Trend
    extra = 0
    fields = ['tag_description', 'trend_types', 'tag_name', 'item_name', 'time']


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ['device_name', 'device_type', 'protocol', 'modbus_variant', 'created_at']
    list_filter = ['device_type', 'protocol', 'modbus_variant', 'created_at']
    search_fields = ['device_name', 'tag_prefix', 'io_device']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('device_name', 'device_type', 'tag_prefix', 'io_device', 'protocol', 'modbus_variant')
        }),
        ('Modbus TCP Settings', {
            'fields': ('device_ip', 'modbus_port', 'port_name', 'unit_number', 'memory'),
            'classes': ('collapse',),
        }),
        ('Modbus RTU Settings', {
            'fields': ('gateway_address', 'slave_id', 'port_name_rtu', 'memory_rtu', 'serial_port',
                       'baud_rate', 'data_bits', 'parity', 'stop_bits'),
            'classes': ('collapse',),
        }),
        ('IEC 61850 Settings', {
            'fields': ('iec_device_ip', 'iec_port', 'ied_name', 'access_point', 'logical_device', 'report_control'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    inlines = [VariableInline, AlarmInline, TrendInline]


@admin.register(Variable)
class VariableAdmin(admin.ModelAdmin):
    list_display = ['item_name', 'device', 'io_device', 'data_type', 'address']
    list_filter = ['data_type', 'device__device_type', 'created_at']
    search_fields = ['item_name', 'tag_name', 'equipment']
    raw_id_fields = ['device']


@admin.register(Alarm)
class AlarmAdmin(admin.ModelAdmin):
    list_display = ['alarm_name', 'device', 'alarm_type', 'category']
    list_filter = ['alarm_type', 'category', 'device__device_type', 'created_at']
    search_fields = ['alarm_name', 'alarm_tag', 'equipment']
    raw_id_fields = ['device']


@admin.register(Trend)
class TrendAdmin(admin.ModelAdmin):
    list_display = ['tag_description', 'device', 'trend_types', 'time']
    list_filter = ['trend_types', 'device__device_type', 'created_at']
    search_fields = ['tag_description', 'tag_name', 'item_name']
    raw_id_fields = ['device']
