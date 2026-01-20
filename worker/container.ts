import { Container, getContainer } from '@cloudflare/containers'
import { env } from 'cloudflare:workers'

const PORT = 2442

const containerEnv = Object.fromEntries(
  Object.entries(env).filter(([, value]) => typeof value === 'string'),
)

function getAuthHeaders(): HeadersInit {
  const username = env.OPENCODE_SERVER_USERNAME
  const password = env.OPENCODE_SERVER_PASSWORD
  if (password) {
    return { Authorization: `Basic ${btoa(`${username}:${password}`)}` }
  }
  return {}
}

export class AgentContainer extends Container {
  sleepAfter = '10m'
  defaultPort = PORT

  private _watchPromise?: Promise<void>

  envVars = {
    ...containerEnv,
    OPENCODE_SERVER_USERNAME: containerEnv.OPENCODE_SERVER_USERNAME || 'agili',
    OPENCODE_SERVER_PASSWORD: containerEnv.OPENCODE_SERVER_PASSWORD || crypto.randomUUID(),
    PORT: PORT.toString(),
  }

  async watchContainer() {
    try {
      const res = await this.containerFetch('http://container/global/event', {
        headers: getAuthHeaders(),
      })
      const reader = res.body?.getReader()
      if (reader) {
        while (true) {
          const { done } = await reader.read()
          if (done)
            break
          await new Promise(resolve => setTimeout(resolve, 60_000))
          this.renewActivityTimeout()
        }
      }
    }
    catch (error) {
      console.error('SSE connection error:', error)
    }
  }

  override async onStart(): Promise<void> {
    // 不 await，让 SSE 监听在后台运行，避免阻塞 blockConcurrencyWhile
    this._watchPromise = this.watchContainer()
  }
}

export async function forwardRequestToContainer(request: Request) {
  const container = getContainer(env.AGENT_CONTAINER)

  return container.fetch(request)
}

export async function triggerWeeklyTask() {
  const container = getContainer(env.AGENT_CONTAINER)
  const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() }

  const createRes = await container.fetch(
    'http://container/session',
    { method: 'POST', headers, body: JSON.stringify({}) },
  )
  if (!createRes.ok)
    throw new Error(`Failed to create session: ${createRes.status}`)

  const session = await createRes.json() as { id: string }
  console.info(`Created session: ${session.id}`)

  const promptRes = await container.fetch(
    `http://container/session/${session.id}/command`,
    { method: 'POST', headers, body: JSON.stringify({ command: 'weekly', arguments: '' }) },
  )
  if (!promptRes.ok)
    throw new Error(`Failed to send prompt: ${promptRes.status}`)

  console.info(`Weekly task triggered: ${session.id}`)
}
