export interface SSEEvent {
  payload?: {
    type?: string
    properties?: {
      sessionID?: string
      status?: {
        type?: string
      }
    }
  }
}

export type SSEEventHandler = (event: SSEEvent) => boolean | void | Promise<boolean | void>

export async function processSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEvent: SSEEventHandler,
) {
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done)
        break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data: '))
          continue

        let event: SSEEvent
        try {
          event = JSON.parse(trimmed.slice(6)) as SSEEvent
        }
        catch {
          // JSON 解析失败时跳过
          continue
        }

        const shouldContinue = await onEvent(event)

        if (shouldContinue === false)
          return
      }
    }
  }
  finally {
    await reader.cancel().catch(() => {})
  }
}
