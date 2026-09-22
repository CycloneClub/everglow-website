import assert from 'node:assert/strict'
import test from 'node:test'
import { captureReadingPosition, isLocaleOnlyNavigation, restoreReadingPosition } from '../app/utils/locale-reading.ts'

const locales = ['zh-cn', 'zh-hk', 'en-us']
const route = (path, query = {}, hash = '') => ({ path, query, hash })

test('only the same content, query and anchor qualify for language-position restoration', () => {
  assert.equal(isLocaleOnlyNavigation(route('/zh-cn'), route('/en-us'), locales), true)
  assert.equal(isLocaleOnlyNavigation(route('/'), route('/en-us/'), locales), true)
  assert.equal(isLocaleOnlyNavigation(route('/docs/guide', { q: 'tree' }, '#one'), route('/en-us/docs/guide', { q: 'tree' }, '#one'), locales), true)
  assert.equal(isLocaleOnlyNavigation(route('/news/one'), route('/en-us/news/two'), locales), false)
  assert.equal(isLocaleOnlyNavigation(route('/docs/guide', { q: 'tree' }), route('/en-us/docs/guide', { q: 'root' }), locales), false)
  assert.equal(isLocaleOnlyNavigation(route('/zh-cn', {}, '#lore'), route('/en-us', {}, '#news'), locales), false)
  assert.equal(isLocaleOnlyNavigation(route('/zh-cn'), route('/zh-cn'), locales), false)
  assert.equal(isLocaleOnlyNavigation(route('/english/guide'), route('/en-us/guide'), locales), false)
})

test('an atlas position retains its timeline progress when the chapter moves or resizes', () => {
  const position = captureReadingPosition({ scrollY: 6000, viewport: 800, pageHeight: 15000, blocks: [], atlas: { top: 1000, height: 10800, stageHeight: 800 } })
  assert.equal(position.kind, 'atlas')
  assert.equal(position.progress, 0.5)
  assert.equal(restoreReadingPosition(position, { viewport: 800, pageHeight: 17000, blocks: [], atlas: { top: 1200, height: 12800, stageHeight: 800 } }), 7200)
})

test('static and ordinary content retain the visible paragraph offset after translation', () => {
  const position = captureReadingPosition({ scrollY: 1050, viewport: 800, pageHeight: 5000, blocks: [{ id: 'intro', top: 100 }, { id: 'town', top: 1000 }, { id: 'kelp', top: 2200 }] })
  assert.equal(position.kind, 'block')
  assert.equal(restoreReadingPosition(position, { viewport: 800, pageHeight: 5500, blocks: [{ id: 'intro', top: 100 }, { id: 'town', top: 1450 }, { id: 'kelp', top: 2600 }] }), 1500)
})

test('translated heading IDs fall back to block order; missing blocks use page progress', () => {
  const position = captureReadingPosition({ scrollY: 1050, viewport: 800, pageHeight: 5000, blocks: [{ id: '标题', top: 1000 }] })
  assert.equal(restoreReadingPosition(position, { viewport: 800, pageHeight: 5000, blocks: [{ id: 'heading', top: 1200 }] }), 1250)
  assert.equal(restoreReadingPosition(position, { viewport: 800, pageHeight: 8800, blocks: [] }), 2000)
})

test('reading below the atlas does not restore inside it and positions stay in page bounds', () => {
  const position = captureReadingPosition({ scrollY: 5000, viewport: 800, pageHeight: 6000, blocks: [], atlas: { top: 800, height: 4000, stageHeight: 800 } })
  assert.equal(position.kind, 'page')
  assert.equal(restoreReadingPosition(position, { viewport: 800, pageHeight: 600, blocks: [] }), 0)
})
