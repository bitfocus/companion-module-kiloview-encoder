import { combineRgb } from '@companion-module/base'

/**
 * Gets the list a feedbacks that are available
 *
 * @param {KiloviewEncoderInstance} self - Kiloview Instance
 * @since 1.0.0
 */
export function getFeedbackDefinitions(self) {
	const feedbacks = {}
	const recordingOptions = []
	if (self.config.deviceModel !== 'e3') {
		recordingOptions.push({
			id: 'stream',
			label: 'Stream',
			type: 'dropdown',
			choices: self.CHOICES.STREAMS,
			default: self.CHOICES.STREAMS[0]?.id || '',
		})
	}
	feedbacks["recordingState"] = {
		type: 'boolean',
		name: 'Recording state',
		description: 'Is Kiloview recording or not',
		options: recordingOptions,
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(255, 0, 0),
		},
		callback: (feedback) => {
			if (!self.cache || !self.cache.streams) {
				self.log('warn', `Unknown cache for recording feedback: '${JSON.stringify(self.cache || {})}'`)
				return false
			}

			const stream = self.cache.streams[self.config.deviceModel === 'e3'? "main" : feedback.options.stream]
			return stream && stream.isRecording
		},
	}

	feedbacks["mainServiceState"] = {
		type: 'boolean',
		name: 'Main Service state',
		description: 'Is Main service enabled or not',
		options: [
			{
				id: 'service',
				label: 'Service',
				type: 'dropdown',
				choices: self.CHOICES.SERVICES.main,
				default: self.CHOICES.SERVICES.main[0]?.id || '',
			},
		],
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(255, 0, 0),
		},
		callback: (feedback) => {
			const { service } = feedback.options

			return getStreamState(self.cache.services.main, service)
		}
	}

	if (self.cache.multiStreamMode && self.CHOICES.SERVICES.sub.length > 0) {
		feedbacks['subServiceState'] = {
			type: 'boolean',
			name: 'Sub Service state',
			description: 'Is Sub service enabled or not',
			options: [
				{
					id: 'service',
					label: 'Service',
					type: 'dropdown',
					choices: self.CHOICES.SERVICES.sub,
					default: self.CHOICES.SERVICES.sub[0]?.id || '',
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: (feedback) => {
				const { service } = feedback.options

				return getStreamState(self.cache.services.sub, service)
			},
		}
	}

	return feedbacks
}

function getStreamState(services, service) {
	if (!services || services.length <= 0) {
		return false
	}

	for (const serv of services) {
		if (serv.id === service && serv.enabled) {
			return true
		}
	}

	return false
}
