from django.db import models
from django.contrib.auth.models import User
import json


class Device(models.Model):
    PROTOCOL_CHOICES = [
        ('modbus', 'Modbus'),
        ('iec', 'IEC 61850'),
    ]

    MODBUS_VARIANT_CHOICES = [
        ('tcp', 'TCP/IP'),
        ('rtu', 'RTU'),
    ]

    DEVICE_TYPE_CHOICES = [
        ('PV', 'PV Panel'),
        ('WindTurbine', 'Wind Turbine'),
        ('FuelTurbine', 'Fuel Turbine'),
        ('FuelCell', 'Fuel Cell'),
        ('BESS', 'BESS'),
        ('IED', 'IED'),
    ]


    device_name = models.CharField(max_length=50, unique=True)
    device_type = models.CharField(max_length=20, choices=DEVICE_TYPE_CHOICES)
    tag_prefix = models.CharField(max_length=10)
    io_device = models.CharField(max_length=50)
    protocol = models.CharField(max_length=10, choices=PROTOCOL_CHOICES)
    modbus_variant = models.CharField(max_length=5, choices=MODBUS_VARIANT_CHOICES, blank=True, null=True)


    device_ip = models.GenericIPAddressField(blank=True, null=True)
    modbus_port = models.IntegerField(default=502, blank=True, null=True)
    port_name = models.CharField(max_length=20, blank=True)
    unit_number = models.IntegerField(blank=True, null=True)
    memory = models.BooleanField(default=True)


    gateway_address = models.GenericIPAddressField(blank=True, null=True)
    slave_id = models.IntegerField(blank=True, null=True)
    port_name_rtu = models.CharField(max_length=20, blank=True)
    memory_rtu = models.BooleanField(default=True)
    serial_port = models.CharField(max_length=20, blank=True)
    baud_rate = models.IntegerField(default=38400, blank=True, null=True)
    data_bits = models.IntegerField(default=8, blank=True, null=True)
    parity = models.CharField(max_length=10, default='None', blank=True)
    stop_bits = models.IntegerField(default=1, blank=True, null=True)


    iec_device_ip = models.GenericIPAddressField(blank=True, null=True)
    iec_port = models.IntegerField(default=102, blank=True, null=True)
    ied_name = models.CharField(max_length=64, blank=True)
    access_point = models.CharField(max_length=32, blank=True)
    logical_device = models.CharField(max_length=64, blank=True)


    board_name = models.CharField(max_length=20, blank=True)
    memory_iec = models.CharField(max_length=5, default='true', blank=True)
    brcb = models.CharField(max_length=64, blank=True, help_text="Buffered Report Control Block")
    urcb = models.CharField(max_length=64, blank=True, help_text="Unbuffered Report Control Block")
    scl_file = models.CharField(max_length=255, blank=True, help_text="SCL File Path")


    report_control = models.CharField(max_length=64, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.device_name} ({self.device_type})"

    def clean(self):
        """Custom validation for IEC devices"""
        from django.core.exceptions import ValidationError

        if self.protocol == 'iec':

            if not self.brcb and not self.urcb:
                raise ValidationError({
                    'brcb': 'At least one Report Control Block (BRCB or URCB) is required for IEC devices.',
                    'urcb': 'At least one Report Control Block (BRCB or URCB) is required for IEC devices.'
                })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)



class Variable(models.Model):
    DATA_TYPE_CHOICES = [
        ('float', 'Float'),
        ('int', 'Integer'),
        ('bool', 'Boolean'),
        ('string', 'String'),
        ('REAL', 'Real'),
        ('INT', 'Integer'),
    ]

    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='variables')
    item_name = models.CharField(max_length=30)
    io_device = models.CharField(max_length=50)
    tag_name = models.CharField(max_length=100)
    address = models.CharField(max_length=20)
    equipment = models.CharField(max_length=50)
    data_type = models.CharField(max_length=10, choices=DATA_TYPE_CHOICES, default='float')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['device', 'item_name']
        ordering = ['item_name']

    def __str__(self):
        return f"{self.device.device_name} - {self.item_name}"


class Alarm(models.Model):
    ALARM_TYPE_CHOICES = [
        ('analog', 'Analog'),
        ('digital', 'Digital'),
        ('advanced', 'Advanced'),
    ]

    CATEGORY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('event', 'Event'),
    ]

    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='alarms')
    alarm_name = models.CharField(max_length=50)
    alarm_type = models.CharField(max_length=10, choices=ALARM_TYPE_CHOICES)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    alarm_tag = models.CharField(max_length=30)
    equipment = models.CharField(max_length=30)
    item_name = models.CharField(max_length=30)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['device', 'alarm_name']
        ordering = ['alarm_name']

    def __str__(self):
        return f"{self.device.device_name} - {self.alarm_name}"


class Trend(models.Model):
    TREND_TYPE_CHOICES = [
        ('event', 'Event'),
        ('periodic', 'Periodic'),
        ('periodic-event', 'Periodic-Event'),
    ]

    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='trends')
    tag_description = models.CharField(max_length=100)
    trend_types = models.CharField(max_length=15, choices=TREND_TYPE_CHOICES)
    tag_name = models.CharField(max_length=50)
    item_name = models.CharField(max_length=30)
    time = models.CharField(max_length=10, default='00:00')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['device', 'tag_description']
        ordering = ['tag_description']

    def __str__(self):
        return f"{self.device.device_name} - {self.tag_description}"