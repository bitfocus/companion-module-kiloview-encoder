import { Regex } from '@companion-module/base'

export function getConfigFields() {
	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Informations',
			value: 'This modules currently supports Kiloview Encoder devices.',
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
			type: 'textinput',
			label: 'User Name',
			id: 'user',
			tooltip: 'User for HTTP Authentication',
			width: 6,
		},
		{
			type: 'textinput',
			label: 'Password',
			id: 'password',
			tooltip: 'Password for HTTP Authentication',
			width: 6,
		},
	]
}
