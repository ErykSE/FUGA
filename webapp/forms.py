from django import forms
from .models import Device, Variable, Alarm, Trend


class DeviceForm(forms.ModelForm):
    class Meta:
        model = Device
        fields = '__all__'
        widgets = {
            'device_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. PV_Panel_01'
            }),
            'device_type': forms.Select(attrs={'class': 'form-control'}),
            'tag_prefix': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. FugaPV1'
            }),
            'io_device': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. Inverter_PV1'
            }),
            'protocol': forms.Select(attrs={'class': 'form-control'}),
            'modbus_variant': forms.Select(attrs={'class': 'form-control'}),
            'device_ip': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. 192.168.1.100'
            }),
            'modbus_port': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': 1,
                'max': 65535
            }),
            'port_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. P14_BOARD1_PRJ3'
            }),
            'gateway_address': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. 192.168.1.100'
            }),
            'slave_id': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': 1,
                'max': 247
            }),
            'serial_port': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. COM1'
            }),
            'iec_device_ip': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. 192.168.1.100'
            }),
            'ied_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. PROT_RELAY_01'
            }),
        }

    def clean_device_name(self):
        device_name = self.cleaned_data.get('device_name')
        if device_name and not device_name.replace('_', '').replace('-', '').isalnum():
            raise forms.ValidationError("Device name can only contain letters, numbers, underscores, and hyphens.")
        return device_name


class VariableForm(forms.ModelForm):
    class Meta:
        model = Variable
        exclude = ['device']
        widgets = {
            'item_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. Ia'
            }),
            'io_device': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. Inverter_01'
            }),
            'tag_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. MMXU1\\A\\phsA'
            }),
            'address': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. 40001'
            }),
            'equipment': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. Virtual.System'
            }),
            'data_type': forms.Select(attrs={'class': 'form-control'}),
        }


class AlarmForm(forms.ModelForm):
    class Meta:
        model = Alarm
        exclude = ['device']
        widgets = {
            'alarm_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. PowerFailure24V'
            }),
            'alarm_type': forms.Select(attrs={'class': 'form-control'}),
            'category': forms.Select(attrs={'class': 'form-control'}),
            'alarm_tag': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. User_Event'
            }),
            'equipment': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. Virtual.System'
            }),
            'item_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. CommHealth'
            }),
        }


class TrendForm(forms.ModelForm):
    class Meta:
        model = Trend
        exclude = ['device']
        widgets = {
            'tag_description': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. Current A'
            }),
            'trend_types': forms.Select(attrs={'class': 'form-control'}),
            'tag_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. PV4'
            }),
            'item_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. PVPanel4'
            }),
            'time': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. 00:15'
            }),
        }