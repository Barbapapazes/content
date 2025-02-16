import { assert, describe, expect, it } from 'vitest'
import { createQuery } from '../../../src/runtime/query/query'
import { createPipelineFetcher } from '../../../src/runtime/query/match/pipeline'
import database from './db.json'

const shuffledDatabase: Array<any> = [...database].sort(() => Math.random() - 0.5)
const pipelineFetcher = createPipelineFetcher(() => Promise.resolve(shuffledDatabase))

describe('database Provider', () => {
  it('matches nested exact match', async () => {
    const result = await createQuery<any>(pipelineFetcher, { legacy: true })
      .where({ 'nested.users.0': 'Ahad' })
      .find()
    assert(result.length > 0)
    assert(result.every(item => item.nested.users.includes('Ahad')) === true)
  })

  it('matches nested with operator', async () => {
    // $contains
    const result: Array<any> = await createQuery(pipelineFetcher, { legacy: true })
      .where({
        'nested.users': {
          $contains: 'Pooya',
        },
      })
      .find()
    assert(result.length > 0)
    assert(result.every(item => item.nested.users.includes('Pooya')) === true)
  })

  it('apply limit', async () => {
    const first3 = await createQuery(pipelineFetcher, { legacy: true }).limit(3).find()
    assert(first3.length === 3)
  })

  it('apply skip', async () => {
    const first3 = await createQuery(pipelineFetcher, { legacy: true }).limit(3).find()
    const limit3skip2 = await createQuery(pipelineFetcher, { legacy: true }).skip(2).limit(3).find()
    assert(limit3skip2[0].id === first3[2].id)
  })

  it('apply sort', async () => {
    const nameAsc = await createQuery(pipelineFetcher, { legacy: true }).sort({ name: 1 }).find()
    assert(nameAsc[0].name === database[0].name)

    const nameDesc = await createQuery(pipelineFetcher, { legacy: true }).sort({ name: -1 }).find()
    assert(nameDesc[0].name === database[database.length - 1].name)
  })

  it('apply sort and skip', async () => {
    const nameAsc = await createQuery(pipelineFetcher, { legacy: true }).sort({ name: 1 }).skip(2).find()
    assert(nameAsc[0].name === database[2].name)
  })

  it('apply sort $sensitivity', async () => {
    const textOrder = ['aab', 'aaB', 'aAb', 'aAB', 'Aab', 'AaB', 'AAb', 'AAB']

    const sensitivityCase = await createQuery(pipelineFetcher, { legacy: true }).sort({ text: 1, $sensitivity: 'case' }).find()
    textOrder.forEach((text, index) => {
      expect(sensitivityCase[index].text).toBe(text)
    })
  })

  it('apply sort $caseFirst', async () => {
    const textOrder = ['aab', 'aaB', 'aAb', 'aAB', 'Aab', 'AaB', 'AAb', 'AAB']

    const caseLower = await createQuery(pipelineFetcher, { legacy: true }).sort({ text: 1, $caseFirst: 'lower' }).find()
    textOrder.forEach((text, index) => {
      expect(caseLower[index].text).toBe(text)
    })
    // upper case first
    const caseUpper = await createQuery(pipelineFetcher, { legacy: true }).sort({ text: 1, $caseFirst: 'upper' }).find()
    textOrder.reverse().forEach((text, index) => {
      expect(caseUpper[index].text).toBe(text)
    })
  })

  it('apply sort Date', async () => {
    const dates = [
      { date: new Date('2022-01-01 00:00:00.001Z') },
      { date: new Date('2021-01-01 00:00:00.001Z') },
      { date: new Date('2020-01-01 00:00:00.001Z') },
      { date: new Date('2019-01-01 00:00:00.001Z') },
      { date: new Date('2018-01-01 00:00:00.001Z') },
      { date: new Date('1900-01-01 00:00:00.001Z') },
    ]
    const fetcher = createPipelineFetcher(() => Promise.resolve(dates.sort(() => 1 - Math.random())))

    const sortedByDate1 = await createQuery(fetcher, { legacy: true }).sort({ date: 1 }).find()
    ;([...dates].reverse()).forEach(({ date }, index) => {
      expect(sortedByDate1[index].date).toBe(date)
    })

    const sortedByDate0 = await createQuery(fetcher, { legacy: true }).sort({ date: -1 }).find()
    dates.forEach(({ date }, index) => {
      expect(sortedByDate0[index].date).toBe(date)
    })
  })

  it('apply sort $numeric', async () => {
    // sort string alphabetically
    const nonNumericSort = await createQuery(pipelineFetcher, { legacy: true }).sort({ numberString: 1 }).find()
    const nonNumericOrder = [1, 10, 100, 2, 20, 3, 30, 4]
    nonNumericOrder.forEach((number, index) => {
      expect(nonNumericSort[index].numberString).toBe(String(number))
    })

    // sort string numerically
    const numericSort = await createQuery(pipelineFetcher, { legacy: true }).sort({ numberString: 1, $numeric: true }).find()
    const numericOrder = [1, 2, 3, 4, 10, 20, 30, 100]
    numericOrder.forEach((number, index) => {
      expect(numericSort[index].numberString).toBe(String(number))
    })
  })

  it('sort Nullable fields', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, name: 'Saman' }, { id: 2, name: 'Ebi' }, { id: 3, name: 'Narges' }, { id: 4, name: null }] as any[]))
    const result = await createQuery(fetcher, { legacy: true })
      .sort({ name: 1 })
      .find()

    assert(result[0].name === 'Ebi')
    assert(result[1].name === 'Narges')
    assert(result[2].name === 'Saman')
    assert(result[3].name === null)
  })

  it('apply $in', async () => {
    const result = await createQuery(pipelineFetcher, { legacy: true })
      .where({
        category: { $in: 'c1' },
      })
      .find()
    assert(result.every((item: any) => item.category === 'c1') === true)
  })

  it('apply $in array', async () => {
    const result = await createQuery(pipelineFetcher, { legacy: true })
      .where({
        category: { $in: ['c1', 'c3'] },
      })
      .find()
    assert(result.every((item: any) => ['c1', 'c3'].includes(item.category)) === true)
  })

  it('apply $or + $in', async () => {
    const result = await createQuery(pipelineFetcher, { legacy: true })
      .where({
        $or: [{ category: { $in: 'c1' } }, { category: { $in: 'c2' } }],
      })
      .find()
    assert(result.every((item: any) => ['c1', 'c2'].includes(item.category)) === true)
  })

  it('apply $contains string', async () => {
    const result = await createQuery(pipelineFetcher, { legacy: true })
      .where({
        quote: { $contains: ['best', 'way'] },
      })
      .find()

    assert(result.every((item: any) => item.quote.includes('way')) === true)
  })

  it('apply $containsAny string', async () => {
    const result = await createQuery(pipelineFetcher, { legacy: true })
      .where({
        author: { $containsAny: ['Wilson', 'William'] },
      })
      .find()

    assert(result.every((item: any) => item.author.includes('William')) === false)
    assert(result.every((item: any) => item.author.includes('Wilson')) === false)
    assert(result.every((item: any) => item.author.includes('Wilson') || item.author.includes('William')) === true)
  })

  it('surround with path (default)', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, _path: '/a' }, { id: 2, _path: '/b' }, { id: 3, _path: '/c' }] as any[]))
    const result = await createQuery(fetcher, { legacy: true })
      .findSurround('/b')

    assert(result[0]._path === '/a')
    assert(result[1]._path === '/c')
  })

  it('surround more that 1 item with path', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, _path: '/a' }, { id: 2, _path: '/b' }, { id: 3, _path: '/c' }] as any[]))
    const result = await createQuery(fetcher, { legacy: true })
      .findSurround('/b', { before: 2, after: 1 })

    assert((result as Array<any>).length === 3)
    assert(result[0] === null)
    assert(result[1]._path === '/a')
    assert(result[2]._path === '/c')
  })

  it('surround with 0 item before', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, _path: '/a' }, { id: 2, _path: '/b' }, { id: 3, _path: '/c' }] as any[]))
    const result = await createQuery(fetcher, { legacy: true })
      .findSurround('/b', { before: 0, after: 1 })

    assert((result as Array<any>).length === 1)
    assert(result[0]._path === '/c')
  })

  it('surround with 0 item after', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, _path: '/a' }, { id: 2, _path: '/b' }, { id: 3, _path: '/c' }] as any[]))
    const result = await createQuery(fetcher, { legacy: true })
      .findSurround('/b', { before: 1, after: 0 })

    assert((result as Array<any>).length === 1)
    assert(result[0]._path === '/a')
  })

  it('surround with object', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, _path: '/a' }, { id: 2, _path: '/b' }, { id: 3, _path: '/c' }] as any[]))
    const result = await createQuery(fetcher, { legacy: true })
      .findSurround({ id: 3 }, { before: 2, after: 1 })

    assert((result as Array<any>).length === 3)
    assert(result[0]._path === '/a')
    assert(result[1]._path === '/b')
    assert(result[2] === null)
  })

  it('surround and using only method', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, _path: '/a' }, { id: 2, _path: '/b' }, { id: 3, _path: '/c' }] as any[]))
    const result = await createQuery(fetcher, { legacy: true })
      .only(['_path'])
      .findSurround({ id: 3 }, { before: 2, after: 1 })

    assert((result as Array<any>).length === 3)
    assert(result[0]._path === '/a')
    assert(result[1]._path === '/b')
    assert(result[2] === null)
  })

  it('surround and using without method', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, _path: '/a' }, { id: 2, _path: '/b' }, { id: 3, _path: '/c' }] as any[]))
    const result = await createQuery(fetcher, { legacy: true })
      .without('id')
      .findSurround({ id: 3 }, { before: 2, after: 1 })

    assert((result as Array<any>).length === 3)
    assert(result[0]._path === '/a')
    assert(result[1]._path === '/b')
    assert(result[2] === null)
  })

  it('count items', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, _path: '/a' }, { id: 2, _path: '/b' }, { id: 3, _path: '/c' }] as any[]))

    const result = await createQuery(fetcher, { legacy: true })
      .count()

    assert(result === 3)
  })

  it('count items with where condition', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, _path: '/a' }, { id: 2, _path: '/b' }, { id: 3, _path: '/c' }] as any[]))

    const result = await createQuery(fetcher, { legacy: true })
      .where({ _path: { $contains: 'b' } })
      .count()

    assert(result === 1)
  })

  it('count items with where condition and without method', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, _path: '/a' }, { id: 2, _path: '/b' }, { id: 3, _path: '/c' }] as any[]))

    const result = await createQuery(fetcher, { legacy: true })
      .where({ _path: { $contains: 'b' } })
      .without('id')
      .count()

    assert(result === 1)
  })

  it('count items with where condition and only method', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, _path: '/a' }, { id: 2, _path: '/b' }, { id: 3, _path: '/c' }] as any[]))

    const result = await createQuery(fetcher, { legacy: true })
      .where({ _path: { $contains: 'b' } })
      .only(['_path'])
      .count()

    assert(result === 1)
  })

  it('chain multiple where conditions', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, path: '/a' }, { id: 2, path: '/b' }, { id: 3, path: '/c' }] as any[]))
    const query = createQuery(fetcher, { legacy: true }).where({ id: { $in: [1, 2] } })
    const singleWhereResult = await query.find()

    assert((singleWhereResult as Array<any>).length === 2)
    assert(singleWhereResult[0].path === '/a')
    assert(singleWhereResult[1].path === '/b')

    // Test with second condition
    const doubleWhereResult = await query.where({ path: { $contains: 'b' } }).find()

    assert((doubleWhereResult as Array<any>).length === 1)
    assert(doubleWhereResult[0].path === '/b')
  })

  it('select specific keys', async () => {
    const query = createQuery(pipelineFetcher, { legacy: true })
      .where({ id: { $in: [1, 2] } })
      .only(['name', 'id', '_'])
    const result = await query.find()

    expect(result.length).toBeGreaterThan(0)
    result.forEach((item) => {
      expect(Object.keys(item)).toMatchObject(['id', 'name', '_deleted'])
    })
  })

  it('drop specific keys', async () => {
    const query = createQuery(pipelineFetcher, { legacy: true })
      .where({ id: { $in: [1, 2] } })
      .without(['name', '_'])
    const result = await query.find()

    expect(result.length).toBeGreaterThan(0)
    result.forEach((item: any) => {
      expect(item.id).toBeDefined()
      expect(item.name).toBeUndefined()
      expect(item._deleted).toBeUndefined()
    })
  })
})
