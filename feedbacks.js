exports.initFeedbacks = function () {
	const feedbacks = {}

	feedbacks['recordingState'] = {
		label: 'Recording state',
		description: 'Is Kiloview recording or not',
		options: [
			{
				type: 'dropdown',
				label: 'Stream',
				id: 'stream',
				choices: this.streams,
				default: this.streams[0].id,
			},
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: this.rgb(255, 255, 255),
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: this.rgb(255, 0, 0),
			},
		],
		callback: ({ options }, bank) => {
			if (this.state.stream[options.stream].isRecording) {
				return { color: options.fg, bgcolor: options.bg }
			}
		},
	}

	feedbacks['serviceState'] = {
		label: 'Service state',
		description: 'Is service enabled or not',
		options: [
			{
				type: 'dropdown',
				label: 'Stream',
				id: 'stream',
				choices: [this.streams[0]],
				default: this.streams[0].id,
			},
			{
				type: 'dropdown',
				label: 'Service',
				id: 'service',
				choices: this.mainServices,
			},
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: this.rgb(255, 255, 255),
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: this.rgb(255, 0, 0),
			},
		],
		callback: ({ options }, bank) => {
			for (let i = 0; i < this.state.service.main.length; i++) {
				if (this.state.service.main[i].id === options.service && this.state.service.main[i].enabled) {
					return { color: options.fg, bgcolor: options.bg }
				}
			}
		},
	}

	return feedbacks
}
