import { forwardRequestToContainer, triggerWeeklyTask } from './container'

export { AgentContainer } from './container'
export { WeeklyWorkflow } from './workflow'

export default {
  fetch: forwardRequestToContainer,
  scheduled: triggerWeeklyTask,
} satisfies ExportedHandler<Cloudflare.Env>
