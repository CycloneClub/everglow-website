import assert from 'node:assert/strict'
import test from 'node:test'
import { activateHeaderMenuItem } from '../app/utils/header-menu.ts'

const click = () => {
  const event = { defaultPrevented: false, preventDefault () { this.defaultPrevented = true } }
  const actions = []
  const handlers = {
    openDocs: () => actions.push('openDocs'),
    navigate: () => actions.push('navigate'),
  }
  return { event, actions, handlers }
}

test('mobile Docs opens its submenu without following the first document link', () => {
  const { event, actions, handlers } = click()
  activateHeaderMenuItem('docs', true, event, handlers)
  assert.equal(event.defaultPrevented, true)
  assert.deepEqual(actions, ['openDocs'])
})

test('desktop Docs keeps its direct link', () => {
  const { event, actions, handlers } = click()
  activateHeaderMenuItem('docs', false, event, handlers)
  assert.equal(event.defaultPrevented, false)
  assert.deepEqual(actions, [])
})

test('ordinary menu items still close the menu and follow their links', () => {
  const { event, actions, handlers } = click()
  activateHeaderMenuItem('news', true, event, handlers)
  assert.equal(event.defaultPrevented, false)
  assert.deepEqual(actions, ['navigate'])
})
