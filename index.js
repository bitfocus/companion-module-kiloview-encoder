const instance_skel = require('../../instance_skel')
const { initVariables } = require('./variables')
const { initFeedbacks } = require('./feedbacks')
const { initPresets } = require('./presets')
const axios = require('axios')
let debug = () => {}

const INTERVAL = 2000

/**
 * Companion instance class for kiloview encoder.
 *
 * @extends instance_skel
 * @version 1.1.0
 * @since 1.0.0
 * @author ifmx-dev
 */
class instance extends instance_skel {
	mainServices = []
	subServices = []

	streams = [
		{ id: 'main', label: 'Main stream' },
		{ id: 'sub', label: 'Sub stream' },
		{ id: 'main+sub', label: 'Main stream + Sub stream' },
	]

	/**
	 * Create an instance
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system, id, config) {
		super(system, id, config)

		this.actions() // export actions
	}

	/**
	 * Setup the actions.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @access public
	 * @since 1.0.0
	 */
	actions(system) {
		const actions = {}

		actions['startRecording'] = {
			label: 'Start Recording',
			options: [
				{
					type: 'dropdown',
					label: 'Stream',
					id: 'stream',
					choices: this.streams,
					default: this.streams[0].id,
				},
			],
		}

		actions['stopRecording'] = {
			label: 'Stop Recording',
			options: [
				{
					type: 'dropdown',
					label: 'Stream',
					id: 'stream',
					choices: this.streams,
					default: this.streams[0].id,
				},
			],
		}

		actions['startStream'] = {
			label: 'Start Stream',
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
			],
		}

		actions['stopStream'] = {
			label: 'Stop Stream',
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
			],
		}

		this.setActions(actions)
	}

	/**
	 * Executes the provided action.
	 *
	 * @param {Object} action - the action to be executed
	 * @access public
	 * @since 1.0.0
	 */
	async action(action) {
		const opt = action.options

		let params = {}
		let type = null

		try {
			switch (action.action) {
				case 'startRecording':
					params.Stream = opt.stream

					await this.sendRequest('startRecord', params)
					await this.checkState()
					break

				case 'stopRecording':
					params.Stream = opt.stream

					await this.sendRequest('stopRecord', params)
					await this.checkState()
					break

				case 'startStream':
					// get Service Type
					for (let i = 0; i < this.mainServices.length; i++) {
						if (this.mainServices[i].id === opt.service) {
							type = this.mainServices[i].type
							break
						}
					}

					params.Stream = opt.stream
					params.ID = opt.service
					params[type + '.enabled'] = 1

					await this.sendRequest('setStreamService', params)
					await this.checkState()
					break

				case 'stopStream':
					// get Service Type
					for (let i = 0; i < this.mainServices.length; i++) {
						if (this.mainServices[i].id === opt.service) {
							type = this.mainServices[i].type
							break
						}
					}

					params.Stream = opt.stream
					params.ID = opt.service
					params[type + '.enabled'] = 0

					await this.sendRequest('setStreamService', params)
					await this.checkState()
					break
			}
		} catch (e) {
			this.log('error', 'Error running action ' + action.action + ': ' + e.message)
		}
	}

	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @access public
	 * @since 1.0.0
	 */
	config_fields() {
		return [
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This modules currently supports Kiloview Encoder devices.',
			},
			{
				type: 'textinput',
				label: 'Target IP',
				id: 'address',
				width: 6,
				regex: this.REGEX_IP,
				required: true,
			},
			{
				type: 'textinput',
				label: 'Username',
				id: 'username',
				tooltip: 'User for Authentication on HTTP API',
				width: 6,
			},
			{
				type: 'textinput',
				label: 'Password',
				id: 'password',
				tooltip: 'Password for Authentication on HTTP API',
				width: 6,
			},
		]
	}

	/**
	 * Clean up the instance before it is destroyed.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	destroy() {
		if (this.pollTimer !== undefined) {
			clearInterval(this.pollTimer)
		}

		this.state = {}
		this.mainServices = []
		this.subServices = []
		this.streams = []

		debug('destroy', this.id)
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	init() {
		debug = this.debug

		try {
			this.state = {}
			this.state.stream = {}
			this.state.stream.main = {}
			this.state.stream.sub = {}
			this.state.service = {}
			this.state.service.main = []

			this.status(this.STATUS_WARNING, 'Connecting')
			this.initFeedbacks()
			this.initVariables()
			this.initPresets()
		} catch (e) {
			console.error(e)
		}
		this.initConnection()
	}

	/**
	 * INTERNAL: initialize feedbacks.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	initFeedbacks() {
		const feedbacks = initFeedbacks.bind(this)()
		this.setFeedbackDefinitions(feedbacks)
	}

	/**
	 * INTERNAL: initialize presets.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	initPresets() {
		this.setPresetDefinitions(initPresets.bind(this)())
	}

	/**
	 * INTERNAL: initialize variables.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	initVariables() {
		initVariables(this)
	}

	/**
	 * INTERNAL: initalize the connection.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initConnection() {
		this.pollTimer = setInterval(() => this.checkState(), INTERVAL)
		this.updateConfig(this.config)
	}

	async checkState() {
		try {
			let deviceInfo = await this.sendRequest('deviceInfo')

			if (deviceInfo.Result === 200) {
				this.status(this.STATUS_OK, 'Connected')
				this.setVariable('deviceType', deviceInfo.Data.OEM_TYPE)

				let checkFeedbacks = !this.state.stream.main.hasOwnProperty('isRecording')

				// main stream
				const recordingStateMain = await this.sendRequest('getRecordingStatus', { Stream: 'main' })
				if (recordingStateMain && recordingStateMain.Data) {
					let isRecording = recordingStateMain.Data.Status === 'started'

					// Check if we need to Update the feedbacks
					if (this.state.stream.main.isRecording !== isRecording) {
						checkFeedbacks = true
					}

					this.state.stream.main.isRecording = isRecording
					this.setVariable(
						'mainStreamIsRecording',
						isRecording ? 'Main stream is recording' : 'Main stream is not recording'
					)
				}

				// sub stream
				const recordingStateSub = await this.sendRequest('getRecordingStatus', { Stream: 'sub' })
				if (recordingStateSub && recordingStateSub.Data) {
					let isRecording = recordingStateSub.Data.Status === 'started'

					// Check if we need to Update the feedbacks
					if (this.state.stream.sub.isRecording !== isRecording) {
						checkFeedbacks = true
					}

					this.state.stream.sub.isRecording = isRecording
					this.setVariable(
						'subStreamIsRecording',
						isRecording ? 'Sub stream is recording' : 'Sub stream is not recording'
					)
				}

				if (checkFeedbacks) {
					this.checkFeedbacks('recordingState')
				}

				// Stream services state
				const services = await this.sendRequest('getStreamService', { Stream: 'main' })
				if (services && services.Data && services.Data.ServiceStatus) {
					this.mainServices = []
					this.state.service.main = []

					for (let i = 0; i < services.Data.ServiceStatus.length; i++) {
						// RTSP service will always run
						if (services.Data.ServiceStatus[i].Type !== 'Rtsp_server') {
							this.mainServices.push({
								id: services.Data.ServiceStatus[i].ID,
								label: services.Data.ServiceStatus[i].Type,
								type: services.Data.ServiceStatus[i].Type,
							})

							// Read service state
							this.state.service.main.push({
								id: services.Data.ServiceStatus[i].ID,
								enabled: services.Data.ServiceStatus[i].Enable,
							})
						}
					}

					// Reload actions and feedbacks
					this.actions()
					this.initFeedbacks()
					this.checkFeedbacks('serviceState')
				}
			}
		} catch (e) {
			debug('Error: %o', e.message)
			this.status(this.STATUS_ERROR, 'Error connecting to device')
		}
	}

	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.0.0
	 */
	updateConfig(config) {
		if (this.config.address !== config.address) {
			this.status(this.STATUS_WARNING, 'Connecting')
		}

		this.config = config

		this.actions()
		this.initFeedbacks()
		this.initVariables()
	}

	/**
	 * Sends a request to the Kiloview Encoder
	 *
	 * @param name
	 * @param args
	 * @returns {Promise<unknown>}
	 */
	async sendRequest(name, args = {}) {
		try {
			const url = 'http://' + this.config.address + '/api/V1/' + name + '.lua'

			let auth = undefined;
			if (this.config.username && this.config.password) {
				auth = {
					username: this.config.username,
					password: this.config.password
				}
			}

			const response = await axios.request({
				url: url,
				method: 'POST',
				params: args,
				auth: auth
			})

			return response.data;
			
		} catch (error) {
			this.log('error', 'Network error: ' + error.message)
			throw error
		}
	}
}

exports = module.exports = instance
