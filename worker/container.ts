import { Container, getContainer } from '@cloudflare/containers'
import { env } from 'cloudflare:workers'
import { processSSEStream } from './sse'

const PORT = 2442

const containerEnv = Object.fromEntries(
  Object.entries(env).filter(([, value]) => typeof value === 'string'),
)

export class AgentContainer extends Container {
  sleepAfter = '10m'
  defaultPort = PORT

  private _watchPromise?: Promise<void>
  private _watchReader?: ReadableStreamDefaultReader<Uint8Array>
  private _watchSessionID?: string

  envVars = {
    ...containerEnv,
    PORT: PORT.toString(),
  }

  async runWeeklyTask() {
    const headers = { 'Content-Type': 'application/json' }

    const createRes = await this.containerFetch(
      'http://container/session',
      { method: 'POST', headers, body: JSON.stringify({}) },
    )
    if (!createRes.ok)
      throw new Error(`Failed to create session: ${createRes.status}`)

    const session = await createRes.json() as { id: string }
    console.info(`Created session: ${session.id}`)

    await this.monitorSession(session.id)

    const commandPromise = this.containerFetch(
      `http://container/session/${session.id}/command`,
      { method: 'POST', headers, body: JSON.stringify({ command: 'weekly', arguments: '' }) },
    )
      .then(async (commandRes) => {
        if (!commandRes.ok)
          throw new Error(`Failed to trigger weekly task: ${commandRes.status}`)

        await commandRes.arrayBuffer()
      })
      .finally(() => this.stopMonitoringSession(session.id))

    this.ctx.waitUntil(commandPromise)

    console.info(`Weekly task triggered: ${session.id}`)
  }

  private async monitorSession(sessionID: string) {
    await this.stopMonitoringSession()

    const res = await this.containerFetch('http://container/global/event')
    if (!res.ok)
      throw new Error(`Failed to connect opencode event stream: ${res.status}`)

    const reader = res.body?.getReader()
    if (!reader)
      throw new Error('Failed to read opencode event stream')

    this._watchReader = reader
    this._watchSessionID = sessionID

    const watchPromise = processSSEStream(reader, (event) => {
      const payload = event.payload
      const eventType = payload?.type
      const properties = payload?.properties

      if (!eventType || eventType === 'message.part.updated' || eventType === 'server.heartbeat')
        return

      if (properties?.sessionID && properties.sessionID !== sessionID)
        return

      if (eventType === 'session.status') {
        if (properties?.sessionID !== sessionID)
          return

        const statusType = properties.status?.type

        if (statusType === 'busy' || statusType === 'retry') {
          this.renewActivityTimeout()
          console.info(`Session ${sessionID} is ${statusType}, renewed container activity timeout`)
          return
        }

        if (statusType === 'idle') {
          this.renewActivityTimeout()
          console.info(`Session ${sessionID} is idle, stopping SSE monitor`)
          return false
        }
      }

      if (eventType === 'session.idle' || eventType === 'session.error') {
        if (properties?.sessionID !== sessionID)
          return

        this.renewActivityTimeout()
        console.info(`Session ${sessionID} emitted ${eventType}, stopping SSE monitor`)
        return false
      }

      console.info('SSE event:', JSON.stringify(payload))
    })
      .catch((error) => {
        console.error('SSE connection error:', error)
      })
      .finally(() => {
        if (this._watchPromise === watchPromise) {
          this._watchPromise = undefined
          this._watchReader = undefined
          this._watchSessionID = undefined
        }
      })

    this._watchPromise = watchPromise
    this.ctx.waitUntil(watchPromise)
  }

  private async stopMonitoringSession(sessionID?: string) {
    if (sessionID && this._watchSessionID !== sessionID) {
      return
    }

    await this._watchReader?.cancel().catch(() => {})
  }
}

export async function forwardRequestToContainer(request: Request) {
  const container = getContainer(env.AGENT_CONTAINER)

  return container.fetch(request)
}

export async function triggerWeeklyTask() {
  const container = getContainer(env.AGENT_CONTAINER)

  await container.runWeeklyTask()
}
