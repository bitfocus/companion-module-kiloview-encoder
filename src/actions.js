/**
 * Gets the list a actions that are available
 *
 * @param {KiloviewEncoderInstance} self - Kiloview Instance
 * @since 1.0.0
 */
export function getActionDefinitions(self) {
	const actions = {
		recording: {
			name: 'Toggle Recording',
			options: [
				{
					type: 'dropdown',
					label: 'Stream',
					id: 'stream',
					choices: self.CHOICES.STREAMS,
					default: self.CHOICES.STREAMS[0].id,
				},
				{
					type: 'dropdown',
					id: 'status',
					label: 'Status',
					tooltip: 'Starts or Stops the current Recording',
					choices: self.CHOICES.START_STOP,
					default: self.CHOICES.START_STOP[0].id,
				},
			],
			callback: async (action) => {
				const { stream, status } = action.options

				let method = ''
				switch (status) {
					case 'stop':
						method = 'stopRecord'
						break

					case 'start':
						method = 'startRecord'
						break

					case 'toggle':
						const cache = self.cache.streams[stream]
						method = cache && cache.isRecording ? 'stopRecord' : 'startRecord'
						break

					default:
						throw new Error(`status of '${status}' not Implemented!`)
				}

				await self.sendRequest(method, { Stream: stream })
				await self.updateAllRecordingStates()
			},
		},
		mainServiceStream: {
			name: 'Main Stream Service',
			options: [
				{
					type: 'dropdown',
					id: 'service',
					label: 'Service',
					tooltip: 'Current service under the Main Stream',
					choices: self.CHOICES.SERVICES.main,
					default: self.CHOICES.SERVICES.main[0].id,
				},
				{
					type: 'dropdown',
					id: 'status',
					label: 'Status',
					tooltip: 'Starts or Stops the current Service',
					choices: self.CHOICES.START_STOP,
					default: self.CHOICES.START_STOP[0].id,
				},
			],
			callback: async (action) => {
				await setStreamStatus(self, self.MAIN_STREAM, action.options)
			},
		},
	}

	if (self.cache.multiStreamMode) {
		actions['subServiceStream'] = {
			name: 'Sub Stream Service',
			options: [
				{
					type: 'dropdown',
					id: 'service',
					label: 'Service',
					choices: self.CHOICES.SERVICES.sub,
					default: self.CHOICES.SERVICES.sub[0].id,
				},
				{
					type: 'dropdown',
					id: 'status',
					label: 'Status',
					tooltip: 'Starts or Stops the current Service',
					choices: self.CHOICES.START_STOP,
					default: self.CHOICES.START_STOP[0].id,
				},
			],
			callback: async (action) => {
				await setStreamStatus(self, self.SUB_STREAM, action.options)
			},
		}
	}

	return actions
}

async function setStreamStatus(self, stream, { service, status }) {
	try {
		// Gets the Cached Service details for Stream ID
		const serv = self.cache.services[stream.id].find((x) => x.id && x.id === service)

		let state = 0
		switch (status) {
			case 'stop':
				state = 0
				break

			case 'start':
				state = 1
				break

			case 'toggle':
				state = serv.enabled ? 0 : 1
				break

			default:
				throw new Error(`status of '${status}' not Implemented!`)
		}

		const params = {
			Stream: stream.id,
			ID: serv.id,
			Type: serv.type,
			[`${serv.type}.enabled`]: state,
		}

		await self.sendRequest('setStreamService', params)
		await self.updateAllServices()
	} catch (error) {
		self.log(`error`, `setStreamStatus Action Callback Error: ${error.message}`)
	}
}
