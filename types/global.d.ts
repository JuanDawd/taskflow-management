// Augment the WindowEventMap to include our custom event
declare global {
	interface WindowEventMap {
		'websocket-message': MessageEvent
	}
}

export {}
