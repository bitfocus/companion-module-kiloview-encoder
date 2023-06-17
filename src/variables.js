export function initVariables(self) {
	const variables = [
		{
			label: 'Device Type',
			name: 'deviceType',
		},
		{
			label: 'Main Stream is Reording',
			name: 'mainStreamIsRecording',
		},
		{
			label: 'Sub Stream is Reording',
			name: 'subStreamIsRecording',
		},
		{
			label: 'Combined Stream is Reording',
			name: 'combinedStreamIsRecording',
		},
	]
	self.setVariableDefinitions(variables)
	self.setVariableValues({
		deviceType: 'N/A',
		mainStreamIsRecording: 'N/A',
		subStreamIsRecording: 'N/A',
		combinedStreamIsRecording: 'N/A',
	})
}
