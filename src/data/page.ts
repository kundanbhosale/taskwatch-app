import dayjs from 'dayjs'

const genPageData = (id: string, board_id: string) => {
  return {
    id,
    board_id,
    updated_at: dayjs().toISOString(),
    created_at: dayjs().toISOString(),
    content: {
      time: 1683983786424,
      blocks: [
        {
          id: 'D26YcPqZPs',
          type: 'paragraph',
          data: {
            text: '<b><mark class="cdx-marker"><u class="cdx-underline">Task Notes -&nbsp;</u></mark></b>',
          },
        },
        {
          id: 'Fa7u4Pn1Ys',
          type: 'embed',
          data: {
            service: 'youtube',
            source: 'https://www.youtube.com/watch?v=keCwRdbwNQY&amp;t=2s',
            embed: 'https://www.youtube.com/embed/keCwRdbwNQY?start=2s',
            width: 580,
            height: 320,
            caption: '',
          },
        },
        {
          id: 'oZFhcP6gk1',
          type: 'paragraph',
          data: {
            text: 'One important task on my to-do list is to organize and declutter my living space. Over time, various items have accumulated, leading to a sense of clutter and disarray. By setting aside dedicated time to sort through belongings, I aim to streamline my living environment and create a more harmonious space. This task involves categorizing items, deciding what to keep, donate, or discard, and finding suitable storage solutions. By completing this to-do, I hope to not only create a cleaner and more organized home but also achieve a sense of clarity and calmness in my surroundings.',
          },
        },
        {
          id: 'rBpa5709er',
          type: 'list',
          data: {
            style: 'ordered',
            items: [
              'Define the objective: Clearly outline the specific goal or objective you want to achieve with this task or project. Having a clear objective will help you stay focused and measure your progress.',
              'Break it down: Divide the task or project into smaller, more manageable subtasks or steps. This will make it easier to tackle and prevent overwhelm.',
              'Prioritize: Determine the order of importance or urgency for each subtask. Prioritizing will help you focus your time and energy on the most critical aspects first.',
              'Set deadlines: Assign realistic deadlines for each subtask. Having specific timeframes will create a sense of accountability and help you stay on track.',
              'Gather resources: Identify and gather any necessary resources, such as research materials, tools, or support from others. Having the right resources at hand will facilitate smooth progress.',
            ],
          },
        },
      ],
      version: '2.26.5',
    },
  }
}

export { genPageData }
