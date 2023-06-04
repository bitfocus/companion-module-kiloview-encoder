import { combineRgb } from '@companion-module/base'
export function getPresetDefinitions(self) {
	const presets = {
		start_recording_preset: {
			category: 'Recording',
			label: 'Start Recording',
			bank: {
				style: 'text',
				text: 'Start REC',
				size: '18',
				color: '16777215',
				bgcolor: combineRgb(0, 0, 0),
			},
			actions: [
				{
					action: 'startRecording',
					options: {
						stream: 'main',
					},
				},
			],
			feedbacks: [
				{
					type: 'recordingState',
					options: {
						stream: 'main',
						bg: combineRgb(255, 0, 0),
						fg: combineRgb(0, 0, 0),
					},
				},
			],
		},
		stop_recording_preset: {
			category: 'Recording',
			label: 'Stop Recording',
			bank: {
				style: 'text',
				text: 'Stop REC',
				size: '18',
				color: '16777215',
				bgcolor: combineRgb(0, 0, 0),
			},
			actions: [
				{
					action: 'stopRecording',
					options: {
						stream: 'main',
					},
				},
			],
			feedbacks: [
				{
					type: 'recordingState',
					options: {
						stream: 'main',
						bg: combineRgb(255, 0, 0),
						fg: combineRgb(0, 0, 0),
					},
				},
			],
		},
	}

	return presets
}
