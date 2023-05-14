import { Page, getPage, updatePage } from '@db/pages'
import { TaskItem } from '@db/taskitems'
import { OutputData } from '@editorjs/editorjs'
import { Suspense, lazy, useEffect, useMemo, useState } from 'react'

const Taskpage = ({ taskData }: { taskData: TaskItem | undefined }) => {
  const [initial, setInitial] = useState<Page | 'new' | undefined>(undefined)

  const getData = async () => {
    if (!taskData || !taskData.id) return
    const result = await getPage(taskData.id)
    setInitial(result || 'new')
  }

  const handleSave = async (output: OutputData) => {
    console.log(output)
    if (!taskData?.id || !initial) return
    await updatePage(
      initial !== 'new'
        ? { ...initial, content: output, board_id: taskData.board_id }
        : { id: taskData.id, content: output, board_id: taskData.board_id }
    )
  }

  useEffect(() => {
    if (taskData && taskData.id) {
      if (initial && initial !== 'new' && initial.id === taskData.id) return
      getData()
    }
    return () => setInitial(undefined)
  }, [taskData?.id])

  const LazyEditor = lazy(() => import('@components/forms/blockEditor'))
  const memoiezed = useMemo(() => {
    if (!taskData?.id) return null

    return (
      <Suspense>
        <LazyEditor
          onBlur={handleSave}
          // onChange={(data, event) => console.log(event)}
          initialData={
            (initial && initial !== 'new' && initial.content) || undefined
          }
        />
      </Suspense>
    )
  }, [initial, taskData?.id])

  if (!taskData?.id) return null

  return <div>{memoiezed}</div>
}

export default Taskpage
