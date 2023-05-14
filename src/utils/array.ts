export const removeAtIndex = (array: Array<unknown>, index: number) => {
  return [...array.slice(0, index), ...array.slice(index + 1)]
}

export const insertAtIndex = (
  array: Array<unknown>,
  index: number,
  item: unknown
) => {
  return [...array.slice(0, index), item, ...array.slice(index)]
}
