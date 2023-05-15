import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { updateGridColor } from '../utils/grid'
import { useViewport } from '@contexts/viewport'
import { IBoardContext } from '@typings/kanban'

interface IProps {
  grids: IBoardContext['grids']
  columns: IBoardContext['columns']
  rows: IBoardContext['rows']
  subColumns: IBoardContext['subColumns']
  data: IBoardContext['data']
}

const useKanbanObserver = ({
  grids,
  columns,
  rows,
  subColumns,
  data,
}: IProps) => {
  const container = useRef<HTMLDivElement>(null)
  const { height } = useViewport()

  const visibility = useCallback(
    (visible: boolean) => {
      if (!container.current) return
      container.current.style.visibility = visible ? 'visible' : 'hidden'
    },
    [container]
  )

  useEffect(() => {
    if (!data || !rows || !grids) return
    const showColColor = rows.length <= 1

    const list = data && data[showColColor ? 'columns' : 'rows']

    if (!list) return undefined

    const listObj = [...list.values()]
    listObj.forEach((val: any) => {
      if (showColColor) {
        if (val.childrens?.length > 0) {
          val.childrens.forEach((v: any) => {
            updateGridColor(v.id, v.color, 'col')
          })
        } else {
          updateGridColor(val.id, val.color, 'col')
        }
      } else {
        updateGridColor(val.id, val.color, 'row')
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grids, data])

  const handleResize = useCallback(
    (entries: ResizeObserverEntry[]) => {
      const resizedIds: string[] = []
      visibility(false)
      entries.forEach((entry) => {
        const id = entry.target.id

        const isGrid = ![...rows, ...columns].includes(id)

        if (!isGrid) {
          return
        }
        const [colId, rowId] = id.split('--')

        if (resizedIds.includes(rowId) && resizedIds.includes(colId)) {
          // console.log('Already resized', id)
          return
        }

        const rowEl = container.current?.querySelector(
          `#${rowId}`
        ) as HTMLElement
        const colEl = container.current?.querySelector(
          `#${colId}`
        ) as HTMLElement

        if (rowEl && entry.target.scrollWidth !== rowEl.scrollWidth) {
          rowEl.style.height =
            entry.target.getBoundingClientRect().height + 'px'
          resizedIds.push(rowId)
          // console.log('Row Resize', rowId)
        }

        if (colEl && entry.target.clientWidth !== colEl.clientWidth) {
          colEl.style.width = entry.target.clientWidth + 'px'
          resizedIds.push(colId)
          // console.log('Column Resize', colId)
        }
      })

      const colWrapper = container.current?.querySelector(
        '#column-wrapper'
      ) as HTMLElement
      const gridWrapper = container.current?.querySelector(
        '#grid-wrapper'
      ) as HTMLElement
      if (!colWrapper || !gridWrapper) return

      colWrapper.style.width =
        gridWrapper.scrollWidth + (rows.length > 1 ? 40 : 0) + 'px'

      visibility(true)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [container, grids, rows]
  )

  useEffect(() => {
    Object.keys(subColumns).forEach((sub) => {
      const el = container.current?.querySelector('#' + sub) as HTMLElement
      if (!el) return
      el.style.width = 'auto'
    })
  }, [container.current, subColumns])

  useEffect(() => {
    if (!container.current) return
    const gridWrapper = container.current?.querySelector(
      '#grid-wrapper'
    ) as HTMLElement

    if (!gridWrapper) return

    gridWrapper.style.minHeight = height - gridWrapper.offsetTop + 'px'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container.current, height])

  useEffect(() => {
    // makeVisible()
  }, [])

  useLayoutEffect(() => {
    // If the container ref or grids object is not defined, do nothing
    if (!container.current || !grids) return
    // Define arrays to store column and row IDs
    const colIds: any = []
    const rowIds: any = []

    // Define an array of all grid element IDs by splitting keys in grids object
    const gridIds = Object.keys(grids).map((g) => {
      // Split the ID by '--' to get column and row IDs
      const splitted = g.split('--')
      // If the column ID is not already in the array, add it
      colIds.indexOf(splitted[0]) === -1 && colIds.push('#' + splitted[0])
      // If the row ID is not already in the array, add it
      rowIds.indexOf(splitted[1]) === -1 && rowIds.push('#' + splitted[1])
      // Return the ID as a string with '#' added to the beginning
      return '#' + g
    })

    // Join the arrays of grid, column, and row IDs into a single string
    const ids = [...gridIds, ...colIds, ...rowIds].join(',')

    // If the resulting string is empty, do nothing
    if (ids.length === 0) return

    // Find all elements in the container that match the IDs in the string
    const els = container.current.querySelectorAll(ids)

    // If no elements are found, do nothing
    if (els.length === 0) return

    // Create an IntersectionObserver and a ResizeObserver for each element
    const resizes = new ResizeObserver(handleResize)
    for (const target of els) {
      resizes.observe(target)
    }

    // Return a cleanup function to disconnect the observers
    return () => {
      for (const target of els) {
        resizes.unobserve(target)
      }
      resizes.disconnect()
      console.count('disconnect')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grids])

  return container
}

export default useKanbanObserver

//! Performace Code
// /**
//  * Callback function for IntersectionObserver to track which grid items are in view
//  * and update their heights accordingly.
//  *
//  * @param entries Array of IntersectionObserverEntry objects containing information about
//  * which grid items are in view and their intersection ratios.
//  */
// const handleEnt = useCallback(
//   (entries: IntersectionObserverEntry[]) => {
//     // Create a copy of the previous in-view array to update with new in-view items
//     setInView((prevInView) => {
//       const newInView = [...prevInView]

//       // Loop through each entry in the intersection observer's callback
//       entries.forEach((entry) => {
//         const id = entry.target.id
//         const idx = newInView.indexOf(id)

//         // If the item is in view and not already in the in-view array, add it
//         if (entry.isIntersecting) {
//           idx === -1 && newInView.push(id)
//         } else {
//           // If the item is not in view, set its height to its current height to prevent
//           // collapsing and remove it from the in-view array
//           if (
//             entry.target.offsetHeight !== 0 &&
//             rows.indexOf(id) === -1 &&
//             columns.indexOf(id) === -1
//           ) {
//             entry.target.style.height = entry.target.offsetHeight + 'px'
//           }
//           idx !== -1 && newInView.splice(idx, 1)
//         }
//       })

//       // Return the updated in-view array
//       return newInView
//     })
//   },
//   [grids]
// )

// useLayoutEffect(() => {
//   // If the container ref or grids object is not defined, do nothing
//   if (!container.current || !grids) return

//   // Define arrays to store column and row IDs
//   const colIds: any = []
//   const rowIds: any = []

//   // Define an array of all grid element IDs by splitting keys in grids object
//   const gridIds = Object.keys(grids).map((g) => {
//     // Split the ID by '--' to get column and row IDs
//     const splitted = g.split('--')
//     // If the column ID is not already in the array, add it
//     colIds.indexOf(splitted[0]) === -1 && colIds.push('#' + splitted[0])
//     // If the row ID is not already in the array, add it
//     rowIds.indexOf(splitted[1]) === -1 && rowIds.push('#' + splitted[1])
//     // Return the ID as a string with '#' added to the beginning
//     return '#' + g
//   })

//   // Join the arrays of grid, column, and row IDs into a single string
//   const ids = [...gridIds, ...colIds, rowIds].join(',')

//   // If the resulting string is empty, do nothing
//   if (ids.length === 0) return

//   // Find all elements in the container that match the IDs in the string
//   const els = container.current.querySelectorAll(ids)

//   // If no elements are found, do nothing
//   if (els.length === 0) return

//   // Define default options for IntersectionObserver
//   const defaultOptions = {
//     root: container.current, // The element used as the viewport for checking visibility
//     rootMargin: '0px', // Margin around the root. Can have values similar to the CSS
//     threshold: 0, // what percentage of the target is visible
//   }

//   // Create an IntersectionObserver and a ResizeObserver for each element
//   const intersections = new IntersectionObserver(handleEnt, defaultOptions)
//   const resizes = new ResizeObserver(handleResize)
//   for (const target of els) {
//     intersections.observe(target)
//     resizes.observe(target)
//   }

//   // Return a cleanup function to disconnect the observers
//   return () => {
//     for (const target of els) {
//       intersections.unobserve(target)
//       resizes.unobserve(target)
//     }
//     resizes.disconnect()
//     intersections.disconnect()
//     console.count('disconnect')
//   }
// }, [grids, container.current])
