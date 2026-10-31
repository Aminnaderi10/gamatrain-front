// Run: node --import ./tests/resolve-ts.mjs --test tests/subject-directory.test.mjs
import assert from 'node:assert/strict'
import test from 'node:test'
import {
  appendDirectoryPapers, createDirectoryPaperList, getDirectoryExamIds, getDirectoryExamLink,
  getDirectoryPaperCode, getDirectoryPaperLink, getDirectoryPaperTitle, getDirectoryVariantOptions,
  groupDirectoryPapers,
} from '../app/utils/directoryPapers.ts'
import { getDirectoryDownloadParams, getDirectoryPaperDownloads } from '../app/utils/directoryPaperFiles.ts'

const page = (ids, total = ids.length) => ({ status: 1, data: { num: String(total), list: ids.map(id => ({ id })) } })

test('shows only directory variants 1 through 3 in numeric order', () => {
  const variants = [
    { id: '4', title: '4' },
    { id: 'nv', title: 'nv' },
    { id: '3', title: '3' },
    { id: '1', title: ' 1 ' },
    { id: '2', title: 2 },
  ]

  const options = getDirectoryVariantOptions(variants)
  assert.deepEqual(options.map(item => item.id), ['1', '2', '3'])
  assert.deepEqual(options.map(item => item.title), ['1', '2', '3'])
})

test('appends pages, skips repeated papers and stops at the total', () => {
  const list = createDirectoryPaperList()
  appendDirectoryPapers(list, page([1, 2], 3), 2)
  assert.deepEqual([list.page, list.hasMore, list.items.length], [1, true, 2])
  appendDirectoryPapers(list, page([2, 3], 3), 2)
  assert.deepEqual(list.items.map(item => item.id), [1, 2, 3])
  assert.equal(list.hasMore, false)
})

test('without a total, a short page is the last one', () => {
  const list = createDirectoryPaperList()
  appendDirectoryPapers(list, { status: 1, data: { list: [{ id: 1 }, { id: 2 }] } }, 2)
  assert.equal(list.hasMore, true)
  appendDirectoryPapers(list, { status: 1, data: { list: [{ id: 3 }] } }, 2)
  assert.equal(list.hasMore, false)
})

test('rejects an invalid response so the list can show a retry', () => {
  assert.throws(() => appendDirectoryPapers(createDirectoryPaperList(), { status: 0, data: {} }, 50))
})

test('groups papers into years and sessions, newest first, with the grade\'s session titles', () => {
  const papers = [
    { id: 1, edu_year: '2024', edu_month: '6' },
    { id: 2, edu_year: '2024', edu_month: '3' },
    { id: 3, edu_year: '2025', edu_month: '11' },
    { id: 4, edu_year: '2024', edu_month: '6' },
    { id: 5 },
  ]
  const years = groupDirectoryPapers(papers, [{ id: 3, title: 'February/March' }, { id: 6, title: 'May/June' }])
  assert.deepEqual(years.map(year => year.id), [2025, 2024])
  assert.deepEqual(years[0].sessions.map(session => session.title), ['November'])
  assert.deepEqual(years[1].sessions.map(session => [session.title, session.papers.map(paper => paper.id)]), [
    ['May/June', [1, 4]],
    ['February/March', [2]],
  ])
})

test('lists available files in design order with their prices', () => {
  const paper = { files: {
    pdf: { exist: true, price: 0 },
    answer: { exist: false, price: 0 },
    extra: [
      { id: '9', type: '8043', type_title: 'Solved Paper', price: 70 },
      { id: '5', type: '6351', type_title: 'Insert', price: 0 },
    ],
  } }
  const downloads = getDirectoryPaperDownloads(paper)
  assert.deepEqual(downloads.map(file => [file.type, file.shortTitle, file.price]), [
    ['pdf', 'Paper', 0], ['extra:5', 'IN', 0], ['extra:9', 'Solved', 70],
  ])
  assert.deepEqual(getDirectoryDownloadParams('extra:9', paper), { type: 'extra', extraId: '9' })
  assert.deepEqual(getDirectoryDownloadParams('pdf', paper), { type: 'pdf' })
  assert.equal(getDirectoryPaperDownloads({}).length, 0)
})

test('preserves paper labels, detail links and connected exam IDs', () => {
  const paper = { id: '123', test_type_title: 'Paper 1', variant: '7814', variant_title: '1', title_url: 'mathematics' }
  assert.equal(getDirectoryPaperTitle(paper), 'Paper 11')
  assert.equal(getDirectoryPaperCode(paper, 'Mathematics (0580)'), '0580/11')
  assert.equal(getDirectoryPaperCode(paper, 'Biology'), '')
  assert.equal(getDirectoryPaperTitle({ ...paper, variant_title: 'nv' }), 'Paper 1')
  assert.equal(getDirectoryPaperLink(paper), '/paper/123/mathematics')
  assert.deepEqual(getDirectoryExamIds('["12", "12", "15", null, "0"]'), ['12', '15'])
  assert.deepEqual(getDirectoryExamIds('invalid'), [])
  assert.equal(getDirectoryExamLink('12'), '/exam/12')
})
