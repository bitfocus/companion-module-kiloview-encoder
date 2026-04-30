export function initVariables(self) {
	const variables = [
		{
			variableId: 'deviceType',
			name: 'Device Type',
		},
		{
			variableId: 'mainStreamIsRecording',
			name: 'Main Stream is Recording',
		},
	]

	if (self.config.deviceModel === 'e3') {
		variables.push(
			...buildEncodeVariableDefinitions('main', 'Main'),
			...buildEncodeVariableDefinitions('sub', 'Sub'),
			...buildVideoSourceVariableDefinitions(),
			...buildAudioInputVariableDefinitions(),
			...buildAudioEncodeVariableDefinitions(4),
		)
	} else {
		variables.push(
			{
				variableId: 'subStreamIsRecording',
				name: 'Sub Stream is Recording',
			},
			{
				variableId: 'combinedStreamIsRecording',
				name: 'Combined Stream is Recording',
			},
		)
	}

	self.setVariableDefinitions(variables)
	self.setVariableValues(Object.fromEntries(variables.map((variable) => [variable.variableId, 'N/A'])))
}

function buildEncodeVariableDefinitions(streamId, streamLabel) {
	const prefix = `${streamId}StreamEncode`
	return [
		{
			variableId: `${prefix}Enabled`,
			name: `${streamLabel} Stream Encode Enabled`,
		},
		{
			variableId: `${prefix}Codec`,
			name: `${streamLabel} Stream Encode Codec`,
		},
		{
			variableId: `${prefix}Profile`,
			name: `${streamLabel} Stream Encode Profile`,
		},
		{
			variableId: `${prefix}Resolution`,
			name: `${streamLabel} Stream Encode Resolution`,
		},
		{
			variableId: `${prefix}Width`,
			name: `${streamLabel} Stream Encode Width`,
		},
		{
			variableId: `${prefix}Height`,
			name: `${streamLabel} Stream Encode Height`,
		},
		{
			variableId: `${prefix}FrameRate`,
			name: `${streamLabel} Stream Encode Frame Rate`,
		},
		{
			variableId: `${prefix}RealFrameRate`,
			name: `${streamLabel} Stream Encode Real Frame Rate`,
		},
		{
			variableId: `${prefix}BitrateMode`,
			name: `${streamLabel} Stream Encode Bitrate Mode`,
		},
		{
			variableId: `${prefix}BitrateKbps`,
			name: `${streamLabel} Stream Encode Bitrate kb/s`,
		},
		{
			variableId: `${prefix}Gop`,
			name: `${streamLabel} Stream Encode GOP`,
		},
		{
			variableId: `${prefix}SourceResolution`,
			name: `${streamLabel} Stream Source Resolution`,
		},
		{
			variableId: `${prefix}SourceWidth`,
			name: `${streamLabel} Stream Source Width`,
		},
		{
			variableId: `${prefix}SourceHeight`,
			name: `${streamLabel} Stream Source Height`,
		},
		{
			variableId: `${prefix}DeinterlaceMode`,
			name: `${streamLabel} Stream Deinterlace Mode`,
		},
	]
}

function buildVideoSourceVariableDefinitions() {
	return [
		{
			variableId: 'videoSourceSignal',
			name: 'Video Source Signal',
		},
		{
			variableId: 'videoSourceFormat',
			name: 'Video Source Format',
		},
		{
			variableId: 'videoSourceResolution',
			name: 'Video Source Resolution',
		},
		{
			variableId: 'videoSourceWidth',
			name: 'Video Source Width',
		},
		{
			variableId: 'videoSourceHeight',
			name: 'Video Source Height',
		},
		{
			variableId: 'videoSourceFrameRate',
			name: 'Video Source Frame Rate',
		},
		{
			variableId: 'videoSourceType',
			name: 'Video Source Type',
		},
		{
			variableId: 'videoSourceInterface',
			name: 'Video Source Interface',
		},
		{
			variableId: 'videoSourceInterlaced',
			name: 'Video Source Interlaced',
		},
		{
			variableId: 'videoSourceMaxResolution',
			name: 'Video Source Max Resolution',
		},
		{
			variableId: 'videoSourceMaxFrameRate',
			name: 'Video Source Max Frame Rate',
		},
		{
			variableId: 'videoSourceColorRange',
			name: 'Video Source Color Range',
		},
		{
			variableId: 'videoSourceIs4k',
			name: 'Video Source is 4K',
		},
	]
}

function buildAudioInputVariableDefinitions() {
	return [
		{
			variableId: 'audioInputSource',
			name: 'Audio Input Source',
		},
		{
			variableId: 'audioInputType',
			name: 'Audio Input Type',
		},
		{
			variableId: 'audioInputSampling',
			name: 'Audio Input Sampling',
		},
		{
			variableId: 'audioInputChannels',
			name: 'Audio Input Channels',
		},
		{
			variableId: 'audioInputGain',
			name: 'Audio Input Gain',
		},
		{
			variableId: 'audioInputMuted',
			name: 'Audio Input Muted',
		},
	]
}

function buildAudioEncodeVariableDefinitions(maxAudioEncodes) {
	const variables = [
		{
			variableId: 'audioEncodeCount',
			name: 'Audio Encode Count',
		},
		{
			variableId: 'audioEncodeSummary',
			name: 'Audio Encode Summary',
		},
	]

	for (let index = 1; index <= maxAudioEncodes; index++) {
		variables.push(
			{
				variableId: `audioEncode${index}Id`,
				name: `Audio Encode ${index} ID`,
			},
			{
				variableId: `audioEncode${index}Name`,
				name: `Audio Encode ${index} Name`,
			},
			{
				variableId: `audioEncode${index}Codec`,
				name: `Audio Encode ${index} Codec`,
			},
			{
				variableId: `audioEncode${index}BitrateBps`,
				name: `Audio Encode ${index} Bitrate b/s`,
			},
			{
				variableId: `audioEncode${index}Sampling`,
				name: `Audio Encode ${index} Sampling`,
			},
			{
				variableId: `audioEncode${index}Channels`,
				name: `Audio Encode ${index} Channels`,
			},
			{
				variableId: `audioEncode${index}Source`,
				name: `Audio Encode ${index} Source`,
			},
			{
				variableId: `audioEncode${index}TrackCount`,
				name: `Audio Encode ${index} Track Count`,
			},
		)
	}

	return variables
}
