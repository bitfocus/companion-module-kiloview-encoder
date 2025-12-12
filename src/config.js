import { Regex } from '@companion-module/base'

export function getConfigFields() {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Informations',
			value: 'This modules currently supports Kiloview Encoder devices(E1/E2/E3/G1/G2).',
		},
		{
			type: 'dropdown',
			label: 'Device Model',
			id: 'deviceModel',
			width: 12,
			choices: [
				{ id: 'e1e2', label: 'E1/E2/G1/G2' },
				{ id: 'e3', label: 'E3' },
			],
			default: 'e1e2',
			required: true,
		},
		{
			type: 'textinput',
			label: 'Target IP',
			id: 'address',
			width: 6,
			regex: Regex.IP,
			required: true,
		},
		{
			type: 'number',
			label: 'Polling Interval',
			id: 'interval',
			tooltip: 'Interval in Milliseconds',
			width: 6,
			default: 2000,
			min: 1000,
			required: true,
		},
		{
			type: 'checkbox',
			id: 'useAuth',
			label: 'Use Authentication',
			width: 12,
			default: false,
			tooltip:
				'If API authentication is enabled on E3, you must turn on this option and fill in your username and password, otherwise all interfaces will fail to call.',
			isVisible: (options) => options.deviceModel === 'e3',
		},
		{
			type: 'textinput',
			label: 'User Name',
			id: 'user',
			tooltip: 'User for HTTP Authentication',
			width: 6,
			isVisible: (options) => {
				if (options.deviceModel === 'e3') {
					return options.useAuth === true
				} else {
					return true
				}
			},
		},
		{
			type: 'textinput',
			label: 'Password',
			id: 'password',
			tooltip: 'Password for HTTP Authentication',
			width: 6,
			isVisible: (options) => {
				if (options.deviceModel === 'e3') {
					return options.useAuth === true
				} else {
					return true
				}
			},
		},
		{
			type: 'dropdown',
			id: 'interface',
			label: 'Interface',
			width: 6,
			choices: [
				{ id: 'pip', label: 'MIX' },
				{ id: 'hdmi', label: 'HDMI' },
				{ id: 'sdi', label: 'SDI' },
				{ id: 'uvc', label: 'USB' },
			],
			default: 'hdmi',
			isVisible: (options) => options.deviceModel === 'e3',
		},
	]
}
