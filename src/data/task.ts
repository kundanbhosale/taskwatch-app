import { TaskItem } from '@db/taskitems'
import { idGenerate } from '@utils/idGenerate'
import { LexoRank } from 'lexorank'
import { rand, randFutureDate, seed } from '@ngneat/falso'
import { TaskPriorityOptions } from '@db/taskitems'
import dayjs from 'dayjs'

const todoSentences = [
  'Review project proposal and provide feedback by end of day.',
  'Organize files and folders for better documentation management.',
  'Research new marketing strategies for product promotion.',
  'Update website content with latest information and resources.',
  'Prepare presentation slides for upcoming client meeting.',
  'Complete financial report and submit it to the finance department.',
  'Evaluate customer feedback to identify areas for improvement.',
  'Schedule team brainstorming session for creative ideas generation.',
  'Finalize budget plan for the next quarter.',
  'Submit leave request for vacation approval.',
  'Evaluate current inventory levels and reorder necessary supplies.',
  'Update project timeline with revised deadlines.',
  'Research competitor analysis to identify market trends.',
  'Prepare meeting agenda and distribute it to attendees.',
  'Complete analysis of sales data for monthly performance review.',
  'Organize team-building event to boost employee morale.',
  'Review and proofread marketing campaign materials.',
  'Schedule training session for new employees.',
  'Finalize contract negotiations with potential vendors.',
  'Submit expense report for reimbursement.',
]

export const fakeTask = ({
  board_id,
  status,
  group,
}: Pick<TaskItem, 'board_id' | 'status' | 'group'>) => {
  let rank = LexoRank.middle()

  const result: TaskItem = {
    id: idGenerate('task'),
    title: rand(todoSentences),
    board_id,
    rank: rank.toString(),
    status,
    group,
    fields: {
      priority: rand(TaskPriorityOptions),
      start_date: dayjs(randFutureDate({ length: 5 }).toString()).toISOString(),
      due_date: dayjs(randFutureDate({ length: 10 }).toString()).toISOString(),
    },
    created_at: dayjs().toISOString(),
    updated_at: dayjs().toISOString(),
  }
  rank = rank.genNext()
  return result
}
