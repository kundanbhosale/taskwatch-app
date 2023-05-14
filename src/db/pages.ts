import { idGenerate } from '@utils/idGenerate'
import { OutputData } from '@editorjs/editorjs'
import dayjs from 'dayjs'
import { toast } from 'react-hot-toast'
import { LocalDB, localDb } from '.'

export type PageParams = Pick<Page, 'id' | 'board_id' | 'content'>
export class Page {
  id!: string
  board_id: string
  content: OutputData
  updated_at?: string
  created_at?: string

  constructor({ id, board_id, content }: PageParams) {
    this.id = id
    this.content = content
    this.board_id = board_id
    this.updated_at = dayjs().toISOString()
    this.created_at = dayjs().toISOString()
  }
}

export const getPage = async (id: Page['id']) => {
  try {
    return await localDb.pages.get(id)
  } catch (err) {
    console.error(err)
    toast.error('Failed to add page!')
    return undefined
  }
}

export const updatePage = async (page: Page) => {
  try {
    if (!page) return undefined
    if (!page.created_at) {
      return await localDb.pages.add(new Page(page))
    } else {
      return await localDb.pages.update(page.id, {
        content: page.content,
        updated_at: dayjs().toISOString(),
      })
    }
  } catch (err) {
    console.error(err)
    toast.error('Failed to update page!')
    return undefined
  }
}
