module.exports = [
	function v3_0_0(context, props) {
		let changes = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}
		if (props.config) {
			let config = props.config
			if (config.deviceModel === undefined || config.deviceModel === null) {
				config.deviceModel = 'e1e2'
				changes.updatedConfig = config
			}
			if (config.useAuth === undefined || config.useAuth === null) {
				config.useAuth = false
				changes.updatedConfig = config
			}
			if (config.interface === undefined || config.interface === null) {
				config.interface = 'hdmi'
				changes.updatedConfig = config
			}
		}
		return changes
	},
]
