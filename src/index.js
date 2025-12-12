import { InstanceBase, InstanceStatus, runEntrypoint } from '@companion-module/base'
import { initVariables } from './variables.js'
import { getFeedbackDefinitions } from './feedbacks.js'
import { getPresetDefinitions } from './presets.js'
import { getConfigFields } from './config.js'
import { getActionDefinitions } from './actions.js'
import { buildChoices } from './choices.js'
import { arraysEqual, objectsEqual } from './helpers.js'
import { E3Handler } from './e3-handler.js'
import UpgradeScripts from './upgrades.js'
import axios from 'axios'

/**
 * Companion instance class for kiloview encoder.
 *
 * @extends InstanceBase
 * @version 1.1.1
 * @since 1.0.0
 * @author ifmx-dev
 */
class KiloviewEncoderInstance extends InstanceBase {
	/**
	 * Create an instance
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(internal) {
		super(internal)

		this.MAIN_STREAM = {
			id: 'main',
			label: 'Main stream',
		}
		this.SUB_STREAM = {
			id: 'sub',
			label: 'Sub stream',
		}
		this.COMBINED_STREAM = {
			id: 'main+sub',
			label: 'Main stream + Sub stream',
		}
		this.SERVICES = {
			main: [],
			sub: [],
		}
		this.e3Handler = null
	}

	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @access public
	 * @since 1.0.0
	 */
	getConfigFields() {
		return getConfigFields()
	}

	/**
	 * Clean up the instance before it is destroyed.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	async destroy() {
		if (this.pollTimer) {
			clearInterval(this.pollTimer)
		}
		this.cache = {}
		this.e3Handler = null
		this.updateStatus(InstanceStatus.Disconnected)
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	async init(config) {
		await this.configUpdated(config)
	}

	async configUpdated(config) {
		this.config = config

		try {
			this.cache = {
				streams: {
					main: {},
					sub: {},
					'main+sub': {},
				},
				services: {
					main: [],
					sub: [],
				},
				multiStreamMode: false,
			}

			if (this.pollTimer) {
				clearInterval(this.pollTimer)
			}

			if (!config.address || config.address === '') {
				this.updateStatus(InstanceStatus.BadConfig, 'IP needs to be configured')
				return
			}

			if (config.deviceModel === 'e3') {
				this.e3Handler = new E3Handler(this)
				// Try login, if successful, save the token and bring it with the request.
				if (config.user && config.password) {
					await this.e3Handler.login()
				}
				this.cache.multiStreamMode = true
			} else {
				this.e3Handler = null
			}

			this.updateStatus(InstanceStatus.Connecting)

			this.setPresetDefinitions(getPresetDefinitions(this))

			initVariables(this)

			this.initConnection()
		} catch (error) {
			this.log('error', 'Init Failed: ' + error.message)
			this.updateStatus(InstanceStatus.UnknownError, 'Error initializing module')
		}
	}

	/**
	 * INTERNAL: initalize the connection.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	async initConnection() {
		// Check device connection before setting up the poller, else it will spam the device
		let isOnline = false
		do {
			isOnline = await this.checkState()
			if (!isOnline) {
				this.updateStatus(InstanceStatus.ConnectionFailure, 'Unable to Connect to Device')
				await new Promise((r) => setTimeout(r, 3000))
			}
		} while (!isOnline)

		await new Promise((r) => setTimeout(r, 2000))

		this.pollTimer = setInterval(async () => await this.checkState(), this.config.interval)
	}

	/**
	 * Updates the cache with all the required States of the device
	 *
	 * @access private
	 * @since 2.0.0
	 * @returns {Promise<boolean>} Flag if the checks has run successfully
	 */
	async checkState() {
		try {
			if (this.config.deviceModel === 'e3') {
				let deviceInfo = await this.e3Handler.getDeviceInfo()
				if (deviceInfo.result !== 'ok') {
					this.log('error', `Unable to Connect to device`)
					this.updateStatus(InstanceStatus.ConnectionFailure, `Connection Failed`)
					return false
				}
				this.updateStatus(InstanceStatus.Ok, 'Connected to E3')
				this.setVariableValues({
					deviceType: deviceInfo.data?.product || 'E3',
				})

				// open the interface
				const encoderStatus = await this.e3Handler.checkEncoderStatus()
				if (!encoderStatus) {
					this.log('info', `${this.config.interface} is disabled, enabling...`)
					await this.e3Handler.enableEncoder()
				} else {
					this.log('info', `${this.config.interface} is already enabled`)
				}

				await this.updateE3Services()
				await this.updateE3RecordingState()
				return true
			}

			let deviceInfo = await this.sendRequest('deviceInfo')

			if (deviceInfo.Result !== 200) {
				this.log('error', `Unable to Connect to device: ${deviceInfo.Status}`)
				this.updateStatus(InstanceStatus.ConnectionFailure, `Unknown Response from Device`)
				return false
			}

			this.updateStatus(InstanceStatus.Ok, 'Connected')
			this.setVariableValues({
				deviceType: deviceInfo.Data.OEM_TYPE,
			})

			await this.updateMiltiStreamMode()
			await this.updateAllServices()
			await this.updateAllRecordingStates()

			return true
		} catch (error) {
			this.log('debug', `Check status error: ${error.message}`)
			this.updateStatus(InstanceStatus.UnknownError, 'Error connecting to device')
		}
	}

	/**
	 * Updates the Cache with the Device's Stream Mode
	 *
	 * @access private
	 * @since 2.0.0
	 * @returns {Promise<void>}
	 */
	async updateMiltiStreamMode() {
		const streamModeData = await this.sendRequest('getStreamingMode')
		if (streamModeData && streamModeData.Result === 200 && streamModeData.Data) {
			if (streamModeData.Data.Mode && streamModeData.Data.Mode) {
				this.cache.multiStreamMode = streamModeData.Data.Mode !== 'main'
			}
		}
	}

	/**
	 * Updates the Cache with the Device's Recording Statuses
	 *
	 * @access private
	 * @since 2.0.0
	 * @returns {Promise<void>}
	 */
	async updateAllRecordingStates() {
		const recordingStateJobs = [this.getRecodingState(this.MAIN_STREAM.id)]
		if (this.cache.multiStreamMode) {
			recordingStateJobs.push([
				this.getRecodingState(this.SUB_STREAM.id),
				this.getRecodingState(this.COMBINED_STREAM.id),
			])
		}
		// Gets the Main and Sub Stream state
		const [mainRecordingState, subRecordingState, combinedRecordingState] = await Promise.all(recordingStateJobs)

		if (mainRecordingState || subRecordingState || combinedRecordingState) {
			this.checkFeedbacks('recordingState')
		}
	}

	/**
	 * Updates the Cache with the Device's Services per Stream
	 *
	 * @access private
	 * @since 2.0.0
	 * @returns {Promise<void>}
	 */
	async updateAllServices() {
		// Stream services state
		const streamServiceJobs = [this.getStreamServices(this.MAIN_STREAM.id)]
		if (this.cache.multiStreamMode) {
			streamServiceJobs.push(this.getStreamServices(this.SUB_STREAM.id))
		}
		const [mainServices, subServices] = await Promise.all(streamServiceJobs)

		// Added Compare method to not spam the SetAction and SetFeedback as its costly methods
		const choices = buildChoices(this)
		if (this.hasChoicesChanged(choices)) {
			this.log('debug', `CHOICES has been Updated`)

			this.CHOICES = choices
			this.setActionDefinitions(getActionDefinitions(this))
			this.setFeedbackDefinitions(getFeedbackDefinitions(this))
		}

		if (mainServices || subServices) {
			this.checkFeedbacks('mainServiceState', 'subServiceState')
		}
	}

	/**
	 * Gets the Steam's Recording State.
	 *
	 * @param {'main'|'sub'|'main+sub'} streamId - the type of stream
	 * @access private
	 * @since 2.0.0
	 * @returns {Promise<boolean>} Flag if feedback should be updated
	 */
	async getRecodingState(streamId) {
		try {
			let updateFeedback = false
			let state = this.cache.streams[streamId]

			// Check if the current Stream State is null
			if (!state) {
				state = {
					isRecording: null,
				}
				this.cache.streams[streamId] = state
			} else if (!Object.prototype.hasOwnProperty.call(state, 'isRecording')) {
				// Set property on state object
				state.isRecording = undefined
			}

			const recordingStatus = await this.sendRequest('getRecordingStatus', { Stream: streamId })
			if (recordingStatus.Result !== 200 || !recordingStatus.Data) {
				this.log('error', `Get Recording Status has invalid response: ${JSON.stringify(recordingStatus)}`)
				return updateFeedback
			}

			let isRecording = recordingStatus.Data.Status.toLowerCase() === 'started'

			// Check if we need to Update the feedbacks
			if (state.isRecording !== isRecording) {
				updateFeedback = true
			}

			// Update current state with recording status
			state.isRecording = isRecording

			this.setVariableValues({
				[`${streamId}StreamIsRecording`]: isRecording
					? `${streamId} stream is recording`
					: `${streamId} stream is not recording`,
			})

			return updateFeedback
		} catch (error) {
			this.log('error', `Error in 'getRecodingState': ${error.message}`)
			throw error
		}
	}

	/**
	 * Gets the Steam's Services that are available.
	 *
	 * @param {'main'|'sub'|'main+sub'} streamId - the type of stream
	 * @access private
	 * @since 2.0.0
	 * @returns {Promise<boolean>}
	 */
	async getStreamServices(streamId) {
		try {
			const services = []
			const cache = []

			const serviceResponse = await this.sendRequest('getStreamService', { Stream: streamId })
			if (serviceResponse.Result !== 200 || !serviceResponse.Data) {
				this.log('error', `Get Stream Service has invalid response: ${JSON.stringify(serviceResponse)}`)
				return false
			}

			// No Services currently available as stream is disabled
			if (!serviceResponse.Data.ServiceStatus || serviceResponse.Data.ServiceStatus.length < 1) {
				return false
			}

			for (const serv of serviceResponse.Data.ServiceStatus) {
				// RTSP service will always run
				if (serv.Type === 'Rtsp_server') {
					continue
				}

				// Updates the available services to be used in the action selections
				services.push({
					id: serv.ID,
					label: serv.Type,
					type: serv.Type,
				})

				// Updates the current cache of the states
				cache.push({
					id: serv.ID,
					label: serv.Type,
					type: serv.Type,
					enabled: serv.Enable,
					status: serv.Status,
					url: serv.URL,
				})
			}

			this.SERVICES[streamId] = services
			this.cache.services[streamId] = cache

			return true
		} catch (error) {
			this.log('error', `Error in 'getStreamServices': ${error.message}`)
			throw error
		}
	}

	hasChoicesChanged(choices) {
		if (!this.CHOICES) {
			return true
		}

		if (!arraysEqual(this.CHOICES.STREAMS, choices.STREAMS)) {
			this.log('debug', `STREAMS changed`)
			return true
		}

		if (!objectsEqual(this.CHOICES.SERVICES, choices.SERVICES)) {
			this.log('debug', `SERVICES changed`)
			return true
		}

		if (!arraysEqual(this.CHOICES.SERVICES.main, choices.SERVICES.main)) {
			this.log('debug', `SERVICES.main changed`)
			return true
		}

		return false
	}

	/**
	 * Sends a request to the Kiloview Encoder
	 *
	 * @param name
	 * @param parameters
	 * @access public
	 * @returns {Promise<any>}
	 */
	async sendRequest(name, parameters = {}) {
		const url = `http://${this.config.address}/api/V1/${name}.lua`
		const request = {
			url: url,
			params: parameters,
			method: 'GET',
		}

		// Check if user wants to add auth to the requests
		if (this.config.user && this.config.password) {
			request.auth = {
				username: this.config.user,
				password: this.config.password,
			}
		}

		// Simple check to see if request must be a POST request
		if (name.startsWith('set')) {
			request.method = 'POST'
		}

		const response = await axios.request(request)

		if (response.status < 200 || response.status > 299) {
			this.log('error', `Error response for '${name}': ${JSON.stringify(response)}`)
			throw new Error(`Error Response for '${name}' with error '${response.status}:${response.statusText}'`)
		}

		return response.data
	}

	/**
	 * E3: Update the recording status (E3 only allows recording of the main stream)
	 *
	 * @access private
	 * @since 3.0.0
	 * @returns {Promise<void>}
	 */
	async updateE3RecordingState() {
		try {
			const status = await this.e3Handler.getRecordingStatus()
			this.cache.streams.main.isRecording = status
			this.setVariableValues({
				mainStreamIsRecording: status ? 'main stream is recording' : 'main stream is not recording',
			})

			this.checkFeedbacks('recordingState')
		} catch (error) {
			this.log('error', `update recording state error: ${error.message}`)
		}
	}

	/**
	 * E3：Update stream info
	 *
	 * @access private
	 * @since 3.0.0
	 * @returns {Promise<void>}
	 */
	async updateE3Services() {
		try {
			const streamList = await this.e3Handler.getStreamList()
			const mainServices = []
			const subServices = []
			const mainCache = []
			const subCache = []
			for (const stream of streamList.data) {
				// show lable：stream_name(stream_type)
				const label = stream.name ? `${stream.name} (${stream.type})` : stream.type
				const serviceItem = {
					id: stream.id,
					label: label,
					type: stream.type,
				}
				const cacheItem = {
					id: stream.id,
					label: label,
					type: stream.type,
					bindVideo: stream.bindVideo || 'main',
					enabled: stream.enable || false,
					status: stream.status || 'unknown',
					url: stream.addressUrl || '',
				}

				// Classified by bindVideo
				if (cacheItem.bindVideo === 'main') {
					mainServices.push(serviceItem)
					mainCache.push(cacheItem)
				} else if (cacheItem.bindVideo === 'sub') {
					subServices.push(serviceItem)
					subCache.push(cacheItem)
				}
			}

			// update SERVICES and cache
			this.SERVICES[this.MAIN_STREAM.id] = mainServices
			this.SERVICES[this.SUB_STREAM.id] = subServices
			this.cache.services[this.MAIN_STREAM.id] = mainCache
			this.cache.services[this.SUB_STREAM.id] = subCache

			// update choices and feedbacks
			const choices = buildChoices(this)
			if (this.hasChoicesChanged(choices)) {
				this.log('debug', `CHOICES has been Updated`)
				this.CHOICES = choices
				this.setActionDefinitions(getActionDefinitions(this))
				this.setFeedbackDefinitions(getFeedbackDefinitions(this))
			}
			this.checkFeedbacks('mainServiceState', 'subServiceState')
		} catch (error) {
			this.log('error', `update services error: ${error.message}`)
		}
	}
}

runEntrypoint(KiloviewEncoderInstance, UpgradeScripts)
