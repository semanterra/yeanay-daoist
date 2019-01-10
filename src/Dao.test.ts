import * as Knex from 'knex'

import * as config from 'config'
import { createTestSchema } from './__test__/createTestSchema'
import { DaoA, DtoA, DaoB, DtoB } from './__test__/daoDefs'
import { WithoutId } from '@yeanay/yeanay-commons'

// import { WithoutId } from './Dao'

let db:Knex|undefined = undefined
let gdaoA:DaoA|undefined = undefined
let gdaoB:DaoB|undefined = undefined

function getDaoA():DaoA { return gdaoA!}
function getDaoB():DaoB { return gdaoB!}

// jest.setTimeout(5 * 60 * 1000)

beforeAll(async () => {
    await createTestSchema()
    const konfig:Knex.Config = config.knex
    db = Knex(konfig)
    gdaoA = new DaoA(db)
    gdaoB = new DaoB(db)
})

afterAll(async () => {
    if ( db ) {
        await db.destroy()
    }
})

let lastKeyIndex: number = 0

function getNewKey(): string { lastKeyIndex += 1; return 'key' + lastKeyIndex }

describe('insert',()=> {
    test('insert with key', async () => {
        const daoA = getDaoA()
        const suppliedKey = getNewKey()
        const aDto: DtoA = {
            id: suppliedKey,
            astring: suppliedKey+suppliedKey,
            json: { a:1 },
        }
        const key:string = await daoA.insert(aDto)

        expect(key).toEqual(suppliedKey)

        expect.assertions(2)
        await expect(daoA.insert(aDto)).rejects.toThrow()
    })
    test('insert without key', async () => {
        const daoB = getDaoB()
        const bDto: WithoutId<DtoB, number> = {
            bus_key: '1',
        }
        const id:number = await daoB.insert(bDto)

        expect(id).toBeGreaterThan(0)

        const bDto2 = {...bDto, id}
        expect.assertions(2)
        await expect(daoB.insert(bDto2)).rejects.toBeDefined()
    })
})

