export function activateHeaderMenuItem (
  name: string,
  mobile: boolean,
  event: Pick<MouseEvent, 'preventDefault'>,
  actions: { openDocs: () => void, navigate: () => void },
) {
  if (name === 'docs') {
    if (mobile) {
      event.preventDefault()
      actions.openDocs()
    }
    return
  }

  actions.navigate()
}
