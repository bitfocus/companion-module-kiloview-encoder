import axios from 'axios'

/**
 * E3 Device Specific Processor
 * @since 3.0.0
 */
export class E3Handler {
	constructor(instance) {
		this.instance = instance
		this.config = instance.config
		this.authToken = null  // authorization token
	}

	getInterface() {
		return this.config.interface || 'hdmi'
	}

	async sendRequest(endpoint, method = 'GET', data = {}) {
		const url = `http://${this.config.address}${endpoint}`
		
		const request = {
			url: url,
			method: method,
		}

		if (method === 'GET') {
			request.params = data
		} else {
			request.data = data
		}

		// If authToken is not null, add it to the headers
		if (this.authToken) {
			request.headers = {
				'Authorization': this.authToken
			}
		}

		try {
			const response = await axios.request(request)
			//this.instance.log('info', `Request(${endpoint}): ${JSON.stringify(response.data, null, 2)}`)
			if (response.status < 200 || response.status > 299) {
				throw new Error(`API Error: ${response.status}`)
			}
			if (!('result' in response.data)) {
				return {result: 'ok', data: response.data}
			} else {
				return response.data
			}
		} catch (error) {
			if (error.response && error.response.status === 401) {
				this.instance.log('warn', `Received 401 on ${endpoint}, unauthorized!`)
				this.instance.updateStatus(this.instance.constructor.InstanceStatus.AuthenticationFailure, 'Unauthorized')
			}
			this.instance.log('error', `Request Error (${endpoint}): ${error.message}`)
			// throw error
			return {result: 'error', msg: error.message}
		}
	}

	/**
	 * login and get authorization token
	 */
	async login() {
		if (!this.config.user || !this.config.password) {
			throw new Error('Username and password are required for login')
		}
		try {
			const response = await this.sendRequest(
				'/api/systemctrl/users/login',
				'POST',
				{
					username: this.config.user,
					password: this.config.password,
				}
			)

			if (response.result === 'ok' && response.data && response.data.token) {
				this.authToken = response.data.token
				this.instance.log('info', `Login successful, user: ${response.data.alias}`)
				return true
			} else {
				this.instance.log('warn', `Login failed: ${response.msg || 'Unknown error'}`)
				return false
			}
		} catch (error) {
			this.instance.log('error', `Login error: ${error.message}`)
			throw error
		}
	}

	/**
	 * check encoder status
	 */
	async checkEncoderStatus() {
		try {
			const response = await this.sendRequest('/api/codec/vin/active_interface', 'GET')
			if (response.result === 'ok') {
				const iface = this.getInterface()
				return response.data[iface] || false
			}
		} catch (error) {
			this.instance.log('error', `Check encoder status error: ${error.message}`)
		}
		return false
	}

	/**
	* enable encoder
	*/
	async enableEncoder() {
		const iface = this.getInterface()
		try {
			const response = await this.sendRequest(
				`/api/codec/${iface}/venc/enable`,
				'POST',
				{ enable: true }
			)
			if (response.result === 'ok') {
				this.instance.log('info', `${iface} enabled`)
				return true
			} else {
				this.instance.log('warn', `Encoder enable failed: ${response.msg || 'unknown error'}`)
				return false
			}
		} catch (error) {
			this.instance.log('error', `Enable encoder error: ${error.message}`)
			return false
		}
	}

	/**
	 * get devie version info
	 */
	async getDeviceInfo() {
		const response = await this.sendRequest('/api/systemctrl/system/getSystemInfo', 'GET', {version: true})
		return response
	}

	/**
	 * get recording status
	 */
	async getRecordingStatus() {
		const iface = this.getInterface()		
		const response = await this.sendRequest(`/api/record/${iface}/get_recording_status`, 'GET')
		return response.data?.status
	}

	/**
	 * enable recording
	 */
	async enableRecording(enabled) {
		const iface = this.getInterface()
		const response = await this.sendRequest(
			`/api/record/${iface}/recording`,
			'POST',
			{ start: enabled }
		)
		return response
	}

	/**
	 * get stream list
	 */
	async getStreamList() {
		const iface = this.getInterface()
		const response = await this.sendRequest(`/api/streamer/${iface}/stream/list`, 'GET')
		return response
	}

	/**
	 * enable stream
	 */
	async setStreamService(streamId, enabled) {
		const iface = this.getInterface()
		const response = await this.sendRequest(
			`/api/streamer/${iface}/stream/enable`,
			'POST',
			{
				id: streamId,
				enable: enabled
			}
		)
		return response
	}
}
