import type { WorkflowEvent, WorkflowStep } from 'cloudflare:workers'
import { WorkflowEntrypoint } from 'cloudflare:workers'
import { triggerWeeklyTask } from './container'

export class WeeklyWorkflow extends WorkflowEntrypoint<Cloudflare.Env> {
  async run(_event: WorkflowEvent<unknown>, step: WorkflowStep) {
    await step.do('trigger-weekly', triggerWeeklyTask)
  }
}
