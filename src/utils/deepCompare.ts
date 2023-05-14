/**
 * Recursively compares two values to determine if they are deeply equal.
 * @param {Array<any>|Record<string, any>} source - The source value to compare.
 * @param {Array<any>|Record<string, any>} target - The target value to compare.
 * @returns {boolean} Whether or not the two values are deeply equal.
 */
export const deepCompare = (
  source: Array<any> | Record<string, any>,
  target: Array<any> | Record<string, any>
): boolean => {
  // If the types of the source and target are not the same, they cannot be deeply equal
  if (typeof source !== typeof target) return false

  // If the source and target are both arrays, compare each element recursively
  if (Array.isArray(source) && Array.isArray(target)) {
    // If the arrays are different lengths, they cannot be deeply equal
    if (source.length !== target.length) return false

    // If all elements are equal, the arrays are deeply equal
    return source.every((value, index) => deepCompare(value, target[index]))
  }

  // If the source and target are both objects, compare each key recursively
  if (typeof source === 'object' && typeof target === 'object')
    return Object.keys(source).every((key) =>
      deepCompare((source as any)[key], (target as any)[key])
    )

  // Otherwise, compare the two values directly
  return source === target
}

/**
 * Compares two arrays of objects by their 'id' property, and returns the objects that were updated and removed.
 * @param source - The original array of objects.
 * @param target - The new array of objects to compare against.
 * @returns An object containing arrays of objects that were updated and removed.
 */
export const compareArraysByIds = <T extends Record<string, any>>(
  source: T[],
  target: T[]
): { removed: T['id'][]; updated: T[] } => {
  // Initialize arrays to hold removed and updated items.
  const removed: T['id'][] = []
  const updated: T[] = []

  // Helper function to check if an array of objects includes an object with a given 'id' property.
  const doesIncludes = (id: string, array: T[]) =>
    array.findIndex((item: T) => item.id === id) !== -1

  // If both source and target are arrays, proceed with comparison.
  if (Array.isArray(source) && Array.isArray(target)) {
    // Filter out the items in source that are not in target, and add them to the updated array.
    const mutualSource = source.filter((item) => {
      if (!doesIncludes(item.id, target)) {
        updated.push(item)
        return false
      } else {
        return true
      }
    })

    // Filter out the items in target that are not in source, and add them to the removed array.
    const mutualTarget = target.filter((item) => {
      if (!doesIncludes(item.id, source)) {
        removed.push(item.id)
        return false
      } else {
        return true
      }
    })

    // Iterate over the remaining mutual items, and check if they were updated.
    mutualSource.forEach((item) => {
      const targetEl = mutualTarget.find((f) => f.id === item.id)
      if (!targetEl) return
      const compare = deepCompare(item, targetEl)
      if (compare) return
      updated.push(item)
    })
  }

  // Return the removed and updated arrays as an object.
  return { removed, updated }
}
