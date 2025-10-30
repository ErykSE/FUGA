let currentProtocol = 'modbus';
let currentModbusVariant = 'tcp';
let devices = [];
let variables = [];
let alarms = [];
let trends = [];
let currentDevice = null;
let validationErrors = {};


const validationRules = {

    device_name: {
        required: true,
        minLength: 2,
        maxLength: 64,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_-]*$/,
        message: 'Device name must start with letter/underscore, cannot start with digit, 2-64 chars'
    },
    device_type: {
        required: true,
        enum: ['PV', 'WindTurbine', 'FuelTurbine', 'FuelCell', 'BESS'],
        message: 'Please select a valid device type'
    },
    tag_prefix: {
        required: true,
        minLength: 1,
        maxLength: 16,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        message: 'Tag prefix must start with letter/underscore, cannot start with digit, max 16 chars'
    },
    io_device: {
        required: true,
        minLength: 1,
        maxLength: 64,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_-]*$/,
        message: 'I/O Device name must start with letter/underscore, cannot start with digit'
    },



    device_ip: {
        required: true,
        pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        message: 'Enter valid IPv4 address (e.g., 192.168.1.100)'
    },
    modbus_port: {
        required: true,
        min: 1,
        max: 65535,
        message: 'Modbus port must be between 1-65535'
    },
    port_name: {
        required: true,
        minLength: 1,
        maxLength: 32,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        message: 'Port name must start with letter/underscore, cannot start with digit, max 32 chars'
    },
    unit_number: {
        required: true,
        min: 1,
        max: 247,
        message: 'Unit number must be between 1-247'
    },
    board_name_tcp: {
        required: true,
        minLength: 1,
        maxLength: 32,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        message: 'Board name must start with letter/underscore, cannot start with digit, max 32 chars'
    },
    project_name: {
        required: true,
        minLength: 1,
        maxLength: 64,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        message: 'Project name must start with letter/underscore, cannot start with digit'
    },
    memory_tcp: {
        required: true,
        enum: ['true', 'false'],
        message: 'Select memory option'
    },


    gateway_address: {
        required: true,
        pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        message: 'Enter valid gateway IPv4 address'
    },
    slave_id: {
        required: true,
        min: 1,
        max: 247,
        message: 'Slave ID must be between 1-247'
    },
    port_name_rtu: {
        required: true,
        minLength: 1,
        maxLength: 32,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        message: 'RTU port name must start with letter/underscore, cannot start with digit'
    },
    serial_port: {
        required: true,
        pattern: /^(COM\d+|\/dev\/tty[A-Za-z0-9]+)$/,
        message: 'Enter valid serial port (COM1, COM2, /dev/ttyUSB0, etc.)'
    },
    memory_rtu: {
        required: true,
        enum: ['true', 'false'],
        message: 'Select RTU memory option'
    },
    board_name_rtu: {
        required: true,
        minLength: 1,
        maxLength: 32,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        message: 'RTU board name must start with letter/underscore, cannot start with digit'
    },


    baud_rate: {
        required: false,
        enum: ['9600', '19200', '38400', '57600', '115200'],
        message: 'Select valid baud rate'
    },
    data_bits: {
        required: false,
        enum: ['7', '8'],
        message: 'Select 7 or 8 data bits'
    },
    parity: {
        required: false,
        enum: ['None', 'Even', 'Odd'],
        message: 'Select valid parity option'
    },
    stop_bits: {
        required: false,
        enum: ['1', '2'],
        message: 'Select 1 or 2 stop bits'
    },


    iec_device_ip: {
        required: true,
        pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        message: 'Enter valid IEC device IPv4 address'
    },
    iec_port: {
        required: true,
        min: 1,
        max: 65535,
        message: 'IEC port must be between 1-65535 (default: 102)'
    },
    ied_name: {
        required: true,
        minLength: 1,
        maxLength: 64,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        message: 'IED name must start with letter/underscore, cannot start with digit, max 64 chars'
    },
    access_point: {
        required: true,
        minLength: 1,
        maxLength: 32,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        message: 'Access point must start with letter/underscore, cannot start with digit'
    },
    logical_device: {
        required: true,
        minLength: 1,
        maxLength: 64,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        message: 'Logical device must start with letter/underscore, cannot start with digit'
    },
    board_name: {
        required: true,
        minLength: 1,
        maxLength: 32,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        message: 'Board name must start with letter/underscore, cannot start with digit'
    },
    memory_iec: {
        required: true,
        enum: ['true', 'false'],
        message: 'Select IEC memory option'
    },
    brcb: {
        required: false,
        minLength: 1,
        maxLength: 128,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_$\\]*$/,
        message: 'BRCB must start with letter/underscore, cannot start with digit, IEC format'
    },
    urcb: {
        required: false,
        minLength: 1,
        maxLength: 128,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_$\\]*$/,
        message: 'URCB must start with letter/underscore, cannot start with digit, IEC format'
    },
    scl_file: {
        required: false,
        minLength: 1,
        maxLength: 255,
        pattern: /^(\[USER\]:)?[a-zA-Z_][a-zA-Z0-9_\\.\-]*\.(cid|scd|icd)$/i,
        message: 'SCL file path format: [USER]:Project\\File.cid (or .scd, .icd)'
    },


    item_name: {
        required: true,
        minLength: 1,
        maxLength: 64,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        message: 'Item name must start with letter/underscore, cannot start with digit, max 64 chars'
    },
    io_device_var: {
        required: true,
        minLength: 1,
        maxLength: 64,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_-]*$/,
        message: 'I/O Device must start with letter/underscore, cannot start with digit'
    },
    tag_name_var: {
        required: true,
        minLength: 1,
        maxLength: 128,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_\\$]*$/,
        message: 'Tag name must start with letter/underscore, cannot start with digit. For IEC use format: MMXU1\\A\\phsA'
    },
    address: {
        required: true,
        minLength: 1,
        maxLength: 32,
        pattern: /^([a-zA-Z_][a-zA-Z0-9_\\$]*|[1-9][0-9]{0,4}|[1-6][0-9]{4}|7[0-5][0-9]{3}|76[0-7][0-9]{2}|768[0-9]{2}|7690[0-9]|76901)$/,
        message: 'Address: Modbus register (1-76901) or IEC reference starting with letter/underscore'
    },
    equipment_var: {
        required: true,
        minLength: 1,
        maxLength: 64,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_\.]*$/,
        message: 'Equipment must start with letter/underscore, cannot start with digit. Format: Virtual.System'
    },
    data_type: {
        required: true,
        enum: ['float', 'int', 'bool', 'string', 'REAL', 'INT', 'BOOLEAN', 'STRING'],
        message: 'Select valid data type'
    },


    alarm_name: {
        required: true,
        minLength: 1,
        maxLength: 64,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_\s]*$/,
        message: 'Alarm name must start with letter/underscore, cannot start with digit, max 64 chars'
    },
    alarm_type: {
        required: true,
        enum: ['analog', 'digital', 'advanced', 'system'],
        message: 'Select valid alarm type'
    },
    category: {
        required: true,
        enum: ['low', 'medium', 'high', 'critical', 'event'],
        message: 'Select valid alarm category'
    },
    alarm_tag: {
        required: true,
        minLength: 1,
        maxLength: 64,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        message: 'Alarm tag must start with letter/underscore, cannot start with digit'
    },
    equipment: {
        required: true,
        minLength: 1,
        maxLength: 64,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_\.]*$/,
        message: 'Equipment must start with letter/underscore, cannot start with digit. Format: Virtual.System'
    },
    item_name_alarm: {
        required: true,
        minLength: 1,
        maxLength: 64,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        message: 'Alarm item name must start with letter/underscore, cannot start with digit'
    },


    tag_description: {
        required: true,
        minLength: 3,
        maxLength: 128,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_\s\-\.]*$/,
        message: 'Tag description must start with letter/underscore, cannot start with digit, 3-128 chars'
    },
    trend_types: {
        required: true,
        enum: ['event', 'periodic', 'periodic-event', 'on-change'],
        message: 'Select valid trend type'
    },
    tag_name: {
        required: true,
        minLength: 1,
        maxLength: 64,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        message: 'Trend tag name must start with letter/underscore, cannot start with digit'
    },
    item_name_trend: {
        required: true,
        minLength: 1,
        maxLength: 64,
        pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        message: 'Trend item name must start with letter/underscore, cannot start with digit'
    },
    trend_time: {
        required: true,
        pattern: /^(\d{1,2}:\d{2}|PT\d+[HMS])$/,
        enum: ['00:01', '00:05', '00:15', '00:30', '01:00', '04:00', '12:00', '24:00'],
        message: 'Select valid sample period (1min, 5min, 15min, 30min, 1h, 4h, 12h, 24h)'
    }
};


function getMainFormRequiredFields() {
    const requiredFields = ['device_name', 'device_type', 'tag_prefix', 'io_device'];

    if (currentProtocol === 'modbus') {
        if (currentModbusVariant === 'tcp') {
            requiredFields.push('device_ip', 'modbus_port', 'port_name', 'unit_number', 'board_name_tcp');
        } else {
           requiredFields.push('gateway_address', 'slave_id', 'port_name_rtu', 'serial_port', 'board_name_rtu');
            if (document.getElementById('advancedOptionsCheckbox')?.checked) {
                requiredFields.push('baud_rate');
            }
        }
    } else if (currentProtocol === 'iec') {
        requiredFields.push('iec_device_ip', 'iec_port', 'ied_name', 'access_point', 'logical_device', 'board_name');
    }

    return requiredFields;
}


const additionalValidationRules = {
    board_name: { required: true, minLength: 1, maxLength: 20, message: 'Board name required (1-20 chars)' },
    brcb: { minLength: 1, maxLength: 64, message: 'BRCB format invalid' },
    urcb: { minLength: 1, maxLength: 64, message: 'URCB format invalid' },
    scl_file: { maxLength: 255, message: 'SCL file path too long' }
};


Object.assign(validationRules, additionalValidationRules);


function validateFieldIEC(field) {
    const fieldName = field.name || field.id;
    const value = field.value.trim();


    if (fieldName === 'brcb' || fieldName === 'urcb') {
        validateReportControlBlocks();
        return true;
    }


    return validateField(field);
}


function validateReportControlBlocks() {
    const brcb = document.getElementById('brcb');
    const urcb = document.getElementById('urcb');
    const validationDiv = document.getElementById('rcb-validation');

    const brcbValue = brcb?.value.trim() || '';
    const urcbValue = urcb?.value.trim() || '';


    if (currentProtocol === 'iec' && !brcbValue && !urcbValue) {
        if (validationDiv) {
            validationDiv.style.display = 'block';
            validationDiv.textContent = 'Please fill in at least one Report Control Block (BRCB or URCB).';
        }


        validationErrors['report_control_blocks'] = 'At least one Report Control Block required';
        return false;
    } else {
        if (validationDiv) {
            validationDiv.style.display = 'none';
        }
        delete validationErrors['report_control_blocks'];
        return true;
    }
}


function getMainFormRequiredFieldsUpdated() {
    const requiredFields = ['device_name', 'device_type', 'tag_prefix', 'io_device'];

    if (currentProtocol === 'modbus') {
        if (currentModbusVariant === 'tcp') {
            requiredFields.push('device_ip', 'modbus_port', 'port_name', 'unit_number', 'board_name_tcp');
        } else {
            requiredFields.push('gateway_address', 'slave_id', 'port_name_rtu', 'serial_port', 'board_name_tcp');
            if (document.getElementById('advancedOptionsCheckbox')?.checked) {
                requiredFields.push('baud_rate');
            }
        }
    } else if (currentProtocol === 'iec') {
        requiredFields.push('iec_device_ip', 'iec_port', 'ied_name', 'access_point', 'logical_device', 'board_name');

    }

    return requiredFields;
}

function generateIECXML() {
    if (devices.length === 0) {
        showAlert('No devices configured. Please save at least one IEC device first.', 'error');
        return;
    }


    const iecDevices = devices.filter(d => d.protocol === 'iec');
    if (iecDevices.length === 0) {
        showAlert('No IEC devices found. Please configure at least one IEC device.', 'error');
        return;
    }

    showLoading(true);

    try {
        iecDevices.forEach((device, index) => {
            const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<ScadaDevice xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.schneider-electric.com/SCADA/Drivers/IEC61850/DeviceConfig/v1/">
  <SCL>${device.scl_file || `[USER]:${device.device_name}_Project\\${device.device_name}.cid`}</SCL>
  <IED>${device.ied_name || device.device_name}</IED>
  <LogicalDevice Name="${device.logical_device || 'Relay'}">
    ${device.urcb ? `<URCB>${device.urcb}</URCB>` : ''}
    ${device.brcb ? `<BRCB>${device.brcb}</BRCB>` : ''}
  </LogicalDevice>
</ScadaDevice>`;


            const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
            const link = document.createElement('a');

            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `${device.device_name || 'IEC_Device'}.xml`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        });

        showAlert('XML files generated successfully!', 'success');
    } catch (error) {
        showAlert('Error generating XML files: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}



function generateUnitsCSV() {
    const isModbus = devices.some(device => device.protocol === 'modbus');

    if (isModbus) {
        const headers = [
            'Server Name',
            'Name',
            'Number',
            'Address',
            'Protocol',
            'Port Name',
            'Startup Mode',
            'Priority',
            'Memory',
            'Read-Only',
            'Exclusive',
            'Comment',
            'Linked',
            'Database Type',
            'External Database',
            'Connection String',
            'Tag Prefix',
            'Automatic Refresh',
            'Live Update',
            'Log Write',
            'Log Read',
            'Cache',
            'Cache Time',
            'Background Poll',
            'Background Rate',
            'Min Update Rate',
            'Staleness Period',
            'Scheduled',
            'Time',
            'Period',
            'Connect Action',
            'Disconnect Action',
            'Phone Number',
            'Caller ID',
            'Persist',
            'Persist Period',
            'File Name',
            'Project',
            'PROTOCOLID',
            'LASTUPDATE',
            'REMOTEWRIT',
            'ONBROWSE',
            'LASTVARMOD',
            'TAGGEN',
            'TAGGENTEMP'
        ];
        const rows = [headers.join(',')];

        let numberCounter = 1;

        devices.forEach((device, index) => {
            if (device.protocol === 'modbus') {
                let address = '';
                let portName = '';
                let comment = '';

                if (device.modbusVariant === 'tcp') {
                    address = device.device_ip || '';
                    portName = device.port_name || '';
                    comment = 'TCP/IP';
                } else {
                    address = device.gateway_address || '';
                    portName = device.port_name_rtu || '';
                    comment = 'GATEWAY';
                }

                const row = [
                    `"IOServer1"`,
                    `"${device.io_device || device.device_name}"`,
                    `"${numberCounter}"`,
                    `"${address}"`,
                    `"PWRMOD"`,
                    `"${portName}"`,
                    `"Primary"`,
                    `"1"`,
                    `"TRUE"`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `"TRUE"`,
                    `"0:05:00"`,
                    `""`,
                    `"FUGA_sim_copy"`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`
                ];
                rows.push(row.join(','));

                numberCounter++;
            }
        });

        downloadCSV(rows.join('\n'), 'UNITS.csv');
    } else {
        const headers = [
            'Server Name',
            'Name',
            'Number',
            'Address',
            'Protocol',
            'Port Name',
            'Startup Mode',
            'Priority',
            'Memory',
            'Read-Only',
            'Exclusive',
            'Comment',
            'Linked',
            'Database Type',
            'External Database',
            'Connection String',
            'Tag Prefix',
            'Automatic Refresh',
            'Live Update',
            'Log Write',
            'Log Read',
            'Cache',
            'Cache Time',
            'Background Poll',
            'Background Rate',
            'Min Update Rate',
            'Staleness Period',
            'Scheduled',
            'Time',
            'Period',
            'Connect Action',
            'Disconnect Action',
            'Phone Number',
            'Caller ID',
            'Persist',
            'Persist Period',
            'File Name',
            'Project',
            'PROTOCOLID',
            'LASTUPDATE',
            'REMOTEWRIT',
            'ONBROWSE',
            'LASTVARMOD',
            'TAGGEN',
            'TAGGENTEMP'
        ];
        const rows = [headers.join(',')];

        devices.forEach((device, index) => {
            if (device.protocol === 'iec') {
                const address = device.iec_device_ip || '';
                const protocol = `IEC${device.iec_port || '61850'}N`;
                const portName = device.access_point || '';
                const memory = device.memory_iec === 'false' ? 'FALSE' : 'TRUE';

                const row = [
                    `"IOServer1"`,
                    `"${device.io_device || device.device_name}"`,
                    `"${index + 1}"`,
                    `"${address}"`,
                    `"${protocol}"`,
                    `"${portName}"`,
                    `"Primary"`,
                    `"1"`,
                    `"${memory}"`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `"FUGA_sim_copy"`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`,
                    `""`
                ];
                rows.push(row.join(','));
            }
        });

        downloadCSV(rows.join('\n'), 'UNITS.csv');
    }
}


function generateAlarmsCSV() {
    if (alarms.length === 0) {
        showAlert('No alarms configured', 'error');
        return;
    }

    const headers = ['Cluster Name', 'EQUIPMENT', 'ITEM_NAME', 'ALARM_TAG', 'Variable Tag A', 'ALARM_NAME', 'CATEGORY', 'ALARM_TYPE'];
    const rows = [headers.join(',')];

    alarms.forEach(alarm => {
        const row = [
            `"c1"`,
            `"${alarm.equipment || ''}"`,
            `"${alarm.item_name || ''}"`,
            `"${alarm.alarm_tag || ''}"`,
            `"${alarm.alarm_tag || ''}"`,
            `"${alarm.alarm_name || ''}"`,
            `"${alarm.category || ''}"`,
            `"${alarm.alarm_type || ''}"`
        ];
        rows.push(row.join(','));
    });

    downloadCSV(rows.join('\n'), 'ALARMS.csv');
}

function generatePortsCSV() {
    const headers = ['Server Name', 'Port Name', 'Port Number', 'Board Name', 'Baud Rate', 'Data Bits', 'Stop Bits', 'Parity', 'Special Options', 'Comment', 'Project'];
    const rows = [headers.join(',')];

    devices.forEach(device => {
        let portNumber = '';
        let portName = '';
        let boardName = '';
        let specialOptions = '';

        if (device.protocol === 'modbus') {
            if (device.modbusVariant === 'tcp') {
                portNumber = device.modbus_port || '502';
                portName = device.port_name || '';
                boardName = device.board_name || '';
                specialOptions = 'TCP/IP';
            } else {
                portNumber = device.slave_id || '1';
                portName = device.port_name_rtu || '';
                boardName = device.board_name_rtu || '';
                specialOptions = 'TCP/IP';
            }
        } else if (device.protocol === 'iec') {
            portNumber = device.iec_port || '102';
            portName = device.access_point || '';
            boardName = device.board_name || '';
            specialOptions = 'GATEWAY';
        }

        const row = [
            `"IOServer1"`,
            `"${portName}"`,
            `"${portNumber}"`,
            `"${boardName}"`,
            `""`,
            `""`,
            `""`,
            `""`,
            `"#NAZWA? ${specialOptions}"`,
            `""`,
            `"DTU_project"`
        ];
        rows.push(row.join(','));
    });

    downloadCSV(rows.join('\n'), 'PORTS.csv');
}


function generateAllCSV() {
    if (devices.length === 0) {
        showAlert('No devices to export. Please save at least one device first.', 'error');
        return;
    }

    showLoading(true);
    setTimeout(() => {
        try {


            generateEquipmentCSV();
            generateUnitsCSV();
            generatePortsCSV();
            generateVariablesCSV();
            generateAlarmsCSV();
            generateTrendsCSV();

            showAlert('All CSV files generated successfully!', 'success');
        } catch (error) {
            showAlert('Error generating CSV files: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }, 1000);
}




function addGenerateButtons() {
    const buttonGroup = document.querySelector('.button-group');
    if (!buttonGroup) return;


    const oldIecBtn = document.getElementById('generateIECBtn');
    if (oldIecBtn) {
        oldIecBtn.remove();
    }


    if (!document.getElementById('generateXMLBtn')) {
        const xmlButton = document.createElement('button');
        xmlButton.type = 'button';
        xmlButton.className = 'btn btn-primary';
        xmlButton.id = 'generateXMLBtn';
        xmlButton.textContent = 'Generate XML';
        xmlButton.onclick = generateIECXML;
        xmlButton.title = 'Generate XML files for IEC devices';
        buttonGroup.appendChild(xmlButton);
    }


    const csvButton = document.getElementById('generateCSVBtn');
    if (csvButton) {
        csvButton.onclick = generateAllCSV;
        csvButton.textContent = 'Generate CSV Files';
        csvButton.title = 'Generate all CSV files (including IEC)';
    }
}


document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    updateDeviceCounter();
    setupValidation();
    setupIECValidation();
    setupFileHandlers();
    setTimeout(addGenerateButtons, 100);
});


window.generateIECXML = generateIECXML;
window.generateAllCSV = generateAllCSV;

function saveDeviceUpdated() {
    if (!performCompleteValidation()) {
        showAlert('Please fix all validation errors before saving', 'error');
        return;
    }


    if (currentProtocol === 'iec' && !validateReportControlBlocks()) {
        showAlert('Please fill in at least one Report Control Block (BRCB or URCB)', 'error');
        return;
    }

    const form = document.getElementById('deviceForm');
    const formData = new FormData(form);
    const deviceName = formData.get('device_name');

    const existingDevice = devices.find(d =>
        d.device_name.toLowerCase() === deviceName.toLowerCase() &&
        (!currentDevice || d.id !== currentDevice.id)
    );

    if (existingDevice) {
        showFieldError(document.getElementById('device_name'), 'Device name already exists');
        showAlert('Device name already exists. Please choose a different name.', 'error');
        return;
    }

    const device = {
        id: currentDevice ? currentDevice.id : Date.now().toString(),
        protocol: currentProtocol,
        modbusVariant: currentModbusVariant,
        device_name: deviceName,
        device_type: formData.get('device_type'),
        tag_prefix: formData.get('tag_prefix'),
        io_device: formData.get('io_device'),
        variables: [...variables],
        alarms: [...alarms],
        trends: [...trends]
    };

    if (currentProtocol === 'modbus') {
        if (currentModbusVariant === 'tcp') {
            Object.assign(device, {
                device_ip: formData.get('device_ip'),
                modbus_port: formData.get('modbus_port'),
                port_name: formData.get('port_name'),
                unit_number: formData.get('unit_number'),
                memory: formData.get('memory'),
                board_name: formData.get('board_name_tcp')
            });
        } else {
            Object.assign(device, {
                gateway_address: formData.get('gateway_address'),
                slave_id: formData.get('slave_id'),
                port_name_rtu: formData.get('port_name_rtu'),
                memory_rtu: formData.get('memory_rtu'),
                serial_port: formData.get('serial_port'),
                board_name_rtu: formData.get('board_name_rtu')
            });

            if (document.getElementById('advancedOptionsCheckbox').checked) {
                Object.assign(device, {
                    baud_rate: formData.get('baud_rate'),
                    data_bits: formData.get('data_bits'),
                    parity: formData.get('parity'),
                    stop_bits: formData.get('stop_bits')
                });
            }
        }
        device.protocol_name = formData.get('protocol');
    } else if (currentProtocol === 'iec') {
        Object.assign(device, {
            iec_device_ip: formData.get('iec_device_ip'),
            iec_port: formData.get('iec_port'),
            ied_name: formData.get('ied_name'),
            access_point: formData.get('access_point'),
            logical_device: formData.get('logical_device'),
            board_name: formData.get('board_name'),
            memory_iec: formData.get('memory_iec'),
            brcb: formData.get('brcb'),
            urcb: formData.get('urcb'),
            scl_file: formData.get('scl_file'),
            protocol_name: 'IEC61850'
        });
    }

    if (currentDevice) {
        const index = devices.findIndex(d => d.id === currentDevice.id);
        if (index !== -1) devices[index] = device;
    } else {
        devices.push(device);
    }

    updateDeviceList();
    updateDeviceCounter();
    showAlert('Device saved successfully!', 'success');
    currentDevice = null;
}


function loadDevice(deviceId) {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    currentDevice = device;
    validationErrors = {};
    document.querySelectorAll('input, select').forEach(field => clearFieldError(field));

    const basicFields = ['device_name', 'device_type', 'tag_prefix', 'io_device'];
    basicFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.value = device[field] || '';
    });

    selectProtocol(device.protocol);

    if (device.protocol === 'modbus') {
        selectModbusVariant(device.modbusVariant || 'tcp');

        if (device.modbusVariant === 'tcp') {
            const tcpFields = ['device_ip', 'modbus_port', 'port_name', 'unit_number', 'project_name', 'board_name_tcp'];
            tcpFields.forEach(field => {
                const el = document.getElementById(field);
                if (el) el.value = device[field] || '';
            });




            const memoryTcpEl = document.getElementById('memory_tcp');
            if (memoryTcpEl) {
                memoryTcpEl.value = device.memory || 'true';
            }
        } else {
            const rtuFields = ['gateway_address', 'slave_id', 'port_name_rtu', 'serial_port'];
            rtuFields.forEach(field => {
                const el = document.getElementById(field);
                if (el) el.value = device[field] || '';
            });

           const boardNameRtuEl = document.getElementById('board_name_rtu');
           if (boardNameRtuEl) {
                boardNameRtuEl.value = device.board_name_rtu || '';
    }


            const memoryRtuEl = document.getElementById('memory_rtu');
            if (memoryRtuEl) {
                memoryRtuEl.value = device.memory_rtu || 'true';
            }
        }

        if (device.baud_rate) {
            document.getElementById('advancedOptionsCheckbox').checked = true;
            toggleAdvancedOptions();
            ['baud_rate', 'data_bits', 'parity', 'stop_bits'].forEach(field => {
                const el = document.getElementById(field);
                if (el) el.value = device[field] || '';
            });
        }
    } else if (device.protocol === 'iec') {
        const iecFields = [
            'iec_device_ip', 'iec_port', 'ied_name', 'access_point',
            'logical_device', 'board_name', 'memory_iec', 'brcb', 'urcb', 'scl_file'
        ];
        iecFields.forEach(field => {
            const el = document.getElementById(field);
            if (el) el.value = device[field] || '';
        });
    }

    variables = device.variables || [];
    alarms = device.alarms || [];
    trends = device.trends || [];

    updateVariableTable();
    updateAlarmTable();
    updateTrendTable();
    updateFormButtons();
    updateProgressBar();
    showAlert('Device loaded successfully!', 'success');
}


function setupIECValidation() {
    const iecFields = ['brcb', 'urcb', 'board_name', 'scl_file'];

    iecFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            ['input', 'change', 'blur', 'focus'].forEach(event => {
                field.addEventListener(event, function() {
                    if (event === 'focus') {
                        clearFieldError(this);
                    } else {
                        validateFieldIEC(this);
                        updateFormButtons();
                    }
                });
            });
        }
    });
}


function addIECGenerateButton() {
    const buttonGroup = document.querySelector('.button-group');
    if (buttonGroup && !document.getElementById('generateIECBtn')) {
        const iecButton = document.createElement('button');
        iecButton.type = 'button';
        iecButton.className = 'btn btn-primary';
        iecButton.id = 'generateIECBtn';
        iecButton.textContent = 'Generate IEC Files';
        iecButton.onclick = generateIECFiles;
        iecButton.title = 'Generate IEC configuration files (3 CSV + XML)';

        buttonGroup.appendChild(iecButton);
    }
}


document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    updateDeviceCounter();
    setupValidation();
    setupIECValidation();
    setupFileHandlers();
    setTimeout(addIECGenerateButton, 100);
});


window.saveDevice = saveDeviceUpdated;
window.loadDevice = loadDeviceUpdated;
window.getMainFormRequiredFields = getMainFormRequiredFieldsUpdated;

document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    updateDeviceCounter();
    setupValidation();
    setupFileHandlers();
});

function initializeForm() {
    selectProtocol('modbus');
    selectModbusVariant('tcp');
    const advancedCheckbox = document.getElementById('advancedOptionsCheckbox');
    if (advancedCheckbox) {
        advancedCheckbox.checked = false;
        toggleAdvancedOptions();
    }
}

function setupFileHandlers() {
    const handlers = [
        ['csvFile', loadCSV],
        ['variablesCsvFile', loadVariablesCSV],
        ['alarmsCsvFile', loadAlarmsCSV],
        ['trendsCsvFile', loadTrendsCSV],
        ['cidFile', loadCID]
    ];
    handlers.forEach(([id, handler]) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', handler);
    });
}


function setupValidation() {
    const form = document.getElementById('deviceForm');
    if (!form) return;

    const fields = form.querySelectorAll('input, select');
    fields.forEach(field => {
        ['input', 'change', 'blur', 'focus'].forEach(event => {
            field.addEventListener(event, function() {
                if (event === 'focus') clearFieldError(this);
                else validateField(this);
                updateFormButtons();
                if (event !== 'focus') updateProgressBar();
            });
        });
    });
    setupSubFormValidation();
    updateFormButtons();
}

function setupSubFormValidation() {
    const fieldGroups = [
        ['item_name', 'io_device_var', 'tag_name_var', 'address', 'equipment_var', 'data_type'],
        ['alarm_name', 'alarm_type', 'category', 'alarm_tag', 'equipment', 'item_name_alarm'],
        ['tag_description', 'trend_types', 'tag_name', 'item_name_trend', 'trend_time']
    ];

    fieldGroups.flat().forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            ['input', 'change', 'blur', 'focus'].forEach(event => {
                field.addEventListener(event, function() {
                    if (event === 'focus') clearFieldError(this);
                    else validateField(this);
                    updateFormButtons();
                });
            });
        }
    });
}

function validateField(field) {
    const fieldName = field.name || field.id;
    const value = field.value.trim();
    const rules = validationRules[fieldName];

    if (!rules || (!isFieldVisible(field) && !isSubFormField(fieldName))) {
        delete validationErrors[fieldName];
        clearFieldError(field);
        return true;
    }

    let isValid = true;
    let errorMessage = '';


    if (rules.required && !value) {
        isValid = false;
        errorMessage = `${getFieldLabel(field)} is required`;
    }


    if (value) {
        if (rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = `${getFieldLabel(field)} must be at least ${rules.minLength} characters`;
        }
        if (rules.maxLength && value.length > rules.maxLength) {
            isValid = false;
            errorMessage = `${getFieldLabel(field)} must not exceed ${rules.maxLength} characters`;
        }
        if (rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = rules.message || `${getFieldLabel(field)} format is invalid`;
        }
        if (rules.min !== undefined || rules.max !== undefined) {
            const numValue = parseInt(value);
            if (isNaN(numValue)) {
                isValid = false;
                errorMessage = `${getFieldLabel(field)} must be a valid number`;
            } else {
                if (rules.min !== undefined && numValue < rules.min) {
                    isValid = false;
                    errorMessage = `${getFieldLabel(field)} must be at least ${rules.min}`;
                }
                if (rules.max !== undefined && numValue > rules.max) {
                    isValid = false;
                    errorMessage = `${getFieldLabel(field)} must not exceed ${rules.max}`;
                }
            }
        }
    }


    if (!isValid) {
        validationErrors[fieldName] = errorMessage;
        showFieldError(field, errorMessage);
    } else {
        delete validationErrors[fieldName];
        clearFieldError(field);
    }

    return isValid;
}

function isSubFormField(fieldName) {
    const subFormFields = [
        'item_name', 'io_device_var', 'tag_name_var', 'address', 'equipment_var', 'data_type',
        'alarm_name', 'alarm_type', 'category', 'alarm_tag', 'equipment', 'item_name_alarm',
        'tag_description', 'trend_types', 'tag_name', 'item_name_trend', 'trend_time'
    ];
    return subFormFields.includes(fieldName);
}

function isFieldVisible(field) {
    if (field.offsetParent === null) return false;
    const fieldName = field.name || field.id;

    if (currentProtocol === 'modbus') {
        if (fieldName.startsWith('iec_')) return false;
        if (currentModbusVariant === 'tcp') {
            return !['gateway_address', 'slave_id', 'port_name_rtu', 'memory_rtu', 'serial_port', 'baud_rate'].includes(fieldName);
        } else {
            return !['device_ip', 'modbus_port', 'port_name', 'memory_tcp', 'unit_number'].includes(fieldName);
        }
    } else if (currentProtocol === 'iec') {
        return !['device_ip', 'modbus_port', 'port_name', 'unit_number', 'memory_tcp', 'gateway_address', 'slave_id', 'port_name_rtu', 'memory_rtu', 'serial_port'].includes(fieldName);
    }
    return true;
}

function getFieldLabel(field) {
    const labels = {
        device_name: 'Device Name', device_type: 'Device Type', tag_prefix: 'Tag Prefix',
        io_device: 'I/O Device', device_ip: 'Device IP', modbus_port: 'Modbus Port',
        iec_device_ip: 'IEC Device IP', item_name: 'Item Name', alarm_name: 'Alarm Name'
    };
    return labels[field.name || field.id] || (field.name || field.id).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function showFieldError(field, message) {
    field.classList.add('field-error');
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'color: #dc3545; font-size: 0.8rem; margin-top: 4px;';
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
    field.style.cssText = 'border-color: #dc3545 !important; box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;';
}

function clearFieldError(field) {
    field.classList.remove('field-error');
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) errorMessage.remove();
    field.style.cssText = '';
}


function isFormComplete(type) {
    let requiredFields;
    switch (type) {
        case 'variable':
            requiredFields = ['item_name', 'io_device_var', 'tag_name_var', 'address', 'equipment_var', 'data_type'];
            break;
        case 'alarm':
            requiredFields = ['alarm_name', 'alarm_type', 'category', 'alarm_tag', 'equipment', 'item_name_alarm'];
            break;
        case 'trend':
            requiredFields = ['tag_description', 'trend_types', 'tag_name', 'item_name_trend'];
            break;
        case 'main':
            requiredFields = getMainFormRequiredFields();
            break;
        default:
            return false;
    }

    const allFieldsFilled = requiredFields.every(fieldName => {
        const field = document.getElementById(fieldName);
        return field && field.value.trim() !== '';
    });

    const hasErrors = requiredFields.some(fieldName => validationErrors.hasOwnProperty(fieldName));
    return allFieldsFilled && !hasErrors;
}

function getMainFormRequiredFields() {
    const requiredFields = ['device_name', 'device_type', 'tag_prefix', 'io_device'];

    if (currentProtocol === 'modbus') {
        if (currentModbusVariant === 'tcp') {
            requiredFields.push('device_ip', 'modbus_port', 'port_name', 'memory_tcp', 'board_name_tcp');
        } else {
            requiredFields.push('gateway_address', 'slave_id', 'port_name_rtu', 'serial_port', 'memory_rtu');
            if (document.getElementById('advancedOptionsCheckbox')?.checked) {
                requiredFields.push('baud_rate');
            }
        }
    } else if (currentProtocol === 'iec') {
        requiredFields.push('iec_device_ip', 'iec_port', 'ied_name', 'access_point', 'logical_device');
    }

    return requiredFields;
}

function updateFormButtons() {
    const buttonConfigs = [
        { selector: 'button[onclick="saveDevice()"]', condition: () => isFormComplete('main'), title: 'Save device configuration' },
        { selector: 'button[onclick="generateCSV()"]', condition: () => devices.length > 0, title: 'Generate CSV files' },
        { selector: 'button[onclick="addVariable()"]', condition: () => isFormComplete('variable'), title: 'Add variable' },
        { selector: 'button[onclick="addAlarm()"]', condition: () => isFormComplete('alarm'), title: 'Add alarm' },
        { selector: 'button[onclick="addTrend()"]', condition: () => isFormComplete('trend'), title: 'Add trend' }
    ];

    buttonConfigs.forEach(({ selector, condition, title }) => {
        const button = document.querySelector(selector);
        if (button) {
            const isEnabled = condition();
            button.disabled = !isEnabled;
            button.style.cssText = isEnabled ? '' : 'background-color: #6c757d !important; cursor: not-allowed !important; opacity: 0.6 !important;';
            button.title = title;
        }
    });
}

function updateProgressBar() {
    const form = document.getElementById('deviceForm');
    if (!form) return;

    const requiredFields = form.querySelectorAll('input[required], select[required]');
    let filledFields = 0, visibleRequiredFields = 0;

    requiredFields.forEach(field => {
        if (isFieldVisible(field)) {
            visibleRequiredFields++;
            if (field.value.trim() !== '' && !validationErrors[field.name || field.id]) {
                filledFields++;
            }
        }
    });

    const progress = visibleRequiredFields > 0 ? (filledFields / visibleRequiredFields) * 100 : 0;
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');

    if (progressFill) {
        progressFill.style.width = progress + '%';
        const errorCount = Object.keys(validationErrors).length;
        progressFill.style.backgroundColor = errorCount > 0 ? '#dc3545' : progress === 100 ? '#28a745' : '#007bff';
    }

    if (progressText) {
        const errorCount = Object.keys(validationErrors).length;
        if (errorCount > 0) {
            progressText.textContent = `${errorCount} error${errorCount > 1 ? 's' : ''} to fix`;
            progressText.style.color = '#dc3545';
        } else if (progress === 100) {
            progressText.textContent = 'Form complete - ready to save';
            progressText.style.color = '#28a745';
        } else {
            progressText.textContent = `${Math.round(progress)}% complete`;
            progressText.style.color = '#007bff';
        }
    }
}


function showTab(tabName, event) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    if (event?.target) event.target.classList.add('active');
    const targetContent = document.getElementById(tabName);
    if (targetContent) targetContent.classList.add('active');
}

function selectProtocol(protocol) {
    currentProtocol = protocol;

    document.querySelectorAll('.protocol-btn').forEach(btn => {
        btn.classList.toggle('active',
            (protocol === 'modbus' && btn.textContent.includes('Modbus')) ||
            (protocol === 'iec' && btn.textContent.includes('IEC'))
        );
    });

    const modbusConfig = document.getElementById('modbus-config');
    const iecConfig = document.getElementById('iec-config');
    const cidElements = ['cidInputLabel', 'cidFile'];


    if (protocol === 'modbus') {
        modbusConfig?.classList.remove('hidden');
        iecConfig?.classList.add('hidden');
        cidElements.forEach(id => document.getElementById(id)?.classList.add('hidden'));
        updateProtocolSelect(currentModbusVariant === 'tcp' ? 'Modbus TCP' : 'Modbus RTU');
    } else {
        modbusConfig?.classList.add('hidden');
        iecConfig?.classList.remove('hidden');
        cidElements.forEach(id => document.getElementById(id)?.classList.remove('hidden'));
        updateProtocolSelect('IEC61850');
    }

    clearProtocolErrors();
    updateFormButtons();
    updateProgressBar();
}

function updateProtocolSelect(value) {
    const protocolSelect = document.getElementById('protocol');
    if (protocolSelect) {
        protocolSelect.innerHTML = `<option value="${value}">${value.replace('TCP', 'TCP/IP')}</option>`;
    }
}

function selectModbusVariant(variant) {
    currentModbusVariant = variant;

    document.querySelectorAll('.modbus-variant-btn').forEach(btn => {
        btn.classList.toggle('active',
            (variant === 'tcp' && btn.textContent.trim() === 'TCP/IP') ||
            (variant === 'rtu' && btn.textContent.trim() === 'RTU')
        );
    });

    const tcpConfig = document.getElementById('modbus-tcp-config');
    const rtuConfig = document.getElementById('modbus-rtu-config');

    if (variant === 'tcp') {
        tcpConfig?.classList.remove('hidden');
        rtuConfig?.classList.add('hidden');
        updateProtocolSelect('Modbus TCP');
    } else {
        tcpConfig?.classList.add('hidden');
        rtuConfig?.classList.remove('hidden');
        updateProtocolSelect('Modbus RTU');
    }

    clearProtocolErrors();
    updateFormButtons();
    updateProgressBar();
}

function clearProtocolErrors() {
    const protocolFields = [
        'device_ip', 'modbus_port', 'port_name', 'unit_number', 'board_name_tcp',
        'gateway_address', 'slave_id', 'port_name_rtu', 'serial_port',
        'iec_device_ip', 'iec_port', 'ied_name', 'access_point', 'logical_device'
    ];

    protocolFields.forEach(fieldName => {
        delete validationErrors[fieldName];
        const field = document.getElementById(fieldName);
        if (field) clearFieldError(field);
    });
}

function toggleAdvancedOptions() {
    const checkbox = document.getElementById('advancedOptionsCheckbox');
    const content = document.getElementById('advancedOptionsContent');
    const advancedFields = ['baud_rate', 'data_bits', 'parity', 'stop_bits'];

    const isEnabled = checkbox?.checked;

    if (content) content.classList.toggle('enabled', isEnabled);

    advancedFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.disabled = !isEnabled;
            if (!isEnabled) {
                delete validationErrors[fieldId];
                clearFieldError(field);
            }
        }
    });

    updateFormButtons();
}


function addVariable() {
    if (!isFormComplete('variable')) {
        showAlert('Please complete all variable fields before adding', 'error');
        return;
    }

    const fields = ['item_name', 'io_device_var', 'data_type', 'tag_name_var', 'address', 'equipment_var'];
    const values = fields.map(id => document.getElementById(id).value.trim());

    if (variables.some(v => v.item_name?.toLowerCase() === values[0].toLowerCase())) {
        showAlert('Variable name already exists', 'error');
        return;
    }

    const variable = {
        id: Date.now().toString(),
        item_name: values[0],
        io_device: values[1],
        data_type: values[2],
        tag_name: values[3],
        address: values[4],
        equipment: values[5]
    };

    variables.push(variable);
    updateVariableTable();
    clearForm('variable');
    showAlert('Variable added successfully!', 'success');
}

function updateVariableTable() {
    const tbody = document.getElementById('variableTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    variables.forEach(variable => {
        const row = createEditableRow(variable, 'variable', [
            'item_name', 'io_device', 'tag_name', 'address', 'equipment', 'data_type'
        ]);
        tbody.appendChild(row);
    });
}

function createEditableRow(item, type, fields) {
    const row = document.createElement('tr');
    row.className = 'editable-row';
    row.setAttribute('data-id', item.id);

    const fieldMap = {
        variable: { data_type: ['float', 'int', 'bool', 'string', 'REAL', 'INT'] },
        alarm: {
            alarm_type: ['analog', 'digital', 'advanced'],
            category: ['low', 'medium', 'high', 'event']
        },
        trend: { trend_types: ['event', 'periodic', 'periodic-event'] }
    };

    fields.forEach(field => {
        const cell = document.createElement('td');
        const value = item[field] || item[field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())] || '';

        if (fieldMap[type] && fieldMap[type][field]) {
            const select = document.createElement('select');
            select.className = 'editable-select';
            select.onchange = () => updateItemField(item.id, field, select.value, type);
            select.onblur = () => saveItemChanges(item.id, type);

            fieldMap[type][field].forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.textContent = option.charAt(0).toUpperCase() + option.slice(1);
                opt.selected = value === option;
                select.appendChild(opt);
            });
            cell.appendChild(select);
        } else {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'editable-cell';
            input.value = value;
            input.onchange = () => updateItemField(item.id, field, input.value, type);
            input.onblur = () => saveItemChanges(item.id, type);
            cell.appendChild(input);
        }
        row.appendChild(cell);
    });


    const actionCell = document.createElement('td');
    actionCell.className = 'action-buttons';
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn btn-danger';
    removeBtn.textContent = 'Remove';
    removeBtn.style.cssText = 'background: #dc3545; padding: 6px 12px; font-size: 0.8rem;';
    removeBtn.onclick = () => removeItem(item.id, type);
    actionCell.appendChild(removeBtn);
    row.appendChild(actionCell);

    return row;
}

function updateItemField(id, field, value, type) {
    const collections = { variable: variables, alarm: alarms, trend: trends };
    const item = collections[type].find(i => i.id === id);
    if (item) item[field] = value;
}

function saveItemChanges(id, type) {
    showAlert(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`, 'success');
}

function removeItem(id, type) {
    if (confirm(`Are you sure you want to remove this ${type}?`)) {
        const collections = { variable: variables, alarm: alarms, trend: trends };
        const updateFunctions = {
            variable: updateVariableTable,
            alarm: updateAlarmTable,
            trend: updateTrendTable
        };

        collections[type] = collections[type].filter(i => i.id !== id);
        updateFunctions[type]();
        showAlert(`${type.charAt(0).toUpperCase() + type.slice(1)} removed successfully!`, 'success');
    }
}

function clearForm(type) {
    const fieldMaps = {
        variable: ['item_name', 'io_device_var', 'data_type', 'tag_name_var', 'address', 'equipment_var'],
        alarm: ['alarm_name', 'alarm_type', 'category', 'alarm_tag', 'equipment', 'item_name_alarm'],
        trend: ['tag_description', 'trend_types', 'tag_name', 'item_name_trend', 'trend_time']
    };

    fieldMaps[type].forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = field.tagName === 'SELECT' ? field.options[0].value : '';
            clearFieldError(field);
            delete validationErrors[fieldId];
        }
    });
    updateFormButtons();
}


function addAlarm() {
    if (!isFormComplete('alarm')) {
        showAlert('Please complete all alarm fields before adding', 'error');
        return;
    }

    const fields = ['alarm_name', 'alarm_type', 'category', 'alarm_tag', 'equipment', 'item_name_alarm'];
    const values = fields.map(id => document.getElementById(id).value.trim());

    if (alarms.some(a => a.alarm_name?.toLowerCase() === values[0].toLowerCase())) {
        showAlert('Alarm name already exists', 'error');
        return;
    }

    const alarm = {
        id: Date.now().toString(),
        alarm_name: values[0],
        alarm_type: values[1],
        category: values[2],
        alarm_tag: values[3],
        equipment: values[4],
        item_name: values[5]
    };

    alarms.push(alarm);
    updateAlarmTable();
    clearForm('alarm');
    showAlert('Alarm added successfully!', 'success');
}

function updateAlarmTable() {
    const tbody = document.getElementById('alarmTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    alarms.forEach(alarm => {
        const row = createEditableRow(alarm, 'alarm', [
            'alarm_name', 'alarm_type', 'category', 'alarm_tag', 'equipment', 'item_name'
        ]);
        tbody.appendChild(row);
    });
}


function addTrend() {
    if (!isFormComplete('trend')) {
        showAlert('Please complete all trend fields before adding', 'error');
        return;
    }

    const fields = ['tag_description', 'trend_types', 'tag_name', 'item_name_trend'];
    const values = fields.map(id => document.getElementById(id).value.trim());
    const timeValue = document.getElementById('trend_time')?.value || '00:00';

    if (trends.some(t => t.tag_description?.toLowerCase() === values[0].toLowerCase())) {
        showAlert('Tag description already exists', 'error');
        return;
    }

    const trend = {
        id: Date.now().toString(),
        tag_description: values[0],
        trend_types: values[1],
        tag_name: values[2],
        item_name: values[3],
        time: timeValue
    };

    trends.push(trend);
    updateTrendTable();
    clearForm('trend');
    showAlert('Trend added successfully!', 'success');
}

function updateTrendTable() {
    const tbody = document.getElementById('trendTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    trends.forEach(trend => {
        const row = createEditableRow(trend, 'trend', [
            'tag_description', 'trend_types', 'tag_name', 'item_name', 'time'
        ]);
        tbody.appendChild(row);
    });
}


function saveDevice() {
    if (!performCompleteValidation()) {
        showAlert('Please fix all validation errors before saving', 'error');
        return;
    }

    if (currentProtocol === 'iec' && !validateReportControlBlocks()) {
        showAlert('Please fill in at least one Report Control Block (BRCB or URCB)', 'error');
        return;
    }

    const form = document.getElementById('deviceForm');
    const formData = new FormData(form);
    const deviceName = formData.get('device_name');

    const existingDevice = devices.find(d =>
        d.device_name.toLowerCase() === deviceName.toLowerCase() &&
        (!currentDevice || d.id !== currentDevice.id)
    );

    if (existingDevice) {
        showFieldError(document.getElementById('device_name'), 'Device name already exists');
        showAlert('Device name already exists. Please choose a different name.', 'error');
        return;
    }

    const device = {
        id: currentDevice ? currentDevice.id : Date.now().toString(),
        protocol: currentProtocol,
        modbusVariant: currentModbusVariant,
        device_name: deviceName,
        device_type: formData.get('device_type'),
        tag_prefix: formData.get('tag_prefix'),
        io_device: formData.get('io_device'),
        variables: [...variables],
        alarms: [...alarms],
        trends: [...trends]
    };

    if (currentProtocol === 'modbus') {

        const boardNameValue = formData.get('board_name_tcp') ||
                              document.getElementById('board_name_tcp')?.value || '';

        if (currentModbusVariant === 'tcp') {
            Object.assign(device, {
                device_ip: formData.get('device_ip'),
                modbus_port: formData.get('modbus_port'),
                port_name: formData.get('port_name'),
                unit_number: formData.get('unit_number'),
                board_name_tcp: formData.get('board_name_tcp'),
                project_name: formData.get('project_name'),
                memory: formData.get('memory')
            });
        } else {
            Object.assign(device, {
                gateway_address: formData.get('gateway_address'),
                slave_id: formData.get('slave_id'),
                port_name_rtu: formData.get('port_name_rtu'),
                memory_rtu: formData.get('memory_rtu'),
                serial_port: formData.get('serial_port'),
                board_name_tcp: boardNameValue
            });

            if (document.getElementById('advancedOptionsCheckbox').checked) {
                Object.assign(device, {
                    baud_rate: formData.get('baud_rate'),
                    data_bits: formData.get('data_bits'),
                    parity: formData.get('parity'),
                    stop_bits: formData.get('stop_bits')
                });
            }
        }
        device.protocol_name = formData.get('protocol');
    } else if (currentProtocol === 'iec') {
        Object.assign(device, {
            iec_device_ip: formData.get('iec_device_ip'),
            iec_port: formData.get('iec_port'),
            ied_name: formData.get('ied_name'),
            access_point: formData.get('access_point'),
            logical_device: formData.get('logical_device'),
            board_name: formData.get('board_name'),
            memory_iec: formData.get('memory_iec'),
            brcb: formData.get('brcb'),
            urcb: formData.get('urcb'),
            scl_file: formData.get('scl_file'),
            protocol_name: 'IEC61850'
        });
    }

    if (currentDevice) {
        const index = devices.findIndex(d => d.id === currentDevice.id);
        if (index !== -1) devices[index] = device;
    } else {
        devices.push(device);
    }

    updateDeviceList();
    updateDeviceCounter();
    showAlert('Device saved successfully!', 'success');
    currentDevice = null;
}


function performCompleteValidation() {
    const form = document.getElementById('deviceForm');
    if (!form) return false;

    let isValid = true;
    validationErrors = {};

    form.querySelectorAll('input, select').forEach(field => {
        if (isFieldVisible(field) && !validateField(field)) {
            isValid = false;
        }
    });

    updateFormButtons();
    updateProgressBar();
    return isValid;
}

function resetForm() {
    const form = document.getElementById('deviceForm');
    if (form) form.reset();

    validationErrors = {};
    form.querySelectorAll('input, select').forEach(field => clearFieldError(field));

    variables = [];
    alarms = [];
    trends = [];
    currentDevice = null;

    updateVariableTable();
    updateAlarmTable();
    updateTrendTable();

    selectProtocol('modbus');
    selectModbusVariant('tcp');

    const advancedCheckbox = document.getElementById('advancedOptionsCheckbox');
    if (advancedCheckbox) {
        advancedCheckbox.checked = false;
        toggleAdvancedOptions();
    }

    updateFormButtons();
    updateProgressBar();
    showAlert('Form reset successfully!', 'success');
}

function updateDeviceList() {
    const deviceList = document.getElementById('deviceList');
    if (!deviceList) return;

    if (devices.length === 0) {
        deviceList.innerHTML = '<div class="placeholder-content"><p>No devices configured yet.</p></div>';
        return;
    }

    deviceList.innerHTML = devices.map(device => `
        <div class="device-item" onclick="loadDevice('${device.id}')" style="
            background: rgba(255,255,255,0.1); margin: 10px 0; padding: 12px; border-radius: 6px;
            cursor: pointer; transition: all 0.3s ease;"
            onmouseover="this.style.background='rgba(255,255,255,0.2)'"
            onmouseout="this.style.background='rgba(255,255,255,0.1)'">
            <div style="font-weight: bold; margin-bottom: 4px;">${device.device_name}</div>
            <div style="font-size: 0.9em; opacity: 0.8;">${device.device_type} - ${device.protocol.toUpperCase()}</div>
            <button onclick="event.stopPropagation(); removeDevice('${device.id}')" style="
                background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px;
                font-size: 0.8em; margin-top: 8px; cursor: pointer;">Remove</button>
        </div>
    `).join('');
}

function loadDevice(deviceId) {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    currentDevice = device;
    validationErrors = {};
    document.querySelectorAll('input, select').forEach(field => clearFieldError(field));

    const basicFields = ['device_name', 'device_type', 'tag_prefix', 'io_device'];
    basicFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.value = device[field] || '';
    });

    selectProtocol(device.protocol);

    if (device.protocol === 'modbus') {
        selectModbusVariant(device.modbusVariant || 'tcp');


        const boardNameEl = document.getElementById('board_name_tcp');
        if (boardNameEl) {
            boardNameEl.value = device.board_name_tcp || device.board_name || '';
        }

        if (device.modbusVariant === 'tcp') {
            const tcpFields = ['device_ip', 'modbus_port', 'port_name', 'unit_number', 'project_name'];
            tcpFields.forEach(field => {
                const el = document.getElementById(field);
                if (el) el.value = device[field] || '';
            });


            const memoryTcpEl = document.getElementById('memory_tcp');
            if (memoryTcpEl) {
                memoryTcpEl.value = device.memory || 'true';
            }
        } else {
            const rtuFields = ['gateway_address', 'slave_id', 'port_name_rtu', 'serial_port'];
            rtuFields.forEach(field => {
                const el = document.getElementById(field);
                if (el) el.value = device[field] || '';
            });


            const memoryRtuEl = document.getElementById('memory_rtu');
            if (memoryRtuEl) {
                memoryRtuEl.value = device.memory_rtu || 'true';
            }
        }

        if (device.baud_rate) {
            document.getElementById('advancedOptionsCheckbox').checked = true;
            toggleAdvancedOptions();
            ['baud_rate', 'data_bits', 'parity', 'stop_bits'].forEach(field => {
                const el = document.getElementById(field);
                if (el) el.value = device[field] || '';
            });
        }
    } else if (device.protocol === 'iec') {
        const iecFields = [
            'iec_device_ip', 'iec_port', 'ied_name', 'access_point',
            'logical_device', 'board_name', 'memory_iec', 'brcb', 'urcb', 'scl_file'
        ];
        iecFields.forEach(field => {
            const el = document.getElementById(field);
            if (el) el.value = device[field] || '';
        });
    }

    variables = device.variables || [];
    alarms = device.alarms || [];
    trends = device.trends || [];

    updateVariableTable();
    updateAlarmTable();
    updateTrendTable();
    updateFormButtons();
    updateProgressBar();
    showAlert('Device loaded successfully!', 'success');
}

function removeDevice(deviceId) {
    if (confirm('Are you sure you want to remove this device?')) {
        devices = devices.filter(d => d.id !== deviceId);
        updateDeviceList();
        updateDeviceCounter();
        updateFormButtons();
        showAlert('Device removed successfully!', 'success');
    }
}

function updateDeviceCounter() {
    const counter = document.getElementById('deviceCounter');
    if (counter) counter.textContent = devices.length;
}


function generateCSV() {
    if (devices.length === 0) {
        showAlert('No devices to export. Please save at least one device first.', 'error');
        return;
    }

    showLoading(true);
    setTimeout(() => {
        try {
            generateEquipmentCSV();
            generateUnitsCSV();
            generateVariablesCSV();
            generateAlarmsCSV();
            generateTrendsCSV();
            showAlert('All CSV files generated successfully!', 'success');
        } catch (error) {
            showAlert('Error generating CSV files: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }, 1000);
}

function generateEquipmentCSV() {
    const headers = [
        'Name',
        'Cluster Name',
        'Display Name',
        'Type',
        'Location',
        'Page',
        'Content',
        'Help',
        'Comment',
        'Tag Prefix',
        'I/O Device',
        'Hidden',
        'Area',
        'Custom 1',
        'Custom 2',
        'Custom 3',
        'Custom 4',
        'Custom 5',
        'Custom 6',
        'Custom 7',
        'Custom 8',
        'Scheduled',
        'Default State',
        'Schedule ID',
        'Device Schedule',
        'Parameters',
        'Project',
        'COMPOSITE',
        'TAGGENLINK',
        'LINKED',
        'EDITCODE',
        'REFERENCE'
    ];

    const rows = [headers.join(',')];

    devices.forEach(device => {
        const row = [
            `"${device.device_name || ''}"`,
            `"c1"`,
            `""`,
            `"${device.device_type || ''}"`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `"${device.tag_prefix || ''}"`,
            `"${device.io_device || ''}"`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `"FUGA_sim_copy"`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`
        ];
        rows.push(row.join(','));
    });

    downloadCSV(rows.join('\n'), 'EQUIP.csv');
}

function generateVariablesCSV() {
    if (variables.length === 0) {
        showAlert('No variables configured', 'error');
        return;
    }

    const headers = [
        'Equipment', 'Item Name', 'Tag Name', 'Cluster Name', 'I/O Device',
        'Data Type', 'Address', 'Comment', 'Deadband', 'Eng Units', 'Format',
        'Raw Zero Scale', 'Raw Full Scale', 'Eng Zero Scale', 'Eng Full Scale',
        'Custom 1', 'Custom 2', 'Custom 3', 'Custom 4', 'Custom 5', 'Custom 6',
        'Custom 7', 'Custom 8', 'Write Roles', 'Historize', 'Project', 'EDITCODE',
        'LINKED', 'OID', 'REF1', 'REF2', 'CUSTOM', 'TAGGENLINK', 'Unique ID'
    ];
    const rows = [headers.join(',')];

    variables.forEach(variable => {
        const row = [
            `"${variable.equipment || ''}"`,
            `"${variable.item_name || ''}"`,
            `"${variable.tag_name || ''}"`,
            `"c1"`,
            `"${variable.io_device || ''}"`,
            `"${variable.data_type || ''}"`,
            `"${variable.address || ''}"`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `"FUGA_sim_copy"`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `"${variable.unique_id || ''}"`
        ];
        rows.push(row.join(','));
    });

    downloadCSV(rows.join('\n'), 'VARIABLES.csv');
}

function generateAlarmsCSV() {
    if (alarms.length === 0) {
        showAlert('No alarms configured', 'error');
        return;
    }

    const headers = [
        'Equipment', 'Item Name', 'Alarm Tag', 'Alarm Name', 'Cluster Name',
        'Category', 'Alarm Desc', 'Delay', 'Help', 'Comment', 'Variable Tag A', 'Variable Tag B',
        'Custom 1', 'Custom 2', 'Custom 3', 'Custom 4', 'Custom 5', 'Custom 6',
        'Custom 7', 'Custom 8', 'Paging', 'Paging Group', 'Area', 'Privilege',
        'Historize', 'Project', 'SEQUENCE', 'TAGGENLINK', 'EDITCODE', 'LINKED'
    ];
    const rows = [headers.join(',')];

    alarms.forEach(alarm => {
        const row = [
            `"${alarm.equipment || ''}"`,
            `"${alarm.item_name || ''}"`,
            `"${alarm.alarm_tag || ''}"`,
            `"${alarm.alarm_name || ''}"`,
            `"c1"`,
            `"${alarm.category || ''}"`,
            `"${alarm.alarm_desc || ''}"`,
            `""`,
            `""`,
            `""`,
            `"${alarm.alarm_tag || ''}"`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `"${alarm.equipment || ''}"`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `"FUGA_sim_copy"`,
            `""`,
            `""`,
            `""`,
            `""`
        ];
        rows.push(row.join(','));
    });

    downloadCSV(rows.join('\n'), 'ALARMS.csv');
}

function generateTrendsCSV() {
    if (trends.length === 0) {
        showAlert('No trends configured', 'error');
        return;
    }

    const headers = [
        'Equipment', 'Item Name', 'Tag Name', 'Cluster Name', 'Type', 'Expression',
        'Trigger', 'Sample Period', 'Eng Units', 'Format', 'Deadband', 'Comment',
        'Zero Scale', 'Full Scale', 'File Name', 'No. Files', 'Period', 'Time',
        'Storage Method', 'Area', 'Privilege', 'Historize', 'Project', 'SPCFLAG',
        'LSL', 'USL', 'SUBGRPSIZE', 'XDOUBLEBAR', 'RANGE', 'SDEVIATION',
        'TAGGENLINK', 'EDITCODE', 'LINKED'
    ];
    const rows = [headers.join(',')];

    trends.forEach(trend => {
        let samplePeriod = '900000000';
        if (trend.time && trend.time.includes(':')) {
            const parts = trend.time.split(':');
            if (parts.length === 2) {
                const minutes = parseInt(parts[0]);
                const seconds = parseInt(parts[1]);
                const totalMs = (minutes * 60 + seconds) * 1000;
                samplePeriod = (totalMs * 10000).toString();
            }
        }

        const row = [
            `"${trend.tag_description || ''}"`,
            `"${trend.item_name || ''}"`,
            `"${trend.tag_name || ''}"`,
            `"c1"`,
            `"TRN_PERIODIC"`,
            `"${trend.tag_name || ''}"`,
            `""`,
            `"${samplePeriod}"`,
            `"${trend.eng_units || ''}"`,
            `"###.#"`,
            `""`,
            `"${trend.comment || ''}"`,
            `""`,
            `""`,
            `""`,
            `"13"`,
            `"1st"`,
            `""`,
            `"Floating Point (8-byte samples)"`,
            `""`,
            `""`,
            `""`,
            `"FUGA_sim_copy"`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`,
            `""`
        ];
        rows.push(row.join(','));
    });

    downloadCSV(rows.join('\n'), 'TRENDS.csv');
}


function loadCSV(event) {
    const file = event.target.files[0];
    if (!file || !file.name.toLowerCase().endsWith('.csv')) {
        showAlert('Please select a valid CSV file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                showAlert('CSV file appears to be empty', 'error');
                return;
            }

            const headers = lines[0].split(',').map(h => h.trim());

            if (headers.includes('ITEM_NAME') && headers.includes('EQUIP_TYPE')) {
                loadEquipmentFromCSV(lines);
            } else if (headers.includes('UNIT_NAME') && headers.includes('PROTOCOL')) {
                loadUnitsFromCSV(lines);
            } else {
                showAlert('CSV format not recognized', 'error');
                return;
            }

            showAlert('CSV loaded successfully!', 'success');
        } catch (error) {
            showAlert('Error loading CSV: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

function loadVariablesCSV(event) {
    const file = event.target.files[0];
    if (!file || !file.name.toLowerCase().endsWith('.csv')) {
        showAlert('Please select a valid CSV file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                showAlert('Variables CSV file appears to be empty', 'error');
                return;
            }

            const headers = parseCSVLine(lines[0]);
            let loadedCount = 0;


            if (variables.length > 0) {
                if (confirm('This will replace existing variables. Continue?')) {
                    variables = [];
                } else {
                    return;
                }
            }


            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i]);

                const equipment = getValueByHeader(values, headers, ['Equipment', 'EQUIPMENT']);
                const item_name = getValueByHeader(values, headers, ['Item Name', 'ITEM_NAME']);
                const tag_name = getValueByHeader(values, headers, ['Tag Name', 'TAG_NAME']);
                const io_device = getValueByHeader(values, headers, ['I/O Device', 'IO_DEVICE']);
                const data_type = getValueByHeader(values, headers, ['Data Type', 'DATA_TYPE']) || 'float';
                const address = getValueByHeader(values, headers, ['Address', 'ADDRESS']);


                if (item_name && tag_name) {

                    if (!variables.some(v => v.item_name?.toLowerCase() === item_name.toLowerCase())) {
                        const variable = {
                            id: Date.now().toString() + Math.random(),
                            equipment: equipment,
                            item_name: item_name,
                            tag_name: tag_name,
                            io_device: io_device,
                            data_type: data_type,
                            address: address
                        };

                        variables.push(variable);
                        loadedCount++;
                    }
                }
            }


            updateVariableTable();
            showAlert(`${loadedCount} variables loaded from CSV!`, 'success');
        } catch (error) {
            showAlert('Error loading variables CSV: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

function loadAlarmsCSV(event) {
    const file = event.target.files[0];
    if (!file || !file.name.toLowerCase().endsWith('.csv')) {
        showAlert('Please select a valid CSV file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                showAlert('Alarms CSV file appears to be empty', 'error');
                return;
            }

            const headers = parseCSVLine(lines[0]);
            let loadedCount = 0;


            if (alarms.length > 0) {
                if (confirm('This will replace existing alarms. Continue?')) {
                    alarms = [];
                } else {
                    return;
                }
            }


            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i]);

                const equipment = getValueByHeader(values, headers, ['Equipment', 'EQUIPMENT']);
                const item_name = getValueByHeader(values, headers, ['Item Name', 'ITEM_NAME']);
                const alarm_tag = getValueByHeader(values, headers, ['Alarm Tag', 'ALARM_TAG']);
                const alarm_name = getValueByHeader(values, headers, ['Alarm Name', 'ALARM_NAME']);
                const category = getValueByHeader(values, headers, ['Category', 'CATEGORY']) || 'medium';
                const alarm_type = getValueByHeader(values, headers, ['Alarm Type', 'ALARM_TYPE']) || 'analog';


                if (alarm_name && item_name) {

                    if (!alarms.some(a => a.alarm_name?.toLowerCase() === alarm_name.toLowerCase())) {
                        const alarm = {
                            id: Date.now().toString() + Math.random(),
                            equipment: equipment,
                            item_name: item_name,
                            alarm_tag: alarm_tag,
                            alarm_name: alarm_name,
                            category: category,
                            alarm_type: alarm_type
                        };

                        alarms.push(alarm);
                        loadedCount++;
                    }
                }
            }


            updateAlarmTable();
            showAlert(`${loadedCount} alarms loaded from CSV!`, 'success');
        } catch (error) {
            showAlert('Error loading alarms CSV: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

function loadTrendsCSV(event) {
    const file = event.target.files[0];
    if (!file || !file.name.toLowerCase().endsWith('.csv')) {
        showAlert('Please select a valid CSV file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                showAlert('Trends CSV file appears to be empty', 'error');
                return;
            }

            const headers = parseCSVLine(lines[0]);
            let loadedCount = 0;


            if (trends.length > 0) {
                if (confirm('This will replace existing trends. Continue?')) {
                    trends = [];
                } else {
                    return;
                }
            }


            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i]);

                const tag_description = getValueByHeader(values, headers, ['Tag Description', 'TAG_DESCRIPTION', 'Comment']);
                const item_name = getValueByHeader(values, headers, ['Item Name', 'ITEM_NAME']);
                const tag_name = getValueByHeader(values, headers, ['Tag Name', 'TAG_NAME']);
                const trend_types = getValueByHeader(values, headers, ['Trend Types', 'TREND_TYPES']) || 'periodic';
                const time = getValueByHeader(values, headers, ['Time', 'TIME']) || '00:00';


                if (tag_description && item_name) {

                    if (!trends.some(t => t.tag_description?.toLowerCase() === tag_description.toLowerCase())) {
                        const trend = {
                            id: Date.now().toString() + Math.random(),
                            tag_description: tag_description,
                            item_name: item_name,
                            tag_name: tag_name,
                            trend_types: trend_types,
                            time: time
                        };

                        trends.push(trend);
                        loadedCount++;
                    }
                }
            }


            updateTrendTable();
            showAlert(`${loadedCount} trends loaded from CSV!`, 'success');
        } catch (error) {
            showAlert('Error loading trends CSV: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result.map(val => val.replace(/^"|"$/g, '').replace(/""/g, '"'));
}

function getValueByHeader(values, headers, possibleNames) {
    for (let name of possibleNames) {
        const index = headers.findIndex(h => h.toUpperCase() === name.toUpperCase());
        if (index !== -1 && values[index]) return values[index];
    }
    return '';
}


function loadCID(event) {
    const file = event.target.files[0];
    if (!file || !file.name.toLowerCase().endsWith('.cid')) {
        showAlert('Please select a valid CID file', 'error');
        return;
    }

    showLoading(true);
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const cidContent = e.target.result;
            if (!cidContent.includes('<?xml') || !cidContent.includes('<SCL')) {
                showAlert('Invalid CID file format', 'error');
                showLoading(false);
                return;
            }

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(cidContent, 'text/xml');

            if (xmlDoc.querySelector('parsererror')) {
                showAlert('Error parsing CID file: Invalid XML', 'error');
                showLoading(false);
                return;
            }

            parseCIDData(xmlDoc);
        } catch (error) {
            showAlert('Error loading CID file: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    };
    reader.readAsText(file);
}

function parseCIDData(xmlDoc) {
    try {
        validationErrors = {};
        selectProtocol('iec');


        const communication = xmlDoc.querySelector('Communication');
        if (communication) {
            const connectedAP = communication.querySelector('ConnectedAP');
            if (connectedAP) {
                const iedName = connectedAP.getAttribute('iedName');
                const apName = connectedAP.getAttribute('apName');

                if (iedName) document.getElementById('ied_name').value = iedName;
                if (apName) document.getElementById('access_point').value = apName;

                const address = connectedAP.querySelector('Address');
                if (address) {
                    const ipElement = address.querySelector('P[type="IP"]');
                    if (ipElement) {
                        document.getElementById('iec_device_ip').value = ipElement.textContent;
                    }
                }
            }
        }


        const ieds = xmlDoc.querySelectorAll('IED');
        if (ieds.length > 0) {
            const firstIED = ieds[0];
            const iedName = firstIED.getAttribute('name');
            const iedType = firstIED.getAttribute('type') || 'IED';

            document.getElementById('device_name').value = iedName || 'IED_Device';
            document.getElementById('device_type').value = iedType;
            document.getElementById('tag_prefix').value = (iedName || 'IED').substring(0, 10).toUpperCase();

            const accessPoint = firstIED.querySelector('AccessPoint');
            if (accessPoint) {
                document.getElementById('access_point').value = accessPoint.getAttribute('name');

                const lDevice = accessPoint.querySelector('LDevice');
                if (lDevice) {
                    document.getElementById('logical_device').value = lDevice.getAttribute('inst') || 'LD0';
                }
            }
        }

        if (!document.getElementById('iec_port').value) {
            document.getElementById('iec_port').value = '102';
        }

        updateFormButtons();
        updateProgressBar();
        showAlert('CID file parsed successfully!', 'success');
    } catch (error) {
        showAlert('Error parsing CID data: ' + error.message, 'error');
    }
}


function loadEquipmentFromCSV(lines) {
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values[0]) {
            const device = {
                id: Date.now().toString() + i,
                device_name: values[0] || '',
                device_type: values[1] || '',
                tag_prefix: values[3] || '',
                io_device: values[4] || '',
                protocol: 'modbus',
                modbusVariant: 'tcp',
                variables: [], alarms: [], trends: []
            };
            devices.push(device);
        }
    }
    updateDeviceList();
    updateDeviceCounter();
}

function loadUnitsFromCSV(lines) {

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values[0]) {
            const device = {
                id: Date.now().toString() + i,
                device_name: values[0] || '',
                device_type: values[1] === 'IED' ? 'IED' : 'PLC',
                port_name: values[2] || '',
                device_ip: values[3] || '',
                protocol_name: values[4] || '',
                protocol: values[4]?.includes('IEC') ? 'iec' : 'modbus',
                variables: [], alarms: [], trends: []
            };
            devices.push(device);
        }
    }
    updateDeviceList();
    updateDeviceCounter();
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type === 'error' ? 'error' : 'success'}`;
    alert.textContent = message;

    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alert, container.firstChild);
        setTimeout(() => {
            if (alert.parentNode) alert.parentNode.removeChild(alert);
        }, 5000);
    }
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    const form = document.getElementById('deviceForm');

    if (loading) {
        loading.classList.toggle('show', show);
        if (form) form.style.display = show ? 'none' : 'block';
    }
}

    function loadCSV(event) {
    const file = event.target.files[0];
    if (!file || !file.name.toLowerCase().endsWith('.csv')) {
        showAlert('Please select a valid CSV file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                showAlert('CSV file appears to be empty', 'error');
                return;
            }

            const headers = parseCSVLine(lines[0]);


            const isEquipCSV = headers.some(h =>
                ['Name', 'ITEM_NAME', 'Type', 'EQUIP_TYPE'].includes(h.trim())
            );

            const isUnitsCSV = headers.some(h =>
                ['Server Name', 'UNIT_NAME', 'Address', 'Protocol'].includes(h.trim())
            );

            if (isEquipCSV) {
                loadEquipmentFromCSV(lines);
            } else if (isUnitsCSV) {
                loadUnitsFromCSV(lines);
            } else {
                showAlert('CSV format not recognized. Expected EQUIP.csv or UNITS.csv format', 'error');
                return;
            }

            showAlert('CSV loaded and device created successfully!', 'success');
        } catch (error) {
            showAlert('Error loading CSV: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

function loadEquipmentFromCSV(lines) {
    const headers = parseCSVLine(lines[0]);

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < 2) continue;

        const rowData = {};
        headers.forEach((header, index) => {
            rowData[header.trim()] = values[index] ? values[index].trim() : '';
        });


        const deviceName = rowData['Name'] || rowData['ITEM_NAME'] || '';
        const deviceType = rowData['Type'] || rowData['EQUIP_TYPE'] || 'PV';
        const tagPrefix = rowData['Tag Prefix'] || deviceName.substring(0, 8).toUpperCase();
        const ioDevice = rowData['I/O Device'] || `IO_${deviceName}`;

        if (deviceName) {

            resetForm();
            document.getElementById('device_name').value = deviceName;
            document.getElementById('device_type').value = deviceType;
            document.getElementById('tag_prefix').value = tagPrefix;
            document.getElementById('io_device').value = ioDevice;


            selectProtocol('modbus');
            break;
        }
    }
}

function loadCSV(event) {
    const file = event.target.files[0];
    if (!file || !file.name.toLowerCase().endsWith('.csv')) {
        showAlert('Please select a valid CSV file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                showAlert('CSV file appears to be empty', 'error');
                return;
            }

            const headers = parseCSVLine(lines[0]);


            const isEquipCSV = headers.some(h =>
                ['Name', 'Type', 'Tag Prefix', 'I/O Device'].includes(h.trim())
            );


            const isUnitsCSV = headers.some(h =>
                ['Server Name', 'Port Name', 'Port Number', 'Board Name'].includes(h.trim())
            );

            let loadedSections = [];

            if (isEquipCSV) {
                loadEquipmentDataToForm(lines);
                loadedSections.push('Device Configuration');
            }

            if (isUnitsCSV) {
                loadUnitsDataToForm(lines);
                loadedSections.push('Network Configuration');
            }

            if (loadedSections.length === 0) {
                showAlert('CSV format not recognized. Expected EQUIP.csv or UNITS.csv format', 'error');
                return;
            }

            showAlert(`CSV loaded successfully! Filled: ${loadedSections.join(' and ')}`, 'success');

        } catch (error) {
            showAlert('Error loading CSV: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

function loadEquipmentDataToForm(lines) {
    const headers = parseCSVLine(lines[0]);


    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < 2) continue;

        const rowData = {};
        headers.forEach((header, index) => {
            rowData[header.trim()] = values[index] ? values[index].trim() : '';
        });

        const deviceName = rowData['Name'] || '';
        const deviceType = rowData['Type'] || 'PV';
        const tagPrefix = rowData['Tag Prefix'] || deviceName.substring(0, 8).toUpperCase();
        const ioDevice = rowData['I/O Device'] || `IO_${deviceName}`;

        if (deviceName) {

            document.getElementById('device_name').value = deviceName;
            document.getElementById('device_type').value = deviceType;
            document.getElementById('tag_prefix').value = tagPrefix;
            document.getElementById('io_device').value = ioDevice;
            break;
        }
    }
}

function loadUnitsDataToForm(lines) {
    const headers = parseCSVLine(lines[0]);


    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < 2) continue;

        const rowData = {};
        headers.forEach((header, index) => {
            rowData[header.trim()] = values[index] ? values[index].trim() : '';
        });

        const portName = rowData['Port Name'] || '';
        const portNumber = rowData['Port Number'] || '';
        const boardName = rowData['Board Name'] || '';
        const specialOpt = rowData['Special Opt'] || '';
        const comment = rowData['Comment'] || '';

        if (portName && boardName) {

            let ipAddress = '';
            let tcpPort = '502';

            if (specialOpt) {
                const ipMatch = specialOpt.match(/-I([0-9.]+)/);
                const portMatch = specialOpt.match(/-P(\d+)/);

                if (ipMatch) ipAddress = ipMatch[1];
                if (portMatch) tcpPort = portMatch[1];
            }


            if (comment && comment.toUpperCase().includes('TCP')) {
                selectProtocol('modbus');
                selectModbusVariant('tcp');
                document.getElementById('device_ip').value = ipAddress;
                document.getElementById('modbus_port').value = tcpPort;
                document.getElementById('port_name').value = portName;
                document.getElementById('unit_number').value = portNumber || '1';
                document.getElementById('board_name_tcp').value = boardName;
                document.getElementById('memory_tcp').value = 'true';
            } else if (comment && comment.toUpperCase().includes('GATEWAY')) {
                selectProtocol('modbus');
                selectModbusVariant('rtu');
                document.getElementById('gateway_address').value = ipAddress;
                document.getElementById('slave_id').value = portNumber || '1';
                document.getElementById('port_name_rtu').value = portName;
                document.getElementById('board_name_rtu').value = boardName;
                document.getElementById('memory_rtu').value = 'true';
                document.getElementById('serial_port').value = 'COM1';
            }
            break;
        }
    }

    updateFormButtons();
    updateProgressBar();
}