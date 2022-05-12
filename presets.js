module.exports.initPresets = function (instance) {
	const presets = [
		{
			category: 'Recording',
			label: 'Start Recording',
			bank: {
				style: 'text',
				text: 'Start REC',
				size: '18',
				color: '16777215',
				bgcolor: this.rgb(0, 0, 0),
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
						bg: this.rgb(255, 0, 0),
						fg: this.rgb(0, 0, 0),
					},
				},
			],
		},
		{
			category: 'Recording',
			label: 'Stop Recording',
			bank: {
				style: 'text',
				text: 'Stop REC',
				size: '18',
				color: '16777215',
				bgcolor: this.rgb(0, 0, 0),
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
						bg: this.rgb(255, 0, 0),
						fg: this.rgb(0, 0, 0),
					},
				},
			],
		},
	]

	return presets
}
