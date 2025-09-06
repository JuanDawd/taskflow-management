export class WebSocketManager {
	private ws: WebSocket | null = null
	private url: string
	private reconnectAttempts = 0
	private maxReconnectAttempts = 5
	private reconnectDelay = 1000
	private listeners: Map<string, Set<Function>> = new Map()
	private isConnected = false

	constructor(url: string) {
		this.url = url
		this.connect()
	}

	private connect() {
		try {
			this.ws = new WebSocket(this.url)

			this.ws.onopen = () => {
				this.isConnected = true
				this.reconnectAttempts = 0
				console.log('WebSocket connected')
				this.emit('connected', null)
			}

			this.ws.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data)
					this.emit(data.type, data.payload)
				} catch (error) {
					console.error('Error parsing WebSocket message:', error)
				}
			}

			this.ws.onclose = () => {
				this.isConnected = false
				console.log('WebSocket disconnected')
				this.emit('disconnected', null)
				this.handleReconnect()
			}

			this.ws.onerror = (error) => {
				console.error('WebSocket error:', error)
				this.emit('error', error)
			}
		} catch (error) {
			console.error('Error creating WebSocket:', error)
			this.handleReconnect()
		}
	}

	private handleReconnect() {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++
			setTimeout(() => {
				console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
				this.connect()
			}, this.reconnectDelay * this.reconnectAttempts)
		}
	}

	public send(type: string, payload: any) {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify({ type, payload }))
		} else {
			console.warn('WebSocket is not connected')
		}
	}

	public on(event: string, callback: Function) {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set())
		}
		this.listeners.get(event)!.add(callback)
	}

	public off(event: string, callback: Function) {
		const eventListeners = this.listeners.get(event)
		if (eventListeners) {
			eventListeners.delete(callback)
		}
	}

	private emit(event: string, data: any) {
		const eventListeners = this.listeners.get(event)
		if (eventListeners) {
			eventListeners.forEach((callback) => callback(data))
		}
	}

	public disconnect() {
		if (this.ws) {
			this.ws.close()
			this.ws = null
		}
	}

	public getConnectionStatus() {
		return this.isConnected
	}
}
