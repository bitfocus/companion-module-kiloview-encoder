module.exports.initVariables = function (instance) {
	instance.setVariableDefinitions([
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
	])
	instance.setVariable('deviceType', 'N/A')
	instance.setVariable('mainStreamIsRecording', 'N/A')
	instance.setVariable('subStreamIsRecording', 'N/A')
}
