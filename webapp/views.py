import zipfile

from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib import messages
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils.decorators import method_decorator
from django.views import View
import json
import csv
import io
import xml.etree.ElementTree as ET
from .models import Device, Variable, Alarm, Trend
from .forms import DeviceForm, VariableForm, AlarmForm, TrendForm


def hub(request):
    """
    Landing page - main hub with links to all systems
    """
    return render(request, 'webapp/hub.html')


def index(request):
    """
    Device Configuration Generator - main application
    """
    devices = Device.objects.all().order_by('-created_at')
    context = {
        'devices': devices,
        'device_count': devices.count()
    }
    return render(request, 'webapp/index.html', context)


@require_http_methods(["GET"])
def get_devices(request):

    try:
        devices = Device.objects.all().order_by('-created_at')
        device_list = []

        for device in devices:
            device_list.append({
                'id': device.id,
                'device_name': device.device_name,
                'device_type': device.device_type,
                'protocol': device.protocol,
                'created_at': device.created_at.isoformat()
            })

        return JsonResponse({
            'success': True,
            'devices': device_list
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def save_device(request):

    try:
        data = json.loads(request.body)
        device_id = data.get('id')


        required_fields = ['device_name', 'device_type', 'tag_prefix', 'io_device', 'protocol']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({
                    'success': False,
                    'error': f'{field} is required'
                }, status=400)

        with transaction.atomic():
            if device_id and device_id != 'new':

                device = get_object_or_404(Device, id=device_id)
            else:

                device = Device()


            device.device_name = data['device_name']
            device.device_type = data['device_type']
            device.tag_prefix = data['tag_prefix']
            device.io_device = data['io_device']
            device.protocol = data['protocol']
            device.modbus_variant = data.get('modbus_variant', 'tcp')


            if data['protocol'] == 'modbus':
                if data.get('modbus_variant') == 'tcp':
                    device.device_ip = data.get('device_ip')
                    device.modbus_port = data.get('modbus_port', 502)
                    device.port_name = data.get('port_name', '')
                    device.unit_number = data.get('unit_number', 1)
                    device.memory = data.get('memory', True)
                else:
                    device.gateway_address = data.get('gateway_address')
                    device.slave_id = data.get('slave_id')
                    device.port_name_rtu = data.get('port_name_rtu', '')
                    device.memory_rtu = data.get('memory_rtu', True)
                    device.serial_port = data.get('serial_port', '')
                    device.baud_rate = data.get('baud_rate', 38400)
                    device.data_bits = data.get('data_bits', 8)
                    device.parity = data.get('parity', 'None')
                    device.stop_bits = data.get('stop_bits', 1)

            elif data['protocol'] == 'iec':
                device.iec_device_ip = data.get('iec_device_ip')
                device.iec_port = data.get('iec_port', 102)
                device.ied_name = data.get('ied_name', '')
                device.access_point = data.get('access_point', '')
                device.logical_device = data.get('logical_device', '')
                device.report_control = data.get('report_control', '')

            device.save()


            if 'variables' in data:

                device.variables.all().delete()
                for var_data in data['variables']:
                    Variable.objects.create(
                        device=device,
                        item_name=var_data.get('item_name', ''),
                        io_device=var_data.get('io_device', ''),
                        tag_name=var_data.get('tag_name', ''),
                        address=var_data.get('address', ''),
                        equipment=var_data.get('equipment', ''),
                        data_type=var_data.get('data_type', 'float')
                    )

            if 'alarms' in data:
                device.alarms.all().delete()
                for alarm_data in data['alarms']:
                    Alarm.objects.create(
                        device=device,
                        alarm_name=alarm_data.get('alarm_name', ''),
                        alarm_type=alarm_data.get('alarm_type', 'analog'),
                        category=alarm_data.get('category', 'low'),
                        alarm_tag=alarm_data.get('alarm_tag', ''),
                        equipment=alarm_data.get('equipment', ''),
                        item_name=alarm_data.get('item_name', '')
                    )

            if 'trends' in data:
                device.trends.all().delete()
                for trend_data in data['trends']:
                    Trend.objects.create(
                        device=device,
                        tag_description=trend_data.get('tag_description', ''),
                        trend_types=trend_data.get('trend_types', 'periodic'),
                        tag_name=trend_data.get('tag_name', ''),
                        item_name=trend_data.get('item_name', ''),
                        time=trend_data.get('time', '00:00')
                    )

        return JsonResponse({
            'success': True,
            'device_id': device.id,
            'message': 'Device saved successfully'
        })

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_http_methods(["GET"])
def get_device(request, device_id):

    try:
        device = get_object_or_404(Device, id=device_id)

        device_data = {
            'id': device.id,
            'device_name': device.device_name,
            'device_type': device.device_type,
            'tag_prefix': device.tag_prefix,
            'io_device': device.io_device,
            'protocol': device.protocol,
            'modbus_variant': device.modbus_variant,

            'device_ip': device.device_ip,
            'modbus_port': device.modbus_port,
            'port_name': device.port_name,
            'unit_number': device.unit_number,
            'memory': device.memory,

            'gateway_address': device.gateway_address,
            'slave_id': device.slave_id,
            'port_name_rtu': device.port_name_rtu,
            'memory_rtu': device.memory_rtu,
            'serial_port': device.serial_port,
            'baud_rate': device.baud_rate,
            'data_bits': device.data_bits,
            'parity': device.parity,
            'stop_bits': device.stop_bits,

            'iec_device_ip': device.iec_device_ip,
            'iec_port': device.iec_port,
            'ied_name': device.ied_name,
            'access_point': device.access_point,
            'logical_device': device.logical_device,
            'report_control': device.report_control,

            'variables': [
                {
                    'id': str(var.id),
                    'item_name': var.item_name,
                    'io_device': var.io_device,
                    'tag_name': var.tag_name,
                    'address': var.address,
                    'equipment': var.equipment,
                    'data_type': var.data_type
                } for var in device.variables.all()
            ],
            'alarms': [
                {
                    'id': str(alarm.id),
                    'alarm_name': alarm.alarm_name,
                    'alarm_type': alarm.alarm_type,
                    'category': alarm.category,
                    'alarm_tag': alarm.alarm_tag,
                    'equipment': alarm.equipment,
                    'item_name': alarm.item_name
                } for alarm in device.alarms.all()
            ],
            'trends': [
                {
                    'id': str(trend.id),
                    'tag_description': trend.tag_description,
                    'trend_types': trend.trend_types,
                    'tag_name': trend.tag_name,
                    'item_name': trend.item_name,
                    'time': trend.time
                } for trend in device.trends.all()
            ]
        }

        return JsonResponse({
            'success': True,
            'device': device_data
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def delete_device(request, device_id):

    try:
        device = get_object_or_404(Device, id=device_id)
        device_name = device.device_name
        device.delete()

        return JsonResponse({
            'success': True,
            'message': f'Device {device_name} deleted successfully'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_http_methods(["GET"])
def generate_csv(request):

    try:
        csv_type = request.GET.get('type', 'all')
        devices = Device.objects.all().prefetch_related('variables', 'alarms', 'trends')

        if csv_type == 'equipment':
            return generate_equipment_csv(devices)
        elif csv_type == 'units':
            return generate_units_csv(devices)
        elif csv_type == 'variables':
            return generate_variables_csv(devices)
        elif csv_type == 'alarms':
            return generate_alarms_csv(devices)
        elif csv_type == 'trends':
            return generate_trends_csv(devices)
        else:
            return JsonResponse({
                'success': False,
                'error': 'Invalid CSV type'
            }, status=400)

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


def generate_equipment_csv(devices):

    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="EQUIP.csv"'

    writer = csv.writer(response, delimiter=';', quoting=csv.QUOTE_MINIMAL)


    writer.writerow([
        'ITEM_NAME', 'EQUIP_TYPE', 'COMMENT', 'CUSTOM01', 'CUSTOM02',
        'PROTOCOL', 'IP_ADDRESS', 'PORT'
    ])

    for device in devices:

        ip_address = ''
        port = ''

        if device.protocol == 'modbus':
            if device.modbus_variant == 'tcp':
                ip_address = device.device_ip or ''
                port = str(device.modbus_port or 502)
            else:
                ip_address = device.gateway_address or ''
                port = str(device.slave_id or 1)
        elif device.protocol == 'iec':
            ip_address = device.iec_device_ip or ''
            port = str(device.iec_port or 102)

        writer.writerow([
            device.device_name,
            device.device_type,
            f'{device.device_type} - {device.device_name}',
            device.tag_prefix,
            device.io_device,
            device.protocol.upper(),
            ip_address,
            port
        ])

    return response


def generate_units_csv(devices):

    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="UNITS.csv"'

    writer = csv.writer(response, delimiter=';', quoting=csv.QUOTE_MINIMAL)


    writer.writerow([
        'UNIT_NAME', 'UNIT_TYPE', 'PORT_NAME', 'IP_ADDRESS', 'PROTOCOL',
        'MEMORY', 'UNIT_NUMBER', 'BAUD_RATE', 'DATA_BITS', 'PARITY', 'STOP_BITS'
    ])

    for device in devices:
        if device.protocol == 'modbus':
            if device.modbus_variant == 'tcp':
                writer.writerow([
                    device.device_name,
                    'MODBUS_TCP',
                    device.port_name or f'PORT_{device.device_name}',
                    device.device_ip or '',
                    'MODBUS_TCP',
                    'TRUE' if device.memory else 'FALSE',
                    device.unit_number or 1,
                    '', '', '', ''
                ])
            else:
                writer.writerow([
                    device.device_name,
                    'MODBUS_RTU',
                    device.port_name_rtu or f'PORT_{device.device_name}',
                    device.gateway_address or '',
                    'MODBUS_RTU',
                    'TRUE' if device.memory_rtu else 'FALSE',
                    device.slave_id or 1,
                    device.baud_rate or 38400,
                    device.data_bits or 8,
                    device.parity or 'None',
                    device.stop_bits or 1
                ])
        elif device.protocol == 'iec':
            writer.writerow([
                device.device_name,
                'IEC61850',
                device.ied_name or f'IED_{device.device_name}',
                device.iec_device_ip or '',
                'IEC61850',
                'TRUE',
                device.iec_port or 102,
                '', '', '', ''
            ])

    return response


def generate_variables_csv(devices):

    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="VARIABLES.csv"'

    writer = csv.writer(response, delimiter=';', quoting=csv.QUOTE_MINIMAL)


    writer.writerow([
        'EQUIPMENT', 'ITEM_NAME', 'TAG_NAME', 'IO_DEVICE', 'DATA_TYPE',
        'ADDRESS', 'UNIT', 'DESCRIPTION', 'MIN_VALUE', 'MAX_VALUE'
    ])

    for device in devices:
        for variable in device.variables.all():

            data_type_mapping = {
                'float': 'REAL',
                'int': 'INT',
                'bool': 'BOOL',
                'string': 'STRING'
            }

            power_op_data_type = data_type_mapping.get(variable.data_type, 'REAL')

            writer.writerow([
                variable.equipment or device.device_name,
                variable.item_name,
                variable.tag_name,
                variable.io_device or device.io_device,
                power_op_data_type,
                variable.address,
                '',
                f'{variable.item_name} from {device.device_name}',
                '',
                ''
            ])

    return response


def generate_alarms_csv(devices):

    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="ALARMS.csv"'

    writer = csv.writer(response, delimiter=';', quoting=csv.QUOTE_MINIMAL)


    writer.writerow([
        'EQUIPMENT', 'ITEM_NAME', 'ALARM_TAG', 'ALARM_NAME', 'CATEGORY',
        'ALARM_TYPE', 'PRIORITY', 'ACKNOWLEDGE', 'LOG'
    ])

    for device in devices:
        for alarm in device.alarms.all():

            priority_mapping = {
                'low': 'LOW',
                'medium': 'MEDIUM',
                'high': 'HIGH',
                'event': 'INFO'
            }

            priority = priority_mapping.get(alarm.category, 'MEDIUM')

            writer.writerow([
                alarm.equipment or device.device_name,
                alarm.item_name,
                alarm.alarm_tag,
                alarm.alarm_name,
                alarm.category.upper(),
                alarm.alarm_type.upper(),
                priority,
                'TRUE',
                'TRUE'
            ])

    return response


def generate_trends_csv(devices):

    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="TRENDS.csv"'

    writer = csv.writer(response, delimiter=';', quoting=csv.QUOTE_MINIMAL)


    writer.writerow([
        'TAG_DESCRIPTION', 'TREND_TYPES', 'TAG_NAME', 'ITEM_NAME',
        'TIME_INTERVAL', 'RETENTION', 'COMPRESSION'
    ])

    for device in devices:
        for trend in device.trends.all():

            time_interval = trend.time or '00:01'
            if ':' in time_interval:

                parts = time_interval.split(':')
                if len(parts) == 2:
                    minutes = int(parts[0])
                    seconds = int(parts[1])
                    total_seconds = minutes * 60 + seconds
                    if total_seconds >= 60:
                        time_interval = f'{total_seconds // 60}MIN'
                    else:
                        time_interval = f'{total_seconds}SEC'
                else:
                    time_interval = '1MIN'

            writer.writerow([
                trend.tag_description,
                trend.trend_types.upper(),
                trend.tag_name,
                trend.item_name,
                time_interval,
                '30DAYS',
                'TRUE'
            ])

    return response


@csrf_exempt
@require_http_methods(["POST"])
def upload_csv(request):

    try:
        if 'file' not in request.FILES:
            return JsonResponse({
                'success': False,
                'error': 'No file uploaded'
            }, status=400)

        file = request.FILES['file']
        csv_type = request.POST.get('type', '')

        if not file.name.endswith('.csv'):
            return JsonResponse({
                'success': False,
                'error': 'File must be a CSV'
            }, status=400)


        try:
            decoded_file = file.read().decode('utf-8')
        except UnicodeDecodeError:

            file.seek(0)
            decoded_file = file.read().decode('iso-8859-1')

        csv_reader = csv.reader(io.StringIO(decoded_file), delimiter=';')

        if csv_type == 'equipment':
            return process_equipment_csv(csv_reader)
        elif csv_type == 'variables':
            return process_variables_csv(csv_reader)
        elif csv_type == 'alarms':
            return process_alarms_csv(csv_reader)
        elif csv_type == 'trends':
            return process_trends_csv(csv_reader)
        else:
            return JsonResponse({
                'success': False,
                'error': 'Invalid CSV type'
            }, status=400)

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error processing CSV: {str(e)}'
        }, status=500)


def process_equipment_csv(csv_reader):

    try:
        rows = list(csv_reader)
        if len(rows) < 2:
            return JsonResponse({
                'success': False,
                'error': 'CSV file is empty or missing header row'
            })

        header = rows[0]
        created_devices = 0
        updated_devices = 0

        with transaction.atomic():
            for row in rows[1:]:
                if len(row) < len(header):
                    continue

                row_data = dict(zip(header, row))


                device_name = row_data.get('ITEM_NAME', '').strip()
                if not device_name:
                    continue

                device_type = row_data.get('EQUIP_TYPE', 'PV').strip()
                tag_prefix = row_data.get('CUSTOM01', device_name[:10]).strip()
                io_device = row_data.get('CUSTOM02', f'IO_{device_name}').strip()
                protocol = row_data.get('PROTOCOL', 'MODBUS').lower().strip()
                ip_address = row_data.get('IP_ADDRESS', '').strip()
                port = row_data.get('PORT', '502').strip()


                if 'iec' in protocol or '61850' in protocol:
                    protocol = 'iec'
                else:
                    protocol = 'modbus'


                device, created = Device.objects.update_or_create(
                    device_name=device_name,
                    defaults={
                        'device_type': device_type,
                        'tag_prefix': tag_prefix,
                        'io_device': io_device,
                        'protocol': protocol,
                        'modbus_variant': 'tcp' if protocol == 'modbus' else None,
                        'device_ip': ip_address if protocol == 'modbus' else None,
                        'modbus_port': int(port) if protocol == 'modbus' and port.isdigit() else 502,
                        'iec_device_ip': ip_address if protocol == 'iec' else None,
                        'iec_port': int(port) if protocol == 'iec' and port.isdigit() else 102,
                        'port_name': f'PORT_{device_name}',
                        'ied_name': device_name if protocol == 'iec' else '',
                        'access_point': 'S1' if protocol == 'iec' else '',
                        'logical_device': 'LD0' if protocol == 'iec' else ''
                    }
                )

                if created:
                    created_devices += 1
                else:
                    updated_devices += 1

        return JsonResponse({
            'success': True,
            'message': f'Processed equipment CSV: {created_devices} created, {updated_devices} updated'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error processing equipment CSV: {str(e)}'
        })


def process_variables_csv(csv_reader):

    try:
        rows = list(csv_reader)
        if len(rows) < 2:
            return JsonResponse({
                'success': False,
                'error': 'CSV file is empty or missing header row'
            })

        header = rows[0]
        created_variables = 0


        data_type_mapping = {
            'REAL': 'float',
            'INT': 'int',
            'BOOL': 'bool',
            'STRING': 'string',
            'FLOAT': 'float',
            'INTEGER': 'int',
            'BOOLEAN': 'bool'
        }

        with transaction.atomic():
            for row in rows[1:]:
                if len(row) < len(header):
                    continue

                row_data = dict(zip(header, row))

                equipment_name = row_data.get('EQUIPMENT', '').strip()
                item_name = row_data.get('ITEM_NAME', '').strip()

                if not equipment_name or not item_name:
                    continue


                try:
                    device = Device.objects.get(device_name=equipment_name)
                except Device.DoesNotExist:

                    continue


                csv_data_type = row_data.get('DATA_TYPE', 'REAL').strip().upper()
                data_type = data_type_mapping.get(csv_data_type, 'float')


                variable, created = Variable.objects.update_or_create(
                    device=device,
                    item_name=item_name,
                    defaults={
                        'io_device': row_data.get('IO_DEVICE', device.io_device).strip(),
                        'tag_name': row_data.get('TAG_NAME', item_name).strip(),
                        'address': row_data.get('ADDRESS', '40001').strip(),
                        'equipment': equipment_name,
                        'data_type': data_type
                    }
                )

                if created:
                    created_variables += 1

        return JsonResponse({
            'success': True,
            'message': f'Processed variables CSV: {created_variables} variables created'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error processing variables CSV: {str(e)}'
        })


def process_alarms_csv(csv_reader):

    try:
        rows = list(csv_reader)
        if len(rows) < 2:
            return JsonResponse({
                'success': False,
                'error': 'CSV file is empty or missing header row'
            })

        header = [col.strip() for col in rows[0]]
        alarms_imported = 0
        alarms_data = []



        for row_idx, row in enumerate(rows[1:], 1):
            if len(row) < len(header):

                row.extend([''] * (len(header) - len(row)))

            row_data = dict(zip(header, [cell.strip() if cell else '' for cell in row]))


            equipment = row_data.get('Equipment', '').strip()
            item_name = row_data.get('Item Name', '').strip()


            alarm_name = (row_data.get('Alarm Name', '') or
                          row_data.get('ALARM_NAME', '') or
                          row_data.get('Tag Name', '') or
                          row_data.get('TAG_NAME', '') or
                          item_name).strip()


            if not alarm_name or not item_name:
                continue


            data_type = row_data.get('Data Type', row_data.get('TYPE', 'ANALOG')).strip().upper()
            alarm_type = 'analog'
            if 'DIGITAL' in data_type or 'BOOL' in data_type:
                alarm_type = 'digital'
            elif 'ADVANCED' in data_type or 'COMPLEX' in data_type:
                alarm_type = 'advanced'


            category = row_data.get('Category', row_data.get('CATEGORY', '')).strip().lower()
            if not category:
                alarm_name_upper = alarm_name.upper()
                if any(word in alarm_name_upper for word in ['CRITICAL', 'FAULT', 'FAIL', 'EMERGENCY']):
                    category = 'high'
                elif any(word in alarm_name_upper for word in ['WARNING', 'ALERT']):
                    category = 'medium'
                elif any(word in alarm_name_upper for word in ['INFO', 'STATUS', 'EVENT']):
                    category = 'event'
                else:
                    category = 'low'


            alarm_tag = (row_data.get('Alarm Tag', '') or
                         row_data.get('ALARM_TAG', '') or
                         alarm_name.replace(' ', '_').upper()).strip()

            alarm_data = {
                'alarm_name': alarm_name,
                'alarm_type': alarm_type,
                'category': category,
                'alarm_tag': alarm_tag,
                'equipment': equipment if equipment else 'Virtual.System',
                'item_name': item_name,
                'comment': row_data.get('Comment', ''),
                'row_index': row_idx
            }

            alarms_data.append(alarm_data)
            alarms_imported += 1

        return JsonResponse({
            'success': True,
            'message': f'Processed alarms CSV: {alarms_imported} alarms found',
            'alarms': alarms_data,
            'count': alarms_imported
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error processing alarms CSV: {str(e)}'
        })


def process_trends_csv(csv_reader):

    try:
        rows = list(csv_reader)
        if len(rows) < 2:
            return JsonResponse({
                'success': False,
                'error': 'CSV file is empty or missing header row'
            })

        header = rows[0]
        created_trends = 0

        with transaction.atomic():
            for row in rows[1:]:
                if len(row) < len(header):
                    continue

                row_data = dict(zip(header, row))

                tag_description = row_data.get('TAG_DESCRIPTION', '').strip()
                item_name = row_data.get('ITEM_NAME', '').strip()

                if not tag_description or not item_name:
                    continue


                device = None
                tag_name = row_data.get('TAG_NAME', '').strip()


                try:
                    variable = Variable.objects.filter(item_name=item_name).first()
                    if variable:
                        device = variable.device
                    else:

                        for d in Device.objects.all():
                            if tag_name.startswith(d.tag_prefix):
                                device = d
                                break
                except Exception:
                    pass

                if not device:
                    continue


                time_interval = row_data.get('TIME_INTERVAL', '1MIN').strip()
                time_value = '00:01'

                if 'MIN' in time_interval.upper():
                    minutes = int(''.join(filter(str.isdigit, time_interval)) or '1')
                    time_value = f'{minutes:02d}:00'
                elif 'SEC' in time_interval.upper():
                    seconds = int(''.join(filter(str.isdigit, time_interval)) or '60')
                    time_value = f'00:{seconds:02d}'
                elif 'HOUR' in time_interval.upper():
                    hours = int(''.join(filter(str.isdigit, time_interval)) or '1')
                    time_value = f'{hours * 60:02d}:00'


                trend, created = Trend.objects.update_or_create(
                    device=device,
                    tag_description=tag_description,
                    defaults={
                        'trend_types': row_data.get('TREND_TYPES', 'periodic').strip().lower(),
                        'tag_name': tag_name,
                        'item_name': item_name,
                        'time': time_value
                    }
                )

                if created:
                    created_trends += 1

        return JsonResponse({
            'success': True,
            'message': f'Processed trends CSV: {created_trends} trends created'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error processing trends CSV: {str(e)}'
        })


@csrf_exempt
@require_http_methods(["POST"])
def upload_cid(request):

    try:
        if 'file' not in request.FILES:
            return JsonResponse({
                'success': False,
                'error': 'No file uploaded'
            }, status=400)

        file = request.FILES['file']

        if not file.name.endswith('.cid'):
            return JsonResponse({
                'success': False,
                'error': 'File must be a CID file'
            }, status=400)


        content = file.read().decode('utf-8')

        try:
            root = ET.fromstring(content)
        except ET.ParseError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid XML format'
            }, status=400)


        device_info = parse_cid_data(root)

        return JsonResponse({
            'success': True,
            'device_info': device_info,
            'message': 'CID file parsed successfully'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)



def generate_iec_equip_csv(devices):

    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="IEC_EQUIP.csv"'

    writer = csv.writer(response, delimiter=',', quoting=csv.QUOTE_ALL)


    writer.writerow(['Name', 'Cluster Name', 'Type', 'Tag Prefix', 'I/O Device'])

    for device in devices:
        writer.writerow([
            device.device_name or '',
            'c1',
            device.device_type or 'IED',
            device.tag_prefix or '',
            device.io_device or ''
        ])

    return response


def generate_iec_units_csv(devices):

    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="IEC_UNITS.csv"'

    writer = csv.writer(response, delimiter=',', quoting=csv.QUOTE_ALL)


    writer.writerow([
        'Server Name', 'Name', 'Number', 'Address', 'Protocol',
        'Port Name', 'Startup Mode', 'Priority', 'Memory'
    ])

    for index, device in enumerate(devices):
        memory_value = 'FALSE' if getattr(device, 'memory_iec', None) == 'false' else 'TRUE'
        protocol_value = f"IEC{device.iec_port or '102'}"

        writer.writerow([
            'c1',
            device.io_device or device.device_name,
            str(100 + index),
            device.iec_device_ip or '',
            protocol_value,
            device.access_point or '',
            'Primary',
            '1',
            memory_value
        ])

    return response


def generate_iec_ports_csv(devices):

    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="IEC_PORTS.csv"'

    writer = csv.writer(response, delimiter=',', quoting=csv.QUOTE_ALL)


    writer.writerow(['Server Name', 'Port Name', 'Port Number', 'Board Name'])

    for device in devices:
        board_name = getattr(device, 'board_name', '') or ''

        writer.writerow([
            'IOServer1',
            device.access_point or '',
            device.iec_port or '102',
            board_name
        ])

    return response




def parse_cid_data(root):

    device_info = {}


    comm = root.find('.//{http://www.iec.ch/61850/2003/SCL}Communication')
    if comm is not None:
        connected_ap = comm.find('.//{http://www.iec.ch/61850/2003/SCL}ConnectedAP')
        if connected_ap is not None:
            device_info['ied_name'] = connected_ap.get('iedName', '')
            device_info['access_point'] = connected_ap.get('apName', '')


            address = connected_ap.find('.//{http://www.iec.ch/61850/2003/SCL}Address')
            if address is not None:
                ip_elem = address.find('.//{http://www.iec.ch/61850/2003/SCL}P[@type="IP"]')
                if ip_elem is not None:
                    device_info['iec_device_ip'] = ip_elem.text


    ied = root.find('.//{http://www.iec.ch/61850/2003/SCL}IED')
    if ied is not None:
        device_info['device_name'] = ied.get('name', 'IED_Device')
        device_info['device_type'] = ied.get('type', 'IED')
        device_info['tag_prefix'] = (ied.get('name', 'IED')[:10]).upper()


        ld = ied.find('.//{http://www.iec.ch/61850/2003/SCL}LDevice')
        if ld is not None:
            device_info['logical_device'] = ld.get('inst', 'LD0')


    device_info.setdefault('iec_port', 102)
    device_info.setdefault('protocol', 'iec')
    device_info.setdefault('io_device', f"IO_{device_info.get('device_name', 'IED_Device')}")

    return device_info


@require_http_methods(["GET"])
def generate_iec_xml_only(request):

    try:
        devices = Device.objects.filter(protocol='iec')

        if devices.count() == 0:
            return JsonResponse({
                'success': False,
                'error': 'No IEC devices found'
            }, status=400)

        xml_files = []
        for device in devices:

            brcb = getattr(device, 'brcb', '') or ''
            urcb = getattr(device, 'urcb', '') or ''


            xml_content = f'''<?xml version="1.0" encoding="utf-8"?>
<ScadaDevice xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.schneider-electric.com/SCADA/Drivers/IEC61850/DeviceConfig/v1/">
  <SCL>{getattr(device, 'scl_file', '') or f"[USER]:{device.device_name}_Project\\{device.device_name}.cid"}</SCL>
  <IED>{device.ied_name or device.device_name}</IED>
  <LogicalDevice Name="{device.logical_device or 'Relay'}">'''


            if urcb:
                xml_content += f'\n    <URCB>{urcb}</URCB>'


            if brcb:
                xml_content += f'\n    <BRCB>{brcb}</BRCB>'

            xml_content += '\n  </LogicalDevice>\n</ScadaDevice>'

            xml_files.append({
                'filename': f'{device.device_name or "IEC_Device"}.xml',
                'content': xml_content
            })


        if len(xml_files) == 1:
            response = HttpResponse(xml_files[0]['content'], content_type='application/xml')
            response['Content-Disposition'] = f'attachment; filename="{xml_files[0]["filename"]}"'
            return response


        response = HttpResponse(content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename="IEC_XML_Files.zip"'

        with zipfile.ZipFile(response, 'w') as zip_file:
            for xml_file in xml_files:
                zip_file.writestr(xml_file['filename'], xml_file['content'])

        return response

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


def generate_iec_equip_csv(devices):

    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="IEC_EQUIP.csv"'

    writer = csv.writer(response, delimiter=',', quoting=csv.QUOTE_ALL)


    writer.writerow(['Name', 'Cluster Name', 'Type', 'Tag Prefix', 'I/O Device'])

    for device in devices:
        writer.writerow([
            device.device_name or '',
            'c1',
            device.device_type or 'IED',
            device.tag_prefix or '',
            device.io_device or ''
        ])

    return response


def generate_iec_units_csv(devices):

    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="IEC_UNITS.csv"'

    writer = csv.writer(response, delimiter=',', quoting=csv.QUOTE_ALL)


    writer.writerow([
        'Server Name', 'Name', 'Number', 'Address', 'Protocol',
        'Port Name', 'Startup Mode', 'Priority', 'Memory'
    ])

    for index, device in enumerate(devices):
        memory_value = 'FALSE' if getattr(device, 'memory_iec', None) == 'false' else 'TRUE'
        protocol_value = f"IEC{device.iec_port or '102'}"

        writer.writerow([
            'c1',
            device.io_device or device.device_name,
            str(100 + index),
            device.iec_device_ip or '',
            protocol_value,
            device.access_point or '',
            'Primary',
            '1',
            memory_value
        ])

    return response


def generate_iec_ports_csv(devices):

    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="IEC_PORTS.csv"'

    writer = csv.writer(response, delimiter=',', quoting=csv.QUOTE_ALL)


    writer.writerow(['Server Name', 'Port Name', 'Port Number', 'Board Name'])

    for device in devices:
        board_name = getattr(device, 'board_name', '') or ''

        writer.writerow([
            'IOServer1',
            device.access_point or '',
            device.iec_port or '102',
            board_name
        ])

    return response


@require_http_methods(["GET"])
def generate_iec_xml(request):

    try:
        devices = Device.objects.filter(protocol='iec')

        if devices.count() == 0:
            return JsonResponse({
                'success': False,
                'error': 'No IEC devices found'
            }, status=400)

        xml_files = []
        for device in devices:

            brcb = getattr(device, 'brcb', '') or ''
            urcb = getattr(device, 'urcb', '') or ''


            xml_content = f'''<?xml version="1.0" encoding="utf-8"?>
<ScadaDevice xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.schneider-electric.com/SCADA/Drivers/IEC61850/DeviceConfig/v1/">
  <SCL>{getattr(device, 'scl_file', '') or f"[USER]:{device.device_name}_Project\\{device.device_name}.cid"}</SCL>
  <IED>{device.ied_name or device.device_name}</IED>
  <LogicalDevice Name="{device.logical_device or 'Relay'}">'''


            if urcb:
                xml_content += f'\n    <URCB>{urcb}</URCB>'


            if brcb:
                xml_content += f'\n    <BRCB>{brcb}</BRCB>'

            xml_content += '\n  </LogicalDevice>\n</ScadaDevice>'

            xml_files.append({
                'filename': f'{device.device_name or "IEC_Device"}.xml',
                'content': xml_content
            })


        if len(xml_files) == 1:
            response = HttpResponse(xml_files[0]['content'], content_type='application/xml')
            response['Content-Disposition'] = f'attachment; filename="{xml_files[0]["filename"]}"'
            return response


        response = HttpResponse(content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename="IEC_XML_Files.zip"'

        with zipfile.ZipFile(response, 'w') as zip_file:
            for xml_file in xml_files:
                zip_file.writestr(xml_file['filename'], xml_file['content'])

        return response

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_http_methods(["GET"])
def generate_all_iec_files(request):

    try:
        devices = Device.objects.filter(protocol='iec')

        if devices.count() == 0:
            return JsonResponse({
                'success': False,
                'error': 'No IEC devices found'
            }, status=400)


        response = HttpResponse(content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename="IEC_Configuration_Files.zip"'

        with zipfile.ZipFile(response, 'w') as zip_file:

            equip_content = generate_iec_equip_csv_content(devices)
            zip_file.writestr('IEC_EQUIP.csv', equip_content)


            units_content = generate_iec_units_csv_content(devices)
            zip_file.writestr('IEC_UNITS.csv', units_content)


            ports_content = generate_iec_ports_csv_content(devices)
            zip_file.writestr('IEC_PORTS.csv', ports_content)


            for device in devices:
                brcb = getattr(device, 'brcb', '') or ''
                urcb = getattr(device, 'urcb', '') or ''

                xml_content = f'''<?xml version="1.0" encoding="utf-8"?>
<ScadaDevice xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.schneider-electric.com/SCADA/Drivers/IEC61850/DeviceConfig/v1/">
  <SCL>{getattr(device, 'scl_file', '') or f"[USER]:{device.device_name}_Project\\{device.device_name}.cid"}</SCL>
  <IED>{device.ied_name or device.device_name}</IED>
  <LogicalDevice Name="{device.logical_device or 'Relay'}">'''

                if urcb:
                    xml_content += f'\n    <URCB>{urcb}</URCB>'
                if brcb:
                    xml_content += f'\n    <BRCB>{brcb}</BRCB>'

                xml_content += '\n  </LogicalDevice>\n</ScadaDevice>'

                zip_file.writestr(f'{device.device_name or "IEC_Device"}.xml', xml_content)

        return response

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)



def generate_iec_equip_csv_content(devices):

    import io
    output = io.StringIO()
    writer = csv.writer(output, delimiter=',', quoting=csv.QUOTE_ALL)

    writer.writerow(['Name', 'Cluster Name', 'Type', 'Tag Prefix', 'I/O Device'])

    for device in devices:
        writer.writerow([
            device.device_name or '',
            'c1',
            device.device_type or 'IED',
            device.tag_prefix or '',
            device.io_device or ''
        ])

    return output.getvalue()


def generate_iec_units_csv_content(devices):

    import io
    output = io.StringIO()
    writer = csv.writer(output, delimiter=',', quoting=csv.QUOTE_ALL)

    writer.writerow([
        'Server Name', 'Name', 'Number', 'Address', 'Protocol',
        'Port Name', 'Startup Mode', 'Priority', 'Memory'
    ])

    for index, device in enumerate(devices):
        memory_value = 'FALSE' if getattr(device, 'memory_iec', None) == 'false' else 'TRUE'
        protocol_value = f"IEC{device.iec_port or '102'}"

        writer.writerow([
            'c1',
            device.io_device or device.device_name,
            str(100 + index),
            device.iec_device_ip or '',
            protocol_value,
            device.access_point or '',
            'Primary',
            '1',
            memory_value
        ])

    return output.getvalue()


def generate_iec_ports_csv_content(devices):

    import io
    output = io.StringIO()
    writer = csv.writer(output, delimiter=',', quoting=csv.QUOTE_ALL)

    writer.writerow(['Server Name', 'Port Name', 'Port Number', 'Board Name'])

    for device in devices:
        board_name = getattr(device, 'board_name', '') or ''
        writer.writerow([
            'IOServer1',
            device.access_point or '',
            device.iec_port or '102',
            board_name
        ])

    return output.getvalue()