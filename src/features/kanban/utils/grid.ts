export const updateGridColor = (
  key: string,
  color: string,
  type: 'col' | 'row'
) => {
  const els = document.querySelectorAll(`div[data-${type}=${key}]`)
  if (els && els?.length > 0) {
    els.forEach((el: any) => {
      el.style.background = color
    })
  }
}

export const createGridId = (rowId: string, colId: string) =>
  colId + '--' + rowId
