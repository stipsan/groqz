import groq from 'groq'
import { expect, test } from 'vitest'

import { type EvaluateOptions, introspect } from './index'

test('No dataset', async () => {
  expect(await introspect(groq`*`)).toEqual(null)
  expect(await introspect(groq`*[]`)).toEqual(null)
  expect(
    await introspect(
      groq`{"count": count(*[_type == "person" && isPublished])}`
    )
  ).toEqual({ count: null })
  expect(await introspect(groq`1+2`)).toEqual(3)
})
test('Empty dataset array', async () => {
  const dataset = [] as const
  expect(await introspect(groq`*`, { dataset })).toEqual([])
  expect(
    await introspect(groq`count(*[_type == "person" && isPublished])`, {
      dataset,
    })
  ).toEqual(0)
})

const dataset = [
  {
    _type: 'movie',
    _id: 'movie',
    _createdAt: '2018-06-13T08:57:45Z',
    _rev: 'Ql9pBhXUiKAfQDz2O3JdTy',
    _updatedAt: '2021-09-27T11:51:34Z',
    title: 'WALL-E',
    slug: {
      _type: 'slug',
      current: 'walle',
      source: 'title',
    },
    releaseDate: '2008-06-22T00:00:00Z',
    poster: {
      _type: 'image',
      asset: {
        _ref: 'image-69ad5d60ff19c456954513e8c67e9563c780d5e1-780x1170-jpg',
        _type: 'reference',
      },
      crop: {
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
      },
      hotspot: {
        height: 0,
        width: 0,
        x: 0,
        y: 0,
      },
    },
    popularity: 0.5,
    overview: [
      {
        _key: '8a1fd7b434db11443bf33bc3a2428b64',
        _type: 'block',
      },
    ],
    externalId: 10681,
    crewMembers: [
      {
        _type: 'crewMember',
        _key: 'c1fa227f38952ce26d9a66cbe1813672',
        department: 'Directing',
        externalCreditId: '52fe43a29251416c750180d1',
        externalId: 7,
        job: 'Director',
        person: {
          _ref: 'person',
          _type: 'reference',
        },
      },
    ],
    castMembers: [
      {
        _type: 'castMember',
        _key: '3d1bfb748327aefa5a65203b99f59a04',
        characterName: 'WALL·E / M-O (voice)',
        externalCreditId: '52fe43a29251416c75018111',
        externalId: 670,
        person: {
          _ref: 'person',
          _type: 'reference',
        },
      },
    ],
  },
  {
    _type: 'sanity.imageAsset',
    _id: 'image-69ad5d60ff19c456954513e8c67e9563c780d5e1-780x1170-jpg',
    _createdAt: '2021-09-27T11:51:05Z',
    _rev: '91mNbnWW9fkBqVwXvIRtZU',
    _updatedAt: '2021-09-27T11:51:06Z',
    assetId: '69ad5d60ff19c456954513e8c67e9563c780d5e1',
    extension: 'jpg',
    metadata: {
      dimensions: {
        aspectRatio: 0.6666666666666666,
        height: 1170,
        width: 780,
      },
      palette: {
        darkMuted: {
          background: 'color',
          foreground: 'color',
          population: 0,
          title: 'color',
        },
        darkVibrant: {
          background: 'color',
          foreground: 'color',
          population: 0,
          title: 'color',
        },
        dominant: {
          background: 'color',
          foreground: 'color',
          population: 0,
          title: 'color',
        },
        lightMuted: {
          background: 'color',
          foreground: 'color',
          population: 0,
          title: 'color',
        },
        lightVibrant: {
          background: 'color',
          foreground: 'color',
          population: 0,
          title: 'color',
        },
        muted: {
          background: 'color',
          foreground: 'color',
          population: 0,
          title: 'color',
        },
        vibrant: {
          background: 'color',
          foreground: 'color',
          population: 0,
          title: 'color',
        },
      },
    },
    mimeType: 'image/jpeg',
    originalFilename: '9cJETuLMc6R0bTWRA5i7ctY9bxk.jpg',
    path: 'images/ppsg7ml5/movies/69ad5d60ff19c456954513e8c67e9563c780d5e1-780x1170.jpg',
    sha1hash: '24c06f292f58e9cac6efd371104e51c16f6c36f8',
    size: 153341,
    uploadId: 'xGiN4ECUAF4PSONjFQuD5gN9UYh4NNZY',
    url: 'https://cdn.sanity.io/images/ppsg7ml5/movies/69ad5d60ff19c456954513e8c67e9563c780d5e1-780x1170.jpg',
  },
  {
    _type: 'person',
    _id: 'person',
    _createdAt: '2018-06-13T08:57:45Z',
    _rev: 'Ql9pBhXUiKAfQDz2O3JWhy',
    _updatedAt: '2021-09-27T11:51:31Z',
    image: {
      _type: 'image',
      asset: {
        _ref: 'image-69ad5d60ff19c456954513e8c67e9563c780d5e1-780x1170-jpg',
        _type: 'reference',
      },
    },
    name: 'Ben Burtt',
    slug: {
      _type: 'slug',
      current: 'ben-burtt',
      source: 'name',
    },
  },
] as const
const options: EvaluateOptions = { dataset }

test('Filters', async () => {
  expect(await introspect(groq`*`, options)).toEqual(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect.arrayContaining(dataset as any)
  )

  expect(await introspect(groq`*[]{_type}`, options)).toEqual(
    expect.arrayContaining([
      { _type: 'movie' },
      { _type: 'person' },
      { _type: 'sanity.imageAsset' },
    ])
  )

  expect(
    await introspect(groq`*[_type in ["movie", "person"]]{_type}`, options)
  ).toEqual([{ _type: 'movie' }, { _type: 'person' }])

  expect(await introspect(groq`*[]{foobar}`, options)).toEqual(
    expect.arrayContaining([{ foobar: null }])
  )
})

test('Text matching', async () => {
  //
})

test('Slice Operations', async () => {
  //
})

test('Ordering', async () => {
  //
})

test('Joins', async () => {
  //
})

test('Objects and Arrays', async () => {
  //
})
test('Object Projections', async () => {
  //
})

test('Special variables', async () => {
  //
})
test('Conditionals', async () => {
  //
})
test('Functions', async () => {
  //
})
test('Geolocation', async () => {
  //
})
test('Arithmetic and Concatenation', async () => {
  expect(await introspect(groq`1 + 2`)).toMatchInlineSnapshot('3')
  expect(await introspect(groq`3 - 2`)).toMatchInlineSnapshot('1')
  expect(await introspect(groq`2 * 3`)).toMatchInlineSnapshot('6')
  expect(await introspect(groq`8 / 4`)).toMatchInlineSnapshot('2')
  expect(await introspect(groq`2 ** 4`)).toMatchInlineSnapshot('16')
  expect(await introspect(groq`8 % 3`)).toMatchInlineSnapshot('2')
  expect(await introspect(groq`9 ** (1/2)`)).toMatchInlineSnapshot('3')
  expect(await introspect(groq`27 ** (1/3)`)).toMatchInlineSnapshot('3')
  expect(await introspect(groq`"abc" + "def"`)).toMatchInlineSnapshot(
    '"abcdef"'
  )
  expect(await introspect(groq`[1,2] + [3,4]`)).toMatchInlineSnapshot(
    `
    [
      1,
      2,
      3,
      4,
    ]
  `
  )
  expect(await introspect(groq`[1,"2"] + ["3",4]`)).toMatchInlineSnapshot(
    `
    [
      1,
      "2",
      "3",
      4,
    ]
  `
  )
  expect(await introspect(groq`{"a":1,"b":2} + {"c":3}`)).toMatchInlineSnapshot(
    `
    {
      "a": 1,
      "b": 2,
      "c": 3,
    }
  `
  )
  expect(await introspect(groq`{"a":1,"b":2} + {"c":"d"}`))
    .toMatchInlineSnapshot(`
      {
        "a": 1,
        "b": 2,
        "c": "d",
      }
    `)
})
