import express from "express"
import { createServer } from "http"
import { WebSocketServer } from "ws"
import { createRequestHandler } from "@remix-run/express"

const mode = "production"

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

const wsClients = new Set()

wss.on("connection", (ws) => {
	wsClients.add(ws)
	console.log("client connected: ", wsClients.size)
})

wss.on("close", (ws) => {
	wsClients.delete(ws)
	console.log("client disconnected: ", wsClients.size)
})

app.get("/ws/updated", (req, res) => {
	for (const ws of wsClients) {
		ws.send("updated")
		console.log("updated sent to a client")
	}
	res.send("updated")
})

if (mode === "production") {
	app.use(express.static("build/client"))
	app.use("*", createRequestHandler({ build: await import("./build/server/index.js") }))
}

server.listen(3000, () => console.log("Server is running on port 3000"))
