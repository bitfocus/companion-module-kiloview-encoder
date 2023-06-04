import { combineRgb } from '@companion-module/base'

/**
 * Gets the list a feedbacks that are available
 *
 * @param {KiloviewEncoderInstance} self - Kiloview Instance
 * @since 1.0.0
 */
export function getFeedbackDefinitions(self) {
	const feedbacks = {
		recordingState: {
			type: 'boolean',
			name: 'Recording state',
			description: 'Is Kiloview recording or not',
			options: [
				{
					id: 'stream',
					label: 'Stream',
					type: 'dropdown',
					choices: self.CHOICES.STREAMS,
					default: self.CHOICES.STREAMS[0].id,
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: (feedback) => {
				console.log(`Recording Callback`)
				if (!self.cache || !self.cache.streams) {
					console.log(`Unknown state for recording feedback: '${JSON.stringify(self.cache || {})}'`)
					return false
				}
				const stream = self.cache.streams[feedback.options.stream]
				console.log(`Recording feedback: '${JSON.stringify(stream)}'`)
				if (stream && stream.isRecording) {
					return true
				}
				return false
			},
		},
		mainServiceState: {
			type: 'boolean',
			name: 'Main Service state',
			description: 'Is Main service enabled or not',
			options: [
				{
					id: 'service',
					label: 'Service',
					type: 'dropdown',
					choices: self.CHOICES.SERVICES.main,
					default: self.CHOICES.SERVICES.main[0].id,
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: (feedback) => {
				const { service } = feedback.options

				console.log(`Main Service Stream: ${service}`)
				return getStreamState(self.cache.services.main, service)
			},
		},
	}

	if (self.cache.multiStreamMode) {
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
					default: self.CHOICES.SERVICES.sub[0].id,
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
	console.log(`Feedback-Services: ${JSON.stringify(services)}`)
	console.log(`Feedback-Service: ${JSON.stringify(service)}`)
	if (!services || services.length <= 0) {
		return false
	}

	console.log(`Starting Loop`)
	for (const serv of services) {
		if (serv.id === service && serv.enabled) {
			console.log(`State = TRUE`)
			return true
		}
	}

	console.log(`State = FALSE`)
	return false
}
