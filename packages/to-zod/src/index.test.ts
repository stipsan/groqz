import groq from 'groq'
import { expect, test } from 'vitest'

import { type EvaluateOptions, groqToZod } from './index'

test('No dataset', async () => {
  let schema = await groqToZod(groq`*`)
  expect(schema.parse([])).toEqual([])
  expect(schema.parse({})).toEqual({})
  expect(schema.parse(null)).toEqual(null)
  expect(schema.parse([{}, 1])).toEqual([{}, 1])
  expect(() => schema.parse(NaN)).toThrowErrorMatchingSnapshot()
  expect(() => schema.parse([NaN])).toThrowErrorMatchingSnapshot()

  schema = await groqToZod(
    groq`{"count": count(*[_type == "person" && isPublished])}`
  )
  expect(schema.parse({ count: 0 })).toEqual({ count: 0 })
  expect(() => schema.parse({ length: 0 })).toThrowErrorMatchingSnapshot()
  expect(() => schema.parse(null)).toThrowErrorMatchingSnapshot()

  schema = await groqToZod(groq`1+2`)
  expect(schema.parse(3)).toEqual(3)
  expect(() => schema.parse(null)).toThrowErrorMatchingSnapshot()
})
test('Empty dataset array', async () => {
  const dataset = [] as const
  let schema = await groqToZod(groq`*`, { dataset })
  expect(schema.parse([])).toEqual([])
  expect(() => schema.parse({})).toThrowErrorMatchingSnapshot()
  expect(() => schema.parse(null)).toThrowErrorMatchingSnapshot()
  expect(schema.parse([{}, 1])).toEqual([{}, 1])
  expect(() => schema.parse(NaN)).toThrowErrorMatchingSnapshot()
  expect(() => schema.parse([NaN])).toThrowErrorMatchingSnapshot()

  schema = await groqToZod(groq`count(*[_type == "person" && isPublished])`, {
    dataset,
  })
  expect(schema.parse(0)).toEqual(0)
  expect(() => schema.parse(null)).toThrowErrorMatchingSnapshot()
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
  let schema = await groqToZod(groq`*`, options)
  expect(schema.parse([])).toEqual([])
  expect(() => schema.parse([{}, 1])).toThrowErrorMatchingSnapshot()
  expect(() => schema.parse([{ foo: 'bar' }, 1])).toThrowErrorMatchingSnapshot()

  schema = await groqToZod(groq`*[]{_type, title}`, options)
  expect(
    schema.parse([
      { _type: 'movie', title: 'title' },
      { _type: 'person', title: null },
      { _type: 'sanity.imageAsset', title: null },
    ])
  ).toEqual([
    { _type: 'movie', title: 'title' },
    { _type: 'person', title: null },
    { _type: 'sanity.imageAsset', title: null },
  ])
  expect(() => schema.parse([{}])).toThrowErrorMatchingSnapshot()
  expect(() => schema.parse([{ _type: 'crewMember' }]))
    .toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          \\"code\\": \\"invalid_union_discriminator\\",
          \\"options\\": [
            \\"movie\\",
            \\"sanity.imageAsset\\",
            \\"person\\"
          ],
          \\"path\\": [
            0,
            \\"_type\\"
          ],
          \\"message\\": \\"Invalid discriminator value. Expected 'movie' | 'sanity.imageAsset' | 'person'\\"
        }
      ]"
    `)
  expect(() => schema.parse([{ _type: 'movie', title: 123 }]))
    .toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          \\"code\\": \\"invalid_type\\",
          \\"expected\\": \\"string\\",
          \\"received\\": \\"number\\",
          \\"path\\": [
            0,
            \\"title\\"
          ],
          \\"message\\": \\"Expected string, received number\\"
        }
      ]"
    `)

  schema = await groqToZod(
    groq`*[_type in ["movie", "person"]]{_type}`,
    options
  )
  expect(schema.parse([{ _type: 'movie' }, { _type: 'person' }])).toEqual([
    { _type: 'movie' },
    { _type: 'person' },
  ])
  expect(() =>
    schema.parse([{ _type: 'sanity.imageAsset' }])
  ).toThrowErrorMatchingSnapshot()
  expect(() => schema.parse([{}])).toThrowErrorMatchingSnapshot()

  schema = await groqToZod(groq`*[]{foobar}`, options)
  expect(schema.parse([{ foobar: 'foobar' }, { foobar: null }, {}])).toEqual([
    { foobar: 'foobar' },
    { foobar: null },
    {},
  ])
  expect(() => schema.parse([{ foobar: NaN }])).toThrowErrorMatchingSnapshot()
  expect(() => schema.parse([undefined])).toThrowErrorMatchingSnapshot()
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
  expect(await groqToZod(groq`1 + 2`)).toMatchInlineSnapshot(`
    ZodNumber {
      "_def": {
        "checks": [],
        "coerce": false,
        "typeName": "ZodNumber",
      },
      "and": [Function],
      "array": [Function],
      "brand": [Function],
      "catch": [Function],
      "default": [Function],
      "describe": [Function],
      "isNullable": [Function],
      "isOptional": [Function],
      "max": [Function],
      "min": [Function],
      "nullable": [Function],
      "nullish": [Function],
      "optional": [Function],
      "or": [Function],
      "parse": [Function],
      "parseAsync": [Function],
      "pipe": [Function],
      "promise": [Function],
      "refine": [Function],
      "refinement": [Function],
      "safeParse": [Function],
      "safeParseAsync": [Function],
      "spa": [Function],
      "step": [Function],
      "superRefine": [Function],
      "transform": [Function],
    }
  `)
  expect(await groqToZod(groq`3 - 2`)).toMatchInlineSnapshot(`
    ZodNumber {
      "_def": {
        "checks": [],
        "coerce": false,
        "typeName": "ZodNumber",
      },
      "and": [Function],
      "array": [Function],
      "brand": [Function],
      "catch": [Function],
      "default": [Function],
      "describe": [Function],
      "isNullable": [Function],
      "isOptional": [Function],
      "max": [Function],
      "min": [Function],
      "nullable": [Function],
      "nullish": [Function],
      "optional": [Function],
      "or": [Function],
      "parse": [Function],
      "parseAsync": [Function],
      "pipe": [Function],
      "promise": [Function],
      "refine": [Function],
      "refinement": [Function],
      "safeParse": [Function],
      "safeParseAsync": [Function],
      "spa": [Function],
      "step": [Function],
      "superRefine": [Function],
      "transform": [Function],
    }
  `)
  expect(await groqToZod(groq`2 * 3`)).toMatchInlineSnapshot(`
    ZodNumber {
      "_def": {
        "checks": [],
        "coerce": false,
        "typeName": "ZodNumber",
      },
      "and": [Function],
      "array": [Function],
      "brand": [Function],
      "catch": [Function],
      "default": [Function],
      "describe": [Function],
      "isNullable": [Function],
      "isOptional": [Function],
      "max": [Function],
      "min": [Function],
      "nullable": [Function],
      "nullish": [Function],
      "optional": [Function],
      "or": [Function],
      "parse": [Function],
      "parseAsync": [Function],
      "pipe": [Function],
      "promise": [Function],
      "refine": [Function],
      "refinement": [Function],
      "safeParse": [Function],
      "safeParseAsync": [Function],
      "spa": [Function],
      "step": [Function],
      "superRefine": [Function],
      "transform": [Function],
    }
  `)
  expect(await groqToZod(groq`8 / 4`)).toMatchInlineSnapshot(`
    ZodNumber {
      "_def": {
        "checks": [],
        "coerce": false,
        "typeName": "ZodNumber",
      },
      "and": [Function],
      "array": [Function],
      "brand": [Function],
      "catch": [Function],
      "default": [Function],
      "describe": [Function],
      "isNullable": [Function],
      "isOptional": [Function],
      "max": [Function],
      "min": [Function],
      "nullable": [Function],
      "nullish": [Function],
      "optional": [Function],
      "or": [Function],
      "parse": [Function],
      "parseAsync": [Function],
      "pipe": [Function],
      "promise": [Function],
      "refine": [Function],
      "refinement": [Function],
      "safeParse": [Function],
      "safeParseAsync": [Function],
      "spa": [Function],
      "step": [Function],
      "superRefine": [Function],
      "transform": [Function],
    }
  `)
  expect(await groqToZod(groq`2 ** 4`)).toMatchInlineSnapshot(`
    ZodNumber {
      "_def": {
        "checks": [],
        "coerce": false,
        "typeName": "ZodNumber",
      },
      "and": [Function],
      "array": [Function],
      "brand": [Function],
      "catch": [Function],
      "default": [Function],
      "describe": [Function],
      "isNullable": [Function],
      "isOptional": [Function],
      "max": [Function],
      "min": [Function],
      "nullable": [Function],
      "nullish": [Function],
      "optional": [Function],
      "or": [Function],
      "parse": [Function],
      "parseAsync": [Function],
      "pipe": [Function],
      "promise": [Function],
      "refine": [Function],
      "refinement": [Function],
      "safeParse": [Function],
      "safeParseAsync": [Function],
      "spa": [Function],
      "step": [Function],
      "superRefine": [Function],
      "transform": [Function],
    }
  `)
  expect(await groqToZod(groq`8 % 3`)).toMatchInlineSnapshot(`
    ZodNumber {
      "_def": {
        "checks": [],
        "coerce": false,
        "typeName": "ZodNumber",
      },
      "and": [Function],
      "array": [Function],
      "brand": [Function],
      "catch": [Function],
      "default": [Function],
      "describe": [Function],
      "isNullable": [Function],
      "isOptional": [Function],
      "max": [Function],
      "min": [Function],
      "nullable": [Function],
      "nullish": [Function],
      "optional": [Function],
      "or": [Function],
      "parse": [Function],
      "parseAsync": [Function],
      "pipe": [Function],
      "promise": [Function],
      "refine": [Function],
      "refinement": [Function],
      "safeParse": [Function],
      "safeParseAsync": [Function],
      "spa": [Function],
      "step": [Function],
      "superRefine": [Function],
      "transform": [Function],
    }
  `)
  expect(await groqToZod(groq`9 ** (1/2)`)).toMatchInlineSnapshot(`
    ZodNumber {
      "_def": {
        "checks": [],
        "coerce": false,
        "typeName": "ZodNumber",
      },
      "and": [Function],
      "array": [Function],
      "brand": [Function],
      "catch": [Function],
      "default": [Function],
      "describe": [Function],
      "isNullable": [Function],
      "isOptional": [Function],
      "max": [Function],
      "min": [Function],
      "nullable": [Function],
      "nullish": [Function],
      "optional": [Function],
      "or": [Function],
      "parse": [Function],
      "parseAsync": [Function],
      "pipe": [Function],
      "promise": [Function],
      "refine": [Function],
      "refinement": [Function],
      "safeParse": [Function],
      "safeParseAsync": [Function],
      "spa": [Function],
      "step": [Function],
      "superRefine": [Function],
      "transform": [Function],
    }
  `)
  expect(await groqToZod(groq`27 ** (1/3)`)).toMatchInlineSnapshot(`
    ZodNumber {
      "_def": {
        "checks": [],
        "coerce": false,
        "typeName": "ZodNumber",
      },
      "and": [Function],
      "array": [Function],
      "brand": [Function],
      "catch": [Function],
      "default": [Function],
      "describe": [Function],
      "isNullable": [Function],
      "isOptional": [Function],
      "max": [Function],
      "min": [Function],
      "nullable": [Function],
      "nullish": [Function],
      "optional": [Function],
      "or": [Function],
      "parse": [Function],
      "parseAsync": [Function],
      "pipe": [Function],
      "promise": [Function],
      "refine": [Function],
      "refinement": [Function],
      "safeParse": [Function],
      "safeParseAsync": [Function],
      "spa": [Function],
      "step": [Function],
      "superRefine": [Function],
      "transform": [Function],
    }
  `)
  expect(await groqToZod(groq`"abc" + "def"`)).toMatchInlineSnapshot(
    `
    ZodString {
      "_def": {
        "checks": [],
        "coerce": false,
        "typeName": "ZodString",
      },
      "_regex": [Function],
      "and": [Function],
      "array": [Function],
      "brand": [Function],
      "catch": [Function],
      "default": [Function],
      "describe": [Function],
      "isNullable": [Function],
      "isOptional": [Function],
      "nonempty": [Function],
      "nullable": [Function],
      "nullish": [Function],
      "optional": [Function],
      "or": [Function],
      "parse": [Function],
      "parseAsync": [Function],
      "pipe": [Function],
      "promise": [Function],
      "refine": [Function],
      "refinement": [Function],
      "safeParse": [Function],
      "safeParseAsync": [Function],
      "spa": [Function],
      "superRefine": [Function],
      "transform": [Function],
      "trim": [Function],
    }
  `
  )
  expect(await groqToZod(groq`[1,2] + [3,4]`)).toMatchInlineSnapshot(
    `
    ZodArray {
      "_def": {
        "exactLength": null,
        "maxLength": null,
        "minLength": null,
        "type": ZodUnion {
          "_def": {
            "options": [
              ZodNumber {
                "_def": {
                  "checks": [],
                  "coerce": false,
                  "typeName": "ZodNumber",
                },
                "and": [Function],
                "array": [Function],
                "brand": [Function],
                "catch": [Function],
                "default": [Function],
                "describe": [Function],
                "isNullable": [Function],
                "isOptional": [Function],
                "max": [Function],
                "min": [Function],
                "nullable": [Function],
                "nullish": [Function],
                "optional": [Function],
                "or": [Function],
                "parse": [Function],
                "parseAsync": [Function],
                "pipe": [Function],
                "promise": [Function],
                "refine": [Function],
                "refinement": [Function],
                "safeParse": [Function],
                "safeParseAsync": [Function],
                "spa": [Function],
                "step": [Function],
                "superRefine": [Function],
                "transform": [Function],
              },
              ZodNumber {
                "_def": {
                  "checks": [],
                  "coerce": false,
                  "typeName": "ZodNumber",
                },
                "and": [Function],
                "array": [Function],
                "brand": [Function],
                "catch": [Function],
                "default": [Function],
                "describe": [Function],
                "isNullable": [Function],
                "isOptional": [Function],
                "max": [Function],
                "min": [Function],
                "nullable": [Function],
                "nullish": [Function],
                "optional": [Function],
                "or": [Function],
                "parse": [Function],
                "parseAsync": [Function],
                "pipe": [Function],
                "promise": [Function],
                "refine": [Function],
                "refinement": [Function],
                "safeParse": [Function],
                "safeParseAsync": [Function],
                "spa": [Function],
                "step": [Function],
                "superRefine": [Function],
                "transform": [Function],
              },
              ZodNumber {
                "_def": {
                  "checks": [],
                  "coerce": false,
                  "typeName": "ZodNumber",
                },
                "and": [Function],
                "array": [Function],
                "brand": [Function],
                "catch": [Function],
                "default": [Function],
                "describe": [Function],
                "isNullable": [Function],
                "isOptional": [Function],
                "max": [Function],
                "min": [Function],
                "nullable": [Function],
                "nullish": [Function],
                "optional": [Function],
                "or": [Function],
                "parse": [Function],
                "parseAsync": [Function],
                "pipe": [Function],
                "promise": [Function],
                "refine": [Function],
                "refinement": [Function],
                "safeParse": [Function],
                "safeParseAsync": [Function],
                "spa": [Function],
                "step": [Function],
                "superRefine": [Function],
                "transform": [Function],
              },
              ZodNumber {
                "_def": {
                  "checks": [],
                  "coerce": false,
                  "typeName": "ZodNumber",
                },
                "and": [Function],
                "array": [Function],
                "brand": [Function],
                "catch": [Function],
                "default": [Function],
                "describe": [Function],
                "isNullable": [Function],
                "isOptional": [Function],
                "max": [Function],
                "min": [Function],
                "nullable": [Function],
                "nullish": [Function],
                "optional": [Function],
                "or": [Function],
                "parse": [Function],
                "parseAsync": [Function],
                "pipe": [Function],
                "promise": [Function],
                "refine": [Function],
                "refinement": [Function],
                "safeParse": [Function],
                "safeParseAsync": [Function],
                "spa": [Function],
                "step": [Function],
                "superRefine": [Function],
                "transform": [Function],
              },
            ],
            "typeName": "ZodUnion",
          },
          "and": [Function],
          "array": [Function],
          "brand": [Function],
          "catch": [Function],
          "default": [Function],
          "describe": [Function],
          "isNullable": [Function],
          "isOptional": [Function],
          "nullable": [Function],
          "nullish": [Function],
          "optional": [Function],
          "or": [Function],
          "parse": [Function],
          "parseAsync": [Function],
          "pipe": [Function],
          "promise": [Function],
          "refine": [Function],
          "refinement": [Function],
          "safeParse": [Function],
          "safeParseAsync": [Function],
          "spa": [Function],
          "superRefine": [Function],
          "transform": [Function],
        },
        "typeName": "ZodArray",
      },
      "and": [Function],
      "array": [Function],
      "brand": [Function],
      "catch": [Function],
      "default": [Function],
      "describe": [Function],
      "isNullable": [Function],
      "isOptional": [Function],
      "nullable": [Function],
      "nullish": [Function],
      "optional": [Function],
      "or": [Function],
      "parse": [Function],
      "parseAsync": [Function],
      "pipe": [Function],
      "promise": [Function],
      "refine": [Function],
      "refinement": [Function],
      "safeParse": [Function],
      "safeParseAsync": [Function],
      "spa": [Function],
      "superRefine": [Function],
      "transform": [Function],
    }
  `
  )
  expect(await groqToZod(groq`[1,"2"] + ["3",4]`)).toMatchInlineSnapshot(
    `
    ZodArray {
      "_def": {
        "exactLength": null,
        "maxLength": null,
        "minLength": null,
        "type": ZodUnion {
          "_def": {
            "options": [
              ZodNumber {
                "_def": {
                  "checks": [],
                  "coerce": false,
                  "typeName": "ZodNumber",
                },
                "and": [Function],
                "array": [Function],
                "brand": [Function],
                "catch": [Function],
                "default": [Function],
                "describe": [Function],
                "isNullable": [Function],
                "isOptional": [Function],
                "max": [Function],
                "min": [Function],
                "nullable": [Function],
                "nullish": [Function],
                "optional": [Function],
                "or": [Function],
                "parse": [Function],
                "parseAsync": [Function],
                "pipe": [Function],
                "promise": [Function],
                "refine": [Function],
                "refinement": [Function],
                "safeParse": [Function],
                "safeParseAsync": [Function],
                "spa": [Function],
                "step": [Function],
                "superRefine": [Function],
                "transform": [Function],
              },
              ZodString {
                "_def": {
                  "checks": [],
                  "coerce": false,
                  "typeName": "ZodString",
                },
                "_regex": [Function],
                "and": [Function],
                "array": [Function],
                "brand": [Function],
                "catch": [Function],
                "default": [Function],
                "describe": [Function],
                "isNullable": [Function],
                "isOptional": [Function],
                "nonempty": [Function],
                "nullable": [Function],
                "nullish": [Function],
                "optional": [Function],
                "or": [Function],
                "parse": [Function],
                "parseAsync": [Function],
                "pipe": [Function],
                "promise": [Function],
                "refine": [Function],
                "refinement": [Function],
                "safeParse": [Function],
                "safeParseAsync": [Function],
                "spa": [Function],
                "superRefine": [Function],
                "transform": [Function],
                "trim": [Function],
              },
              ZodString {
                "_def": {
                  "checks": [],
                  "coerce": false,
                  "typeName": "ZodString",
                },
                "_regex": [Function],
                "and": [Function],
                "array": [Function],
                "brand": [Function],
                "catch": [Function],
                "default": [Function],
                "describe": [Function],
                "isNullable": [Function],
                "isOptional": [Function],
                "nonempty": [Function],
                "nullable": [Function],
                "nullish": [Function],
                "optional": [Function],
                "or": [Function],
                "parse": [Function],
                "parseAsync": [Function],
                "pipe": [Function],
                "promise": [Function],
                "refine": [Function],
                "refinement": [Function],
                "safeParse": [Function],
                "safeParseAsync": [Function],
                "spa": [Function],
                "superRefine": [Function],
                "transform": [Function],
                "trim": [Function],
              },
              ZodNumber {
                "_def": {
                  "checks": [],
                  "coerce": false,
                  "typeName": "ZodNumber",
                },
                "and": [Function],
                "array": [Function],
                "brand": [Function],
                "catch": [Function],
                "default": [Function],
                "describe": [Function],
                "isNullable": [Function],
                "isOptional": [Function],
                "max": [Function],
                "min": [Function],
                "nullable": [Function],
                "nullish": [Function],
                "optional": [Function],
                "or": [Function],
                "parse": [Function],
                "parseAsync": [Function],
                "pipe": [Function],
                "promise": [Function],
                "refine": [Function],
                "refinement": [Function],
                "safeParse": [Function],
                "safeParseAsync": [Function],
                "spa": [Function],
                "step": [Function],
                "superRefine": [Function],
                "transform": [Function],
              },
            ],
            "typeName": "ZodUnion",
          },
          "and": [Function],
          "array": [Function],
          "brand": [Function],
          "catch": [Function],
          "default": [Function],
          "describe": [Function],
          "isNullable": [Function],
          "isOptional": [Function],
          "nullable": [Function],
          "nullish": [Function],
          "optional": [Function],
          "or": [Function],
          "parse": [Function],
          "parseAsync": [Function],
          "pipe": [Function],
          "promise": [Function],
          "refine": [Function],
          "refinement": [Function],
          "safeParse": [Function],
          "safeParseAsync": [Function],
          "spa": [Function],
          "superRefine": [Function],
          "transform": [Function],
        },
        "typeName": "ZodArray",
      },
      "and": [Function],
      "array": [Function],
      "brand": [Function],
      "catch": [Function],
      "default": [Function],
      "describe": [Function],
      "isNullable": [Function],
      "isOptional": [Function],
      "nullable": [Function],
      "nullish": [Function],
      "optional": [Function],
      "or": [Function],
      "parse": [Function],
      "parseAsync": [Function],
      "pipe": [Function],
      "promise": [Function],
      "refine": [Function],
      "refinement": [Function],
      "safeParse": [Function],
      "safeParseAsync": [Function],
      "spa": [Function],
      "superRefine": [Function],
      "transform": [Function],
    }
  `
  )
  expect(await groqToZod(groq`{"a":1,"b":2} + {"c":3}`)).toMatchInlineSnapshot(
    `
    ZodObject {
      "_cached": null,
      "_def": {
        "catchall": ZodNever {
          "_def": {
            "typeName": "ZodNever",
          },
          "and": [Function],
          "array": [Function],
          "brand": [Function],
          "catch": [Function],
          "default": [Function],
          "describe": [Function],
          "isNullable": [Function],
          "isOptional": [Function],
          "nullable": [Function],
          "nullish": [Function],
          "optional": [Function],
          "or": [Function],
          "parse": [Function],
          "parseAsync": [Function],
          "pipe": [Function],
          "promise": [Function],
          "refine": [Function],
          "refinement": [Function],
          "safeParse": [Function],
          "safeParseAsync": [Function],
          "spa": [Function],
          "superRefine": [Function],
          "transform": [Function],
        },
        "shape": [Function],
        "typeName": "ZodObject",
        "unknownKeys": "strict",
      },
      "and": [Function],
      "array": [Function],
      "augment": [Function],
      "brand": [Function],
      "catch": [Function],
      "default": [Function],
      "describe": [Function],
      "extend": [Function],
      "isNullable": [Function],
      "isOptional": [Function],
      "nonstrict": [Function],
      "nullable": [Function],
      "nullish": [Function],
      "optional": [Function],
      "or": [Function],
      "parse": [Function],
      "parseAsync": [Function],
      "pipe": [Function],
      "promise": [Function],
      "refine": [Function],
      "refinement": [Function],
      "safeParse": [Function],
      "safeParseAsync": [Function],
      "spa": [Function],
      "superRefine": [Function],
      "transform": [Function],
    }
  `
  )
  expect(await groqToZod(groq`{"a":1,"b":2} + {"c":"d"}`))
    .toMatchInlineSnapshot(`
      ZodObject {
        "_cached": null,
        "_def": {
          "catchall": ZodNever {
            "_def": {
              "typeName": "ZodNever",
            },
            "and": [Function],
            "array": [Function],
            "brand": [Function],
            "catch": [Function],
            "default": [Function],
            "describe": [Function],
            "isNullable": [Function],
            "isOptional": [Function],
            "nullable": [Function],
            "nullish": [Function],
            "optional": [Function],
            "or": [Function],
            "parse": [Function],
            "parseAsync": [Function],
            "pipe": [Function],
            "promise": [Function],
            "refine": [Function],
            "refinement": [Function],
            "safeParse": [Function],
            "safeParseAsync": [Function],
            "spa": [Function],
            "superRefine": [Function],
            "transform": [Function],
          },
          "shape": [Function],
          "typeName": "ZodObject",
          "unknownKeys": "strict",
        },
        "and": [Function],
        "array": [Function],
        "augment": [Function],
        "brand": [Function],
        "catch": [Function],
        "default": [Function],
        "describe": [Function],
        "extend": [Function],
        "isNullable": [Function],
        "isOptional": [Function],
        "nonstrict": [Function],
        "nullable": [Function],
        "nullish": [Function],
        "optional": [Function],
        "or": [Function],
        "parse": [Function],
        "parseAsync": [Function],
        "pipe": [Function],
        "promise": [Function],
        "refine": [Function],
        "refinement": [Function],
        "safeParse": [Function],
        "safeParseAsync": [Function],
        "spa": [Function],
        "superRefine": [Function],
        "transform": [Function],
      }
    `)
})
