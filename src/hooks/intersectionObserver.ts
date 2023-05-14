import { useLayoutEffect } from 'react'

export const useMultiIntersectionObserver = (
  elements: HTMLElement[] | null,
  callback: (val: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  const defaultOptions = {
    root: null, // The element used as the viewport for checking visibility
    rootMargin: '0px', // Margin around the root. Can have values similar to the CSS
    threshold: 0.5, // what percentage of the target is visible
  }
  useLayoutEffect(() => {
    if (!elements || elements.length === 0) return

    const observer = new IntersectionObserver((entries) => {
      callback(entries)
    }, options || defaultOptions)

    for (const target of elements) {
      observer.observe(target)
    }
    return () => {
      for (const target of elements) {
        observer.unobserve(target)
      }
      observer.disconnect()
    }
  }, [elements, callback])
  return true
}
