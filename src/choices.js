export function buildChoices(self) {
	return {
		START_STOP: buildStartStopChoices(),
		STREAMS: buildStreamChoices(self),
		SERVICES: buildServiceChoices(self),
	}
}

function buildStartStopChoices() {
	return [
		{
			id: 'start',
			label: 'Start',
		},
		{
			id: 'stop',
			label: 'Stop',
		},
		{
			id: 'toggle',
			label: 'Toggle',
		},
	]
}

function buildStreamChoices(self) {
	const streamChoices = [self.MAIN_STREAM]
	if (self.cache.multiStreamMode) {
		streamChoices.push(self.SUB_STREAM)
		streamChoices.push(self.COMBINED_STREAM)
	}
	return streamChoices
}

function buildServiceChoices(self) {
	const services = {
		main: self.SERVICES.main,
	}
	if (self.cache.multiStreamMode) {
		services['sub'] = self.SERVICES.sub
	}

	return services
}
