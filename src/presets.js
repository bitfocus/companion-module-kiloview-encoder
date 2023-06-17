import { combineRgb } from '@companion-module/base'
export function getPresetDefinitions(self) {
	const presets = {
		start_recording_preset: {
			type: 'button',
			category: 'Recording',
			name: 'Toggle Recording',
			style: {
				text: 'Start REC',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			options: {},
			steps: [
				{
					up: [],
					down: [
						{
							actionId: 'recording',
							options: {
								stream: 'main',
								status: 'toggle',
							},
						},
					],
				},
			],
			feedbacks: [
				{
					feedbackId: 'recordingState',
					options: {
						stream: 'main',
					},
					style: {
						text: 'Stop REC',
						size: '18',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(255, 0, 0),
					},
				},
			],
		},
	}

	return presets
}
