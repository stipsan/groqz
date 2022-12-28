import { expect, it } from 'vitest'
import { parse } from './parse'
import { parse as fullParse } from 'groq-js'
import groq from 'groq'

it('Filters', () => {
  expect(fullParse(groq`*`)).toMatchInlineSnapshot(`
    {
      "type": "Everything",
    }
  `)
  expect(fullParse(groq`*[]`)).toMatchInlineSnapshot(`
    {
      "base": {
        "type": "Everything",
      },
      "type": "ArrayCoerce",
    }
  `)
  expect(fullParse(groq`*[_type == "movie"]`)).toMatchInlineSnapshot(`
    {
      "base": {
        "type": "Everything",
      },
      "expr": {
        "left": {
          "name": "_type",
          "type": "AccessAttribute",
        },
        "op": "==",
        "right": {
          "type": "Value",
          "value": "movie",
        },
        "type": "OpCall",
      },
      "type": "Filter",
    }
  `)
  expect(fullParse(groq`*[_id == "abc.123"]`)).toMatchInlineSnapshot(`
    {
      "base": {
        "type": "Everything",
      },
      "expr": {
        "left": {
          "name": "_id",
          "type": "AccessAttribute",
        },
        "op": "==",
        "right": {
          "type": "Value",
          "value": "abc.123",
        },
        "type": "OpCall",
      },
      "type": "Filter",
    }
  `)
  expect(
    fullParse(groq`*[_type in ["movie", "person"]]`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "type": "Everything",
      },
      "expr": {
        "left": {
          "name": "_type",
          "type": "AccessAttribute",
        },
        "op": "in",
        "right": {
          "elements": [
            {
              "isSplat": false,
              "type": "ArrayElement",
              "value": {
                "type": "Value",
                "value": "movie",
              },
            },
            {
              "isSplat": false,
              "type": "ArrayElement",
              "value": {
                "type": "Value",
                "value": "person",
              },
            },
          ],
          "type": "Array",
        },
        "type": "OpCall",
      },
      "type": "Filter",
    }
  `)
  expect(
    fullParse(
      groq`*[_type == "movie" && popularity > 15 && releaseDate > "2016-04-25"]`
    )
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "type": "Everything",
      },
      "expr": {
        "left": {
          "left": {
            "left": {
              "name": "_type",
              "type": "AccessAttribute",
            },
            "op": "==",
            "right": {
              "type": "Value",
              "value": "movie",
            },
            "type": "OpCall",
          },
          "right": {
            "left": {
              "name": "popularity",
              "type": "AccessAttribute",
            },
            "op": ">",
            "right": {
              "type": "Value",
              "value": 15,
            },
            "type": "OpCall",
          },
          "type": "And",
        },
        "right": {
          "left": {
            "name": "releaseDate",
            "type": "AccessAttribute",
          },
          "op": ">",
          "right": {
            "type": "Value",
            "value": "2016-04-25",
          },
          "type": "OpCall",
        },
        "type": "And",
      },
      "type": "Filter",
    }
  `)
})

it('Text matching', () => {
  expect(fullParse(groq`*[text match "word"]`)).toMatchInlineSnapshot(`
    {
      "base": {
        "type": "Everything",
      },
      "expr": {
        "left": {
          "name": "text",
          "type": "AccessAttribute",
        },
        "op": "match",
        "right": {
          "type": "Value",
          "value": "word",
        },
        "type": "OpCall",
      },
      "type": "Filter",
    }
  `)
  expect(fullParse(groq`"foo bar" match "fo*"`)).toMatchInlineSnapshot(`
    {
      "left": {
        "type": "Value",
        "value": "foo bar",
      },
      "op": "match",
      "right": {
        "type": "Value",
        "value": "fo*",
      },
      "type": "OpCall",
    }
  `)
})

it('Slice Operations', () => {
  expect(fullParse(groq`*[_type == "movie"][0]`)).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "index": 0,
      "type": "AccessElement",
    }
  `)
  expect(fullParse(groq`*[_type == "movie"][0..5]`)).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "isInclusive": true,
      "left": 0,
      "right": 5,
      "type": "Slice",
    }
  `)
  expect(
    fullParse(groq`*[_type == "movie"]{title}[0...10]`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "base": {
            "type": "Everything",
          },
          "expr": {
            "left": {
              "name": "_type",
              "type": "AccessAttribute",
            },
            "op": "==",
            "right": {
              "type": "Value",
              "value": "movie",
            },
            "type": "OpCall",
          },
          "type": "Filter",
        },
        "expr": {
          "base": {
            "type": "This",
          },
          "expr": {
            "attributes": [
              {
                "name": "title",
                "type": "ObjectAttributeValue",
                "value": {
                  "name": "title",
                  "type": "AccessAttribute",
                },
              },
            ],
            "type": "Object",
          },
          "type": "Projection",
        },
        "type": "Map",
      },
      "isInclusive": false,
      "left": 0,
      "right": 10,
      "type": "Slice",
    }
  `)
  expect(
    fullParse(groq`*[_type == "movie"][0...10]{title}`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "base": {
            "type": "Everything",
          },
          "expr": {
            "left": {
              "name": "_type",
              "type": "AccessAttribute",
            },
            "op": "==",
            "right": {
              "type": "Value",
              "value": "movie",
            },
            "type": "OpCall",
          },
          "type": "Filter",
        },
        "isInclusive": false,
        "left": 0,
        "right": 10,
        "type": "Slice",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "title",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "title",
                "type": "AccessAttribute",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
})

it('Ordering', () => {
  expect(
    fullParse(
      groq`*[_type == "movie"] | order(releaseDate desc) | order(_createdAt asc)`
    )
  ).toMatchInlineSnapshot(`
    {
      "args": [
        {
          "base": {
            "name": "_createdAt",
            "type": "AccessAttribute",
          },
          "type": "Asc",
        },
      ],
      "base": {
        "args": [
          {
            "base": {
              "name": "releaseDate",
              "type": "AccessAttribute",
            },
            "type": "Desc",
          },
        ],
        "base": {
          "base": {
            "type": "Everything",
          },
          "expr": {
            "left": {
              "name": "_type",
              "type": "AccessAttribute",
            },
            "op": "==",
            "right": {
              "type": "Value",
              "value": "movie",
            },
            "type": "OpCall",
          },
          "type": "Filter",
        },
        "func": [Function],
        "name": "order",
        "type": "PipeFuncCall",
      },
      "func": [Function],
      "name": "order",
      "type": "PipeFuncCall",
    }
  `)
  expect(
    fullParse(groq`*[_type == "movie"] | order(_createdAt desc)[0]`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "args": [
          {
            "base": {
              "name": "_createdAt",
              "type": "AccessAttribute",
            },
            "type": "Desc",
          },
        ],
        "base": {
          "base": {
            "type": "Everything",
          },
          "expr": {
            "left": {
              "name": "_type",
              "type": "AccessAttribute",
            },
            "op": "==",
            "right": {
              "type": "Value",
              "value": "movie",
            },
            "type": "OpCall",
          },
          "type": "Filter",
        },
        "func": [Function],
        "name": "order",
        "type": "PipeFuncCall",
      },
      "index": 0,
      "type": "AccessElement",
    }
  `)
  expect(
    fullParse(groq`*[_type == "movie"][0..9] | order(_createdAt asc)`)
  ).toMatchInlineSnapshot(`
    {
      "args": [
        {
          "base": {
            "name": "_createdAt",
            "type": "AccessAttribute",
          },
          "type": "Asc",
        },
      ],
      "base": {
        "base": {
          "base": {
            "type": "Everything",
          },
          "expr": {
            "left": {
              "name": "_type",
              "type": "AccessAttribute",
            },
            "op": "==",
            "right": {
              "type": "Value",
              "value": "movie",
            },
            "type": "OpCall",
          },
          "type": "Filter",
        },
        "isInclusive": true,
        "left": 0,
        "right": 9,
        "type": "Slice",
      },
      "func": [Function],
      "name": "order",
      "type": "PipeFuncCall",
    }
  `)
  expect(
    fullParse(groq`*[_type == "movie"] | order(_createdAt asc) [$start..$end]`)
  ).toMatchInlineSnapshot()
})

it('Joins', () => {
  expect(
    fullParse(groq`*[_type=='movie']{title,'cast': castMembers[].person->name}`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "title",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "title",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "cast",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "base": {
                    "name": "castMembers",
                    "type": "AccessAttribute",
                  },
                  "type": "ArrayCoerce",
                },
                "expr": {
                  "base": {
                    "base": {
                      "base": {
                        "type": "This",
                      },
                      "name": "person",
                      "type": "AccessAttribute",
                    },
                    "type": "Deref",
                  },
                  "name": "name",
                  "type": "AccessAttribute",
                },
                "type": "Map",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)

  expect(
    fullParse(
      groq`*[_type=='movie']{title,'cast': castMembers[].person->{_id, name}}`
    )
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "title",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "title",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "cast",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "base": {
                    "name": "castMembers",
                    "type": "AccessAttribute",
                  },
                  "type": "ArrayCoerce",
                },
                "expr": {
                  "base": {
                    "base": {
                      "base": {
                        "type": "This",
                      },
                      "name": "person",
                      "type": "AccessAttribute",
                    },
                    "type": "Deref",
                  },
                  "expr": {
                    "attributes": [
                      {
                        "name": "_id",
                        "type": "ObjectAttributeValue",
                        "value": {
                          "name": "_id",
                          "type": "AccessAttribute",
                        },
                      },
                      {
                        "name": "name",
                        "type": "ObjectAttributeValue",
                        "value": {
                          "name": "name",
                          "type": "AccessAttribute",
                        },
                      },
                    ],
                    "type": "Object",
                  },
                  "type": "Projection",
                },
                "type": "Map",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)

  expect(
    fullParse(
      groq`*[_type == "book" && author._ref in *[_type=="author" && name=="John Doe"]._id ]{...}`
    )
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "left": {
              "name": "_type",
              "type": "AccessAttribute",
            },
            "op": "==",
            "right": {
              "type": "Value",
              "value": "book",
            },
            "type": "OpCall",
          },
          "right": {
            "left": {
              "base": {
                "name": "author",
                "type": "AccessAttribute",
              },
              "name": "_ref",
              "type": "AccessAttribute",
            },
            "op": "in",
            "right": {
              "base": {
                "base": {
                  "type": "Everything",
                },
                "expr": {
                  "left": {
                    "left": {
                      "name": "_type",
                      "type": "AccessAttribute",
                    },
                    "op": "==",
                    "right": {
                      "type": "Value",
                      "value": "author",
                    },
                    "type": "OpCall",
                  },
                  "right": {
                    "left": {
                      "name": "name",
                      "type": "AccessAttribute",
                    },
                    "op": "==",
                    "right": {
                      "type": "Value",
                      "value": "John Doe",
                    },
                    "type": "OpCall",
                  },
                  "type": "And",
                },
                "type": "Filter",
              },
              "expr": {
                "base": {
                  "type": "This",
                },
                "name": "_id",
                "type": "AccessAttribute",
              },
              "type": "Map",
            },
            "type": "OpCall",
          },
          "type": "And",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "type": "ObjectSplat",
              "value": {
                "type": "This",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
})

it('Objects and Arrays', () => {
  expect(
    fullParse(groq`{
    // People ordered by Nobel prize year
    "peopleByPrizeYear": *[]|order(prizes[0].year desc){
      "name": firstname + " " + surname,
      "orderYear": prizes[0].year,
      prizes
    },
    // List of all prizes ordered by year awarded
    "allPrizes": *[].prizes[]|order(year desc)
  }`)
  ).toMatchInlineSnapshot(`
    {
      "attributes": [
        {
          "name": "peopleByPrizeYear",
          "type": "ObjectAttributeValue",
          "value": {
            "base": {
              "args": [
                {
                  "base": {
                    "base": {
                      "base": {
                        "name": "prizes",
                        "type": "AccessAttribute",
                      },
                      "index": 0,
                      "type": "AccessElement",
                    },
                    "name": "year",
                    "type": "AccessAttribute",
                  },
                  "type": "Desc",
                },
              ],
              "base": {
                "base": {
                  "type": "Everything",
                },
                "type": "ArrayCoerce",
              },
              "func": [Function],
              "name": "order",
              "type": "PipeFuncCall",
            },
            "expr": {
              "base": {
                "type": "This",
              },
              "expr": {
                "attributes": [
                  {
                    "name": "name",
                    "type": "ObjectAttributeValue",
                    "value": {
                      "left": {
                        "left": {
                          "name": "firstname",
                          "type": "AccessAttribute",
                        },
                        "op": "+",
                        "right": {
                          "type": "Value",
                          "value": " ",
                        },
                        "type": "OpCall",
                      },
                      "op": "+",
                      "right": {
                        "name": "surname",
                        "type": "AccessAttribute",
                      },
                      "type": "OpCall",
                    },
                  },
                  {
                    "name": "orderYear",
                    "type": "ObjectAttributeValue",
                    "value": {
                      "base": {
                        "base": {
                          "name": "prizes",
                          "type": "AccessAttribute",
                        },
                        "index": 0,
                        "type": "AccessElement",
                      },
                      "name": "year",
                      "type": "AccessAttribute",
                    },
                  },
                  {
                    "name": "prizes",
                    "type": "ObjectAttributeValue",
                    "value": {
                      "name": "prizes",
                      "type": "AccessAttribute",
                    },
                  },
                ],
                "type": "Object",
              },
              "type": "Projection",
            },
            "type": "Map",
          },
        },
        {
          "name": "allPrizes",
          "type": "ObjectAttributeValue",
          "value": {
            "args": [
              {
                "base": {
                  "name": "year",
                  "type": "AccessAttribute",
                },
                "type": "Desc",
              },
            ],
            "base": {
              "base": {
                "base": {
                  "type": "Everything",
                },
                "type": "ArrayCoerce",
              },
              "expr": {
                "base": {
                  "base": {
                    "type": "This",
                  },
                  "name": "prizes",
                  "type": "AccessAttribute",
                },
                "type": "ArrayCoerce",
              },
              "type": "FlatMap",
            },
            "func": [Function],
            "name": "order",
            "type": "PipeFuncCall",
          },
        },
      ],
      "type": "Object",
    }
  `)

  expect(fullParse(groq`*[].prizes[]`)).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "type": "ArrayCoerce",
      },
      "expr": {
        "base": {
          "base": {
            "type": "This",
          },
          "name": "prizes",
          "type": "AccessAttribute",
        },
        "type": "ArrayCoerce",
      },
      "type": "FlatMap",
    }
  `)
})

it('Object Projections', () => {
  expect(
    fullParse(groq`*[_type == 'movie']{_id, _type, title}`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "_id",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "_id",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "_type",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "_type",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "title",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "title",
                "type": "AccessAttribute",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`*[_type == 'movie']{'renamedId': _id, _type, title}`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "renamedId",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "_id",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "_type",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "_type",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "title",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "title",
                "type": "AccessAttribute",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(fullParse(groq`*[_type == 'movie'].title`)).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "name": "title",
        "type": "AccessAttribute",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(
      groq`*[_type == 'movie']{'characterNames': castMembers[].characterName}`
    )
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "characterNames",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "base": {
                    "name": "castMembers",
                    "type": "AccessAttribute",
                  },
                  "type": "ArrayCoerce",
                },
                "expr": {
                  "base": {
                    "type": "This",
                  },
                  "name": "characterName",
                  "type": "AccessAttribute",
                },
                "type": "Map",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(
      groq`*[_type=='movie' && title == 'Arrival']{title,'posterUrl': poster.asset->url}`
    )
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "left": {
              "name": "_type",
              "type": "AccessAttribute",
            },
            "op": "==",
            "right": {
              "type": "Value",
              "value": "movie",
            },
            "type": "OpCall",
          },
          "right": {
            "left": {
              "name": "title",
              "type": "AccessAttribute",
            },
            "op": "==",
            "right": {
              "type": "Value",
              "value": "Arrival",
            },
            "type": "OpCall",
          },
          "type": "And",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "title",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "title",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "posterUrl",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "base": {
                    "base": {
                      "name": "poster",
                      "type": "AccessAttribute",
                    },
                    "name": "asset",
                    "type": "AccessAttribute",
                  },
                  "type": "Deref",
                },
                "name": "url",
                "type": "AccessAttribute",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(fullParse(groq`*[_type == 'movie']{...}`)).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "type": "ObjectSplat",
              "value": {
                "type": "This",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`*[_type == 'movie']{'posterUrl': poster.asset->url, ...}`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "posterUrl",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "base": {
                    "base": {
                      "name": "poster",
                      "type": "AccessAttribute",
                    },
                    "name": "asset",
                    "type": "AccessAttribute",
                  },
                  "type": "Deref",
                },
                "name": "url",
                "type": "AccessAttribute",
              },
            },
            {
              "type": "ObjectSplat",
              "value": {
                "type": "This",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(
      groq`*[_type == 'movie']{..., 'rating': coalesce(rating, 'unknown')}`
    )
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "type": "ObjectSplat",
              "value": {
                "type": "This",
              },
            },
            {
              "name": "rating",
              "type": "ObjectAttributeValue",
              "value": {
                "args": [
                  {
                    "name": "rating",
                    "type": "AccessAttribute",
                  },
                  {
                    "type": "Value",
                    "value": "unknown",
                  },
                ],
                "func": [Function],
                "name": "coalesce",
                "type": "FuncCall",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`*[_type == 'movie']{"actorCount": count(actors)}`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "actorCount",
              "type": "ObjectAttributeValue",
              "value": {
                "args": [
                  {
                    "name": "actors",
                    "type": "AccessAttribute",
                  },
                ],
                "func": [Function],
                "name": "count",
                "type": "FuncCall",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`*[_type == 'movie']{castMembers[]{characterName, person}}`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "castMembers",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "base": {
                    "name": "castMembers",
                    "type": "AccessAttribute",
                  },
                  "type": "ArrayCoerce",
                },
                "expr": {
                  "base": {
                    "type": "This",
                  },
                  "expr": {
                    "attributes": [
                      {
                        "name": "characterName",
                        "type": "ObjectAttributeValue",
                        "value": {
                          "name": "characterName",
                          "type": "AccessAttribute",
                        },
                      },
                      {
                        "name": "person",
                        "type": "ObjectAttributeValue",
                        "value": {
                          "name": "person",
                          "type": "AccessAttribute",
                        },
                      },
                    ],
                    "type": "Object",
                  },
                  "type": "Projection",
                },
                "type": "Map",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(
      groq`*[_type == 'movie']{castMembers[characterName match 'Ripley']{characterName, person}}`
    )
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "castMembers",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "base": {
                    "name": "castMembers",
                    "type": "AccessAttribute",
                  },
                  "expr": {
                    "left": {
                      "name": "characterName",
                      "type": "AccessAttribute",
                    },
                    "op": "match",
                    "right": {
                      "type": "Value",
                      "value": "Ripley",
                    },
                    "type": "OpCall",
                  },
                  "type": "Filter",
                },
                "expr": {
                  "base": {
                    "type": "This",
                  },
                  "expr": {
                    "attributes": [
                      {
                        "name": "characterName",
                        "type": "ObjectAttributeValue",
                        "value": {
                          "name": "characterName",
                          "type": "AccessAttribute",
                        },
                      },
                      {
                        "name": "person",
                        "type": "ObjectAttributeValue",
                        "value": {
                          "name": "person",
                          "type": "AccessAttribute",
                        },
                      },
                    ],
                    "type": "Object",
                  },
                  "type": "Projection",
                },
                "type": "Map",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`*[_type == 'book']{authors[]->{name, bio}}`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "book",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "authors",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "base": {
                    "name": "authors",
                    "type": "AccessAttribute",
                  },
                  "type": "ArrayCoerce",
                },
                "expr": {
                  "base": {
                    "base": {
                      "type": "This",
                    },
                    "type": "Deref",
                  },
                  "expr": {
                    "attributes": [
                      {
                        "name": "name",
                        "type": "ObjectAttributeValue",
                        "value": {
                          "name": "name",
                          "type": "AccessAttribute",
                        },
                      },
                      {
                        "name": "bio",
                        "type": "ObjectAttributeValue",
                        "value": {
                          "name": "bio",
                          "type": "AccessAttribute",
                        },
                      },
                    ],
                    "type": "Object",
                  },
                  "type": "Projection",
                },
                "type": "Map",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`{'threeMovieTitles': *[_type=='movie'][0..2].title}`)
  ).toMatchInlineSnapshot(`
    {
      "attributes": [
        {
          "name": "threeMovieTitles",
          "type": "ObjectAttributeValue",
          "value": {
            "base": {
              "base": {
                "base": {
                  "type": "Everything",
                },
                "expr": {
                  "left": {
                    "name": "_type",
                    "type": "AccessAttribute",
                  },
                  "op": "==",
                  "right": {
                    "type": "Value",
                    "value": "movie",
                  },
                  "type": "OpCall",
                },
                "type": "Filter",
              },
              "isInclusive": true,
              "left": 0,
              "right": 2,
              "type": "Slice",
            },
            "expr": {
              "base": {
                "type": "This",
              },
              "name": "title",
              "type": "AccessAttribute",
            },
            "type": "Map",
          },
        },
      ],
      "type": "Object",
    }
  `)
  expect(
    fullParse(
      groq`{'featuredMovie': *[_type == 'movie' && title == 'Alien'][0], 'scifiMovies': *[_type == 'movie' && 'sci-fi' in genres]}`
    )
  ).toMatchInlineSnapshot(`
    {
      "attributes": [
        {
          "name": "featuredMovie",
          "type": "ObjectAttributeValue",
          "value": {
            "base": {
              "base": {
                "type": "Everything",
              },
              "expr": {
                "left": {
                  "left": {
                    "name": "_type",
                    "type": "AccessAttribute",
                  },
                  "op": "==",
                  "right": {
                    "type": "Value",
                    "value": "movie",
                  },
                  "type": "OpCall",
                },
                "right": {
                  "left": {
                    "name": "title",
                    "type": "AccessAttribute",
                  },
                  "op": "==",
                  "right": {
                    "type": "Value",
                    "value": "Alien",
                  },
                  "type": "OpCall",
                },
                "type": "And",
              },
              "type": "Filter",
            },
            "index": 0,
            "type": "AccessElement",
          },
        },
        {
          "name": "scifiMovies",
          "type": "ObjectAttributeValue",
          "value": {
            "base": {
              "type": "Everything",
            },
            "expr": {
              "left": {
                "left": {
                  "name": "_type",
                  "type": "AccessAttribute",
                },
                "op": "==",
                "right": {
                  "type": "Value",
                  "value": "movie",
                },
                "type": "OpCall",
              },
              "right": {
                "left": {
                  "type": "Value",
                  "value": "sci-fi",
                },
                "op": "in",
                "right": {
                  "name": "genres",
                  "type": "AccessAttribute",
                },
                "type": "OpCall",
              },
              "type": "And",
            },
            "type": "Filter",
          },
        },
      ],
      "type": "Object",
    }
  `)
})

it('Special variables', () => {
  expect(fullParse(groq`*[ @["1"] ]`)).toMatchInlineSnapshot(`
    {
      "base": {
        "type": "Everything",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "name": "1",
        "type": "AccessAttribute",
      },
      "type": "Filter",
    }
  `)
  expect(fullParse(groq`*[ @[$prop]._ref == $refId ]`)).toMatchInlineSnapshot(`
    {
      "base": {
        "type": "Everything",
      },
      "expr": {
        "left": {
          "base": {
            "base": {
              "type": "This",
            },
            "expr": {
              "name": "prop",
              "type": "Parameter",
            },
            "type": "Filter",
          },
          "expr": {
            "base": {
              "type": "This",
            },
            "name": "_ref",
            "type": "AccessAttribute",
          },
          "type": "Map",
        },
        "op": "==",
        "right": {
          "name": "refId",
          "type": "Parameter",
        },
        "type": "OpCall",
      },
      "type": "Filter",
    }
  `)
  expect(
    fullParse(groq`*{"arraySizes": arrays[]{"size": count(@)}}`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "type": "Everything",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "arraySizes",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "base": {
                    "name": "arrays",
                    "type": "AccessAttribute",
                  },
                  "type": "ArrayCoerce",
                },
                "expr": {
                  "base": {
                    "type": "This",
                  },
                  "expr": {
                    "attributes": [
                      {
                        "name": "size",
                        "type": "ObjectAttributeValue",
                        "value": {
                          "args": [
                            {
                              "type": "This",
                            },
                          ],
                          "func": [Function],
                          "name": "count",
                          "type": "FuncCall",
                        },
                      },
                    ],
                    "type": "Object",
                  },
                  "type": "Projection",
                },
                "type": "Map",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`*[_type=="person"]{
    name,
    "relatedMovies": *[_type=='movie' && references(^._id)]{ title }
  }`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "person",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "name",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "name",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "relatedMovies",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "base": {
                    "type": "Everything",
                  },
                  "expr": {
                    "left": {
                      "left": {
                        "name": "_type",
                        "type": "AccessAttribute",
                      },
                      "op": "==",
                      "right": {
                        "type": "Value",
                        "value": "movie",
                      },
                      "type": "OpCall",
                    },
                    "right": {
                      "args": [
                        {
                          "base": {
                            "n": 1,
                            "type": "Parent",
                          },
                          "name": "_id",
                          "type": "AccessAttribute",
                        },
                      ],
                      "func": [Function],
                      "name": "references",
                      "type": "FuncCall",
                    },
                    "type": "And",
                  },
                  "type": "Filter",
                },
                "expr": {
                  "base": {
                    "type": "This",
                  },
                  "expr": {
                    "attributes": [
                      {
                        "name": "title",
                        "type": "ObjectAttributeValue",
                        "value": {
                          "name": "title",
                          "type": "AccessAttribute",
                        },
                      },
                    ],
                    "type": "Object",
                  },
                  "type": "Projection",
                },
                "type": "Map",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
})

it('Conditionals', () => {
  expect(
    fullParse(groq`*[_type=='movie']{..., "popularity": select(
    popularity > 20 => "high",
    popularity > 10 => "medium",
    popularity <= 10 => "low"
  )}`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "type": "ObjectSplat",
              "value": {
                "type": "This",
              },
            },
            {
              "name": "popularity",
              "type": "ObjectAttributeValue",
              "value": {
                "alternatives": [
                  {
                    "condition": {
                      "left": {
                        "name": "popularity",
                        "type": "AccessAttribute",
                      },
                      "op": ">",
                      "right": {
                        "type": "Value",
                        "value": 20,
                      },
                      "type": "OpCall",
                    },
                    "type": "SelectAlternative",
                    "value": {
                      "type": "Value",
                      "value": "high",
                    },
                  },
                  {
                    "condition": {
                      "left": {
                        "name": "popularity",
                        "type": "AccessAttribute",
                      },
                      "op": ">",
                      "right": {
                        "type": "Value",
                        "value": 10,
                      },
                      "type": "OpCall",
                    },
                    "type": "SelectAlternative",
                    "value": {
                      "type": "Value",
                      "value": "medium",
                    },
                  },
                  {
                    "condition": {
                      "left": {
                        "name": "popularity",
                        "type": "AccessAttribute",
                      },
                      "op": "<=",
                      "right": {
                        "type": "Value",
                        "value": 10,
                      },
                      "type": "OpCall",
                    },
                    "type": "SelectAlternative",
                    "value": {
                      "type": "Value",
                      "value": "low",
                    },
                  },
                ],
                "type": "Select",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`*[_type=='movie']{..., "popularity": select(
    popularity > 20 => "high",
    popularity > 10 => "medium",
    "low"
  )}`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "type": "ObjectSplat",
              "value": {
                "type": "This",
              },
            },
            {
              "name": "popularity",
              "type": "ObjectAttributeValue",
              "value": {
                "alternatives": [
                  {
                    "condition": {
                      "left": {
                        "name": "popularity",
                        "type": "AccessAttribute",
                      },
                      "op": ">",
                      "right": {
                        "type": "Value",
                        "value": 20,
                      },
                      "type": "OpCall",
                    },
                    "type": "SelectAlternative",
                    "value": {
                      "type": "Value",
                      "value": "high",
                    },
                  },
                  {
                    "condition": {
                      "left": {
                        "name": "popularity",
                        "type": "AccessAttribute",
                      },
                      "op": ">",
                      "right": {
                        "type": "Value",
                        "value": 10,
                      },
                      "type": "OpCall",
                    },
                    "type": "SelectAlternative",
                    "value": {
                      "type": "Value",
                      "value": "medium",
                    },
                  },
                ],
                "fallback": {
                  "type": "Value",
                  "value": "low",
                },
                "type": "Select",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`*[_type=='movie']{
    ...,
    releaseDate >= '2018-06-01' => {
      "screenings": *[_type == 'screening' && movie._ref == ^._id],
      "news": *[_type == 'news' && movie._ref == ^._id],
    },
    popularity > 20 && rating > 7.0 => {
      "featured": true,
      "awards": *[_type == 'award' && movie._ref == ^._id],
    },
  }`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "type": "ObjectSplat",
              "value": {
                "type": "This",
              },
            },
            {
              "condition": {
                "left": {
                  "name": "releaseDate",
                  "type": "AccessAttribute",
                },
                "op": ">=",
                "right": {
                  "type": "Value",
                  "value": "2018-06-01",
                },
                "type": "OpCall",
              },
              "type": "ObjectConditionalSplat",
              "value": {
                "attributes": [
                  {
                    "name": "screenings",
                    "type": "ObjectAttributeValue",
                    "value": {
                      "base": {
                        "type": "Everything",
                      },
                      "expr": {
                        "left": {
                          "left": {
                            "name": "_type",
                            "type": "AccessAttribute",
                          },
                          "op": "==",
                          "right": {
                            "type": "Value",
                            "value": "screening",
                          },
                          "type": "OpCall",
                        },
                        "right": {
                          "left": {
                            "base": {
                              "name": "movie",
                              "type": "AccessAttribute",
                            },
                            "name": "_ref",
                            "type": "AccessAttribute",
                          },
                          "op": "==",
                          "right": {
                            "base": {
                              "n": 1,
                              "type": "Parent",
                            },
                            "name": "_id",
                            "type": "AccessAttribute",
                          },
                          "type": "OpCall",
                        },
                        "type": "And",
                      },
                      "type": "Filter",
                    },
                  },
                  {
                    "name": "news",
                    "type": "ObjectAttributeValue",
                    "value": {
                      "base": {
                        "type": "Everything",
                      },
                      "expr": {
                        "left": {
                          "left": {
                            "name": "_type",
                            "type": "AccessAttribute",
                          },
                          "op": "==",
                          "right": {
                            "type": "Value",
                            "value": "news",
                          },
                          "type": "OpCall",
                        },
                        "right": {
                          "left": {
                            "base": {
                              "name": "movie",
                              "type": "AccessAttribute",
                            },
                            "name": "_ref",
                            "type": "AccessAttribute",
                          },
                          "op": "==",
                          "right": {
                            "base": {
                              "n": 1,
                              "type": "Parent",
                            },
                            "name": "_id",
                            "type": "AccessAttribute",
                          },
                          "type": "OpCall",
                        },
                        "type": "And",
                      },
                      "type": "Filter",
                    },
                  },
                ],
                "type": "Object",
              },
            },
            {
              "condition": {
                "left": {
                  "left": {
                    "name": "popularity",
                    "type": "AccessAttribute",
                  },
                  "op": ">",
                  "right": {
                    "type": "Value",
                    "value": 20,
                  },
                  "type": "OpCall",
                },
                "right": {
                  "left": {
                    "name": "rating",
                    "type": "AccessAttribute",
                  },
                  "op": ">",
                  "right": {
                    "type": "Value",
                    "value": 7,
                  },
                  "type": "OpCall",
                },
                "type": "And",
              },
              "type": "ObjectConditionalSplat",
              "value": {
                "attributes": [
                  {
                    "name": "featured",
                    "type": "ObjectAttributeValue",
                    "value": {
                      "type": "Value",
                      "value": true,
                    },
                  },
                  {
                    "name": "awards",
                    "type": "ObjectAttributeValue",
                    "value": {
                      "base": {
                        "type": "Everything",
                      },
                      "expr": {
                        "left": {
                          "left": {
                            "name": "_type",
                            "type": "AccessAttribute",
                          },
                          "op": "==",
                          "right": {
                            "type": "Value",
                            "value": "award",
                          },
                          "type": "OpCall",
                        },
                        "right": {
                          "left": {
                            "base": {
                              "name": "movie",
                              "type": "AccessAttribute",
                            },
                            "name": "_ref",
                            "type": "AccessAttribute",
                          },
                          "op": "==",
                          "right": {
                            "base": {
                              "n": 1,
                              "type": "Parent",
                            },
                            "name": "_id",
                            "type": "AccessAttribute",
                          },
                          "type": "OpCall",
                        },
                        "type": "And",
                      },
                      "type": "Filter",
                    },
                  },
                ],
                "type": "Object",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`*[_type=='movie']{
    ...,
    ...select(releaseDate >= '2018-06-01' => {
      "screenings": *[_type == 'screening' && movie._ref == ^._id],
      "news": *[_type == 'news' && movie._ref == ^._id],
    }),
    ...select(popularity > 20 && rating > 7.0 => {
      "featured": true,
      "awards": *[_type == 'award' && movie._ref == ^._id],
    }),
  }`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "type": "ObjectSplat",
              "value": {
                "type": "This",
              },
            },
            {
              "type": "ObjectSplat",
              "value": {
                "alternatives": [
                  {
                    "condition": {
                      "left": {
                        "name": "releaseDate",
                        "type": "AccessAttribute",
                      },
                      "op": ">=",
                      "right": {
                        "type": "Value",
                        "value": "2018-06-01",
                      },
                      "type": "OpCall",
                    },
                    "type": "SelectAlternative",
                    "value": {
                      "attributes": [
                        {
                          "name": "screenings",
                          "type": "ObjectAttributeValue",
                          "value": {
                            "base": {
                              "type": "Everything",
                            },
                            "expr": {
                              "left": {
                                "left": {
                                  "name": "_type",
                                  "type": "AccessAttribute",
                                },
                                "op": "==",
                                "right": {
                                  "type": "Value",
                                  "value": "screening",
                                },
                                "type": "OpCall",
                              },
                              "right": {
                                "left": {
                                  "base": {
                                    "name": "movie",
                                    "type": "AccessAttribute",
                                  },
                                  "name": "_ref",
                                  "type": "AccessAttribute",
                                },
                                "op": "==",
                                "right": {
                                  "base": {
                                    "n": 1,
                                    "type": "Parent",
                                  },
                                  "name": "_id",
                                  "type": "AccessAttribute",
                                },
                                "type": "OpCall",
                              },
                              "type": "And",
                            },
                            "type": "Filter",
                          },
                        },
                        {
                          "name": "news",
                          "type": "ObjectAttributeValue",
                          "value": {
                            "base": {
                              "type": "Everything",
                            },
                            "expr": {
                              "left": {
                                "left": {
                                  "name": "_type",
                                  "type": "AccessAttribute",
                                },
                                "op": "==",
                                "right": {
                                  "type": "Value",
                                  "value": "news",
                                },
                                "type": "OpCall",
                              },
                              "right": {
                                "left": {
                                  "base": {
                                    "name": "movie",
                                    "type": "AccessAttribute",
                                  },
                                  "name": "_ref",
                                  "type": "AccessAttribute",
                                },
                                "op": "==",
                                "right": {
                                  "base": {
                                    "n": 1,
                                    "type": "Parent",
                                  },
                                  "name": "_id",
                                  "type": "AccessAttribute",
                                },
                                "type": "OpCall",
                              },
                              "type": "And",
                            },
                            "type": "Filter",
                          },
                        },
                      ],
                      "type": "Object",
                    },
                  },
                ],
                "type": "Select",
              },
            },
            {
              "type": "ObjectSplat",
              "value": {
                "alternatives": [
                  {
                    "condition": {
                      "left": {
                        "left": {
                          "name": "popularity",
                          "type": "AccessAttribute",
                        },
                        "op": ">",
                        "right": {
                          "type": "Value",
                          "value": 20,
                        },
                        "type": "OpCall",
                      },
                      "right": {
                        "left": {
                          "name": "rating",
                          "type": "AccessAttribute",
                        },
                        "op": ">",
                        "right": {
                          "type": "Value",
                          "value": 7,
                        },
                        "type": "OpCall",
                      },
                      "type": "And",
                    },
                    "type": "SelectAlternative",
                    "value": {
                      "attributes": [
                        {
                          "name": "featured",
                          "type": "ObjectAttributeValue",
                          "value": {
                            "type": "Value",
                            "value": true,
                          },
                        },
                        {
                          "name": "awards",
                          "type": "ObjectAttributeValue",
                          "value": {
                            "base": {
                              "type": "Everything",
                            },
                            "expr": {
                              "left": {
                                "left": {
                                  "name": "_type",
                                  "type": "AccessAttribute",
                                },
                                "op": "==",
                                "right": {
                                  "type": "Value",
                                  "value": "award",
                                },
                                "type": "OpCall",
                              },
                              "right": {
                                "left": {
                                  "base": {
                                    "name": "movie",
                                    "type": "AccessAttribute",
                                  },
                                  "name": "_ref",
                                  "type": "AccessAttribute",
                                },
                                "op": "==",
                                "right": {
                                  "base": {
                                    "n": 1,
                                    "type": "Parent",
                                  },
                                  "name": "_id",
                                  "type": "AccessAttribute",
                                },
                                "type": "OpCall",
                              },
                              "type": "And",
                            },
                            "type": "Filter",
                          },
                        },
                      ],
                      "type": "Object",
                    },
                  },
                ],
                "type": "Select",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`content[]{
  _type == 'type1' => {
    // Your selection of fields for type1
  },
  _type == 'type2' => {
    // Your selection of fields for type2
    "url": file.asset->url // Use joins to get data of referenced document
  }
}`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "name": "content",
          "type": "AccessAttribute",
        },
        "type": "ArrayCoerce",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "condition": {
                "left": {
                  "name": "_type",
                  "type": "AccessAttribute",
                },
                "op": "==",
                "right": {
                  "type": "Value",
                  "value": "type1",
                },
                "type": "OpCall",
              },
              "type": "ObjectConditionalSplat",
              "value": {
                "attributes": [],
                "type": "Object",
              },
            },
            {
              "condition": {
                "left": {
                  "name": "_type",
                  "type": "AccessAttribute",
                },
                "op": "==",
                "right": {
                  "type": "Value",
                  "value": "type2",
                },
                "type": "OpCall",
              },
              "type": "ObjectConditionalSplat",
              "value": {
                "attributes": [
                  {
                    "name": "url",
                    "type": "ObjectAttributeValue",
                    "value": {
                      "base": {
                        "base": {
                          "base": {
                            "name": "file",
                            "type": "AccessAttribute",
                          },
                          "name": "asset",
                          "type": "AccessAttribute",
                        },
                        "type": "Deref",
                      },
                      "name": "url",
                      "type": "AccessAttribute",
                    },
                  },
                ],
                "type": "Object",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`'content': content[]{
  _type == 'reference' => @->,
  _type != 'reference' => @,
}`)
  ).toMatchInlineSnapshot()
})

it('Functions', () => {
  expect(
    fullParse(groq`*[references("person_sigourney-weaver")]{title}`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "args": [
            {
              "type": "Value",
              "value": "person_sigourney-weaver",
            },
          ],
          "func": [Function],
          "name": "references",
          "type": "FuncCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "title",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "title",
                "type": "AccessAttribute",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(
      groq`*[_type=="movie" && references(*[_type=="person" && age > 99]._id)]{title}`
    )
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "left": {
              "name": "_type",
              "type": "AccessAttribute",
            },
            "op": "==",
            "right": {
              "type": "Value",
              "value": "movie",
            },
            "type": "OpCall",
          },
          "right": {
            "args": [
              {
                "base": {
                  "base": {
                    "type": "Everything",
                  },
                  "expr": {
                    "left": {
                      "left": {
                        "name": "_type",
                        "type": "AccessAttribute",
                      },
                      "op": "==",
                      "right": {
                        "type": "Value",
                        "value": "person",
                      },
                      "type": "OpCall",
                    },
                    "right": {
                      "left": {
                        "name": "age",
                        "type": "AccessAttribute",
                      },
                      "op": ">",
                      "right": {
                        "type": "Value",
                        "value": 99,
                      },
                      "type": "OpCall",
                    },
                    "type": "And",
                  },
                  "type": "Filter",
                },
                "expr": {
                  "base": {
                    "type": "This",
                  },
                  "name": "_id",
                  "type": "AccessAttribute",
                },
                "type": "Map",
              },
            ],
            "func": [Function],
            "name": "references",
            "type": "FuncCall",
          },
          "type": "And",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "title",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "title",
                "type": "AccessAttribute",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(fullParse(groq`*[defined(tags)]`)).toMatchInlineSnapshot(`
    {
      "base": {
        "type": "Everything",
      },
      "expr": {
        "args": [
          {
            "name": "tags",
            "type": "AccessAttribute",
          },
        ],
        "func": [Function],
        "name": "defined",
        "type": "FuncCall",
      },
      "type": "Filter",
    }
  `)
  expect(
    fullParse(groq`*{"title": coalesce(title.fi, title.en)}`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "type": "Everything",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "title",
              "type": "ObjectAttributeValue",
              "value": {
                "args": [
                  {
                    "base": {
                      "name": "title",
                      "type": "AccessAttribute",
                    },
                    "name": "fi",
                    "type": "AccessAttribute",
                  },
                  {
                    "base": {
                      "name": "title",
                      "type": "AccessAttribute",
                    },
                    "name": "en",
                    "type": "AccessAttribute",
                  },
                ],
                "func": [Function],
                "name": "coalesce",
                "type": "FuncCall",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`count(*[_type == 'movie' && rating == 'R'])`)
  ).toMatchInlineSnapshot(`
    {
      "args": [
        {
          "base": {
            "type": "Everything",
          },
          "expr": {
            "left": {
              "left": {
                "name": "_type",
                "type": "AccessAttribute",
              },
              "op": "==",
              "right": {
                "type": "Value",
                "value": "movie",
              },
              "type": "OpCall",
            },
            "right": {
              "left": {
                "name": "rating",
                "type": "AccessAttribute",
              },
              "op": "==",
              "right": {
                "type": "Value",
                "value": "R",
              },
              "type": "OpCall",
            },
            "type": "And",
          },
          "type": "Filter",
        },
      ],
      "func": [Function],
      "name": "count",
      "type": "FuncCall",
    }
  `)
  expect(
    fullParse(groq`*[_type == 'movie']{
    title, 
    "actorCount": count(actors) // Counts the number of elements in the array actors
  }`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "movie",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "title",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "title",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "actorCount",
              "type": "ObjectAttributeValue",
              "value": {
                "args": [
                  {
                    "name": "actors",
                    "type": "AccessAttribute",
                  },
                ],
                "func": [Function],
                "name": "count",
                "type": "FuncCall",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(fullParse(groq`round(3.14)`)).toMatchInlineSnapshot(`
    {
      "args": [
        {
          "type": "Value",
          "value": 3.14,
        },
      ],
      "func": [Function],
      "name": "round",
      "type": "FuncCall",
    }
  `)
  expect(fullParse(groq`round(3.14, 1)`)).toMatchInlineSnapshot(`
    {
      "args": [
        {
          "type": "Value",
          "value": 3.14,
        },
        {
          "type": "Value",
          "value": 1,
        },
      ],
      "func": [Function],
      "name": "round",
      "type": "FuncCall",
    }
  `)
  expect(
    fullParse(groq`*[_type == "post"] 
  | score(description match "GROQ") 
  | order(_score desc) 
  { _score, title }`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "args": [
          {
            "base": {
              "name": "_score",
              "type": "AccessAttribute",
            },
            "type": "Desc",
          },
        ],
        "base": {
          "args": [
            {
              "left": {
                "name": "description",
                "type": "AccessAttribute",
              },
              "op": "match",
              "right": {
                "type": "Value",
                "value": "GROQ",
              },
              "type": "OpCall",
            },
          ],
          "base": {
            "base": {
              "type": "Everything",
            },
            "expr": {
              "left": {
                "name": "_type",
                "type": "AccessAttribute",
              },
              "op": "==",
              "right": {
                "type": "Value",
                "value": "post",
              },
              "type": "OpCall",
            },
            "type": "Filter",
          },
          "func": [Function],
          "name": "score",
          "type": "PipeFuncCall",
        },
        "func": [Function],
        "name": "order",
        "type": "PipeFuncCall",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "_score",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "_score",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "title",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "title",
                "type": "AccessAttribute",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(fullParse(groq`array::unique(*._type)`)).toMatchInlineSnapshot(`
    {
      "args": [
        {
          "base": {
            "type": "Everything",
          },
          "expr": {
            "base": {
              "type": "This",
            },
            "name": "_type",
            "type": "AccessAttribute",
          },
          "type": "Map",
        },
      ],
      "func": [Function],
      "name": "unique",
      "type": "FuncCall",
    }
  `)
  expect(
    fullParse(groq`*[_type == "post"] 
  { "plaintextBody": pt::text(body) }`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "post",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "plaintextBody",
              "type": "ObjectAttributeValue",
              "value": {
                "args": [
                  {
                    "name": "body",
                    "type": "AccessAttribute",
                  },
                ],
                "func": [Function],
                "name": "text",
                "type": "FuncCall",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
})

it('Arithmetic and Concatenation', () => {
  const numberAdd = groq`1 + 2`
  expect(fullParse(numberAdd)).toMatchInlineSnapshot(`
    {
      "left": {
        "type": "Value",
        "value": 1,
      },
      "op": "+",
      "right": {
        "type": "Value",
        "value": 2,
      },
      "type": "OpCall",
    }
  `)

  const stringAdd = groq`"abc" + "def"`
  expect(fullParse(stringAdd)).toMatchInlineSnapshot(`
    {
      "left": {
        "type": "Value",
        "value": "abc",
      },
      "op": "+",
      "right": {
        "type": "Value",
        "value": "def",
      },
      "type": "OpCall",
    }
  `)

  const arrayAdd = groq`[1,2] + [3,4]`
  expect(fullParse(arrayAdd)).toMatchInlineSnapshot(`
    {
      "left": {
        "elements": [
          {
            "isSplat": false,
            "type": "ArrayElement",
            "value": {
              "type": "Value",
              "value": 1,
            },
          },
          {
            "isSplat": false,
            "type": "ArrayElement",
            "value": {
              "type": "Value",
              "value": 2,
            },
          },
        ],
        "type": "Array",
      },
      "op": "+",
      "right": {
        "elements": [
          {
            "isSplat": false,
            "type": "ArrayElement",
            "value": {
              "type": "Value",
              "value": 3,
            },
          },
          {
            "isSplat": false,
            "type": "ArrayElement",
            "value": {
              "type": "Value",
              "value": 4,
            },
          },
        ],
        "type": "Array",
      },
      "type": "OpCall",
    }
  `)

  const objectAdd = groq`{"a":1,"b":2} + {"c":3}`
  expect(fullParse(objectAdd)).toMatchInlineSnapshot(`
    {
      "left": {
        "attributes": [
          {
            "name": "a",
            "type": "ObjectAttributeValue",
            "value": {
              "type": "Value",
              "value": 1,
            },
          },
          {
            "name": "b",
            "type": "ObjectAttributeValue",
            "value": {
              "type": "Value",
              "value": 2,
            },
          },
        ],
        "type": "Object",
      },
      "op": "+",
      "right": {
        "attributes": [
          {
            "name": "c",
            "type": "ObjectAttributeValue",
            "value": {
              "type": "Value",
              "value": 3,
            },
          },
        ],
        "type": "Object",
      },
      "type": "OpCall",
    }
  `)
})

it('Advanced', () => {
  expect(
    fullParse(groq`*[_type == "person"] {
    firstName, lastName
  } | order(firstName + " " + lastName)`)
  ).toMatchInlineSnapshot(`
    {
      "args": [
        {
          "left": {
            "left": {
              "name": "firstName",
              "type": "AccessAttribute",
            },
            "op": "+",
            "right": {
              "type": "Value",
              "value": " ",
            },
            "type": "OpCall",
          },
          "op": "+",
          "right": {
            "name": "lastName",
            "type": "AccessAttribute",
          },
          "type": "OpCall",
        },
      ],
      "base": {
        "base": {
          "base": {
            "type": "Everything",
          },
          "expr": {
            "left": {
              "name": "_type",
              "type": "AccessAttribute",
            },
            "op": "==",
            "right": {
              "type": "Value",
              "value": "person",
            },
            "type": "OpCall",
          },
          "type": "Filter",
        },
        "expr": {
          "base": {
            "type": "This",
          },
          "expr": {
            "attributes": [
              {
                "name": "firstName",
                "type": "ObjectAttributeValue",
                "value": {
                  "name": "firstName",
                  "type": "AccessAttribute",
                },
              },
              {
                "name": "lastName",
                "type": "ObjectAttributeValue",
                "value": {
                  "name": "lastName",
                  "type": "AccessAttribute",
                },
              },
            ],
            "type": "Object",
          },
          "type": "Projection",
        },
        "type": "Map",
      },
      "func": [Function],
      "name": "order",
      "type": "PipeFuncCall",
    }
  `)
  expect(
    fullParse(groq`*[_type == "person"] {
    _id, parent,
    "siblings": *[_type == ^._type && parent._ref == ^._id] 
  }`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "person",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "_id",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "_id",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "parent",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "parent",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "siblings",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "type": "Everything",
                },
                "expr": {
                  "left": {
                    "left": {
                      "name": "_type",
                      "type": "AccessAttribute",
                    },
                    "op": "==",
                    "right": {
                      "base": {
                        "n": 1,
                        "type": "Parent",
                      },
                      "name": "_type",
                      "type": "AccessAttribute",
                    },
                    "type": "OpCall",
                  },
                  "right": {
                    "left": {
                      "base": {
                        "name": "parent",
                        "type": "AccessAttribute",
                      },
                      "name": "_ref",
                      "type": "AccessAttribute",
                    },
                    "op": "==",
                    "right": {
                      "base": {
                        "n": 1,
                        "type": "Parent",
                      },
                      "name": "_id",
                      "type": "AccessAttribute",
                    },
                    "type": "OpCall",
                  },
                  "type": "And",
                },
                "type": "Filter",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`* { _id, "draft": *[_id == "drafts." + ^._id] }`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "type": "Everything",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "_id",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "_id",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "draft",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "type": "Everything",
                },
                "expr": {
                  "left": {
                    "name": "_id",
                    "type": "AccessAttribute",
                  },
                  "op": "==",
                  "right": {
                    "left": {
                      "type": "Value",
                      "value": "drafts.",
                    },
                    "op": "+",
                    "right": {
                      "base": {
                        "n": 1,
                        "type": "Parent",
                      },
                      "name": "_id",
                      "type": "AccessAttribute",
                    },
                    "type": "OpCall",
                  },
                  "type": "OpCall",
                },
                "type": "Filter",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`count(*[_type == "person" && isPublished])`)
  ).toMatchInlineSnapshot(`
    {
      "args": [
        {
          "base": {
            "type": "Everything",
          },
          "expr": {
            "left": {
              "left": {
                "name": "_type",
                "type": "AccessAttribute",
              },
              "op": "==",
              "right": {
                "type": "Value",
                "value": "person",
              },
              "type": "OpCall",
            },
            "right": {
              "name": "isPublished",
              "type": "AccessAttribute",
            },
            "type": "And",
          },
          "type": "Filter",
        },
      ],
      "func": [Function],
      "name": "count",
      "type": "FuncCall",
    }
  `)
  expect(
    fullParse(
      groq`count(*[_type == "person" && (firstName + " " + lastName) == "Ronald McDonald"])`
    )
  ).toMatchInlineSnapshot(`
    {
      "args": [
        {
          "base": {
            "type": "Everything",
          },
          "expr": {
            "left": {
              "left": {
                "name": "_type",
                "type": "AccessAttribute",
              },
              "op": "==",
              "right": {
                "type": "Value",
                "value": "person",
              },
              "type": "OpCall",
            },
            "right": {
              "left": {
                "base": {
                  "left": {
                    "left": {
                      "name": "firstName",
                      "type": "AccessAttribute",
                    },
                    "op": "+",
                    "right": {
                      "type": "Value",
                      "value": " ",
                    },
                    "type": "OpCall",
                  },
                  "op": "+",
                  "right": {
                    "name": "lastName",
                    "type": "AccessAttribute",
                  },
                  "type": "OpCall",
                },
                "type": "Group",
              },
              "op": "==",
              "right": {
                "type": "Value",
                "value": "Ronald McDonald",
              },
              "type": "OpCall",
            },
            "type": "And",
          },
          "type": "Filter",
        },
      ],
      "func": [Function],
      "name": "count",
      "type": "FuncCall",
    }
  `)
  expect(fullParse(groq`* | order(name)`)).toMatchInlineSnapshot(`
    {
      "args": [
        {
          "name": "name",
          "type": "AccessAttribute",
        },
      ],
      "base": {
        "type": "Everything",
      },
      "func": [Function],
      "name": "order",
      "type": "PipeFuncCall",
    }
  `)
  expect(
    fullParse(groq`*[_type == "category"] {
    title,
    parent->
  }`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "category",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "title",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "title",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "parent",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "name": "parent",
                  "type": "AccessAttribute",
                },
                "type": "Deref",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`*[_type == "category"] {
    title,
    "parent": *[_id == ^.parent._ref][0] 
  }`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "category",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "title",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "title",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "parent",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "base": {
                    "type": "Everything",
                  },
                  "expr": {
                    "left": {
                      "name": "_id",
                      "type": "AccessAttribute",
                    },
                    "op": "==",
                    "right": {
                      "base": {
                        "base": {
                          "n": 1,
                          "type": "Parent",
                        },
                        "name": "parent",
                        "type": "AccessAttribute",
                      },
                      "name": "_ref",
                      "type": "AccessAttribute",
                    },
                    "type": "OpCall",
                  },
                  "type": "Filter",
                },
                "index": 0,
                "type": "AccessElement",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`*[_type == "category"] {
    title,
    "slug": slug.current,
    "parentTitle": parent->title, 
    "parentSlug": parent->slug.current
  }`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "category",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "title",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "title",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "slug",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "name": "slug",
                  "type": "AccessAttribute",
                },
                "name": "current",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "parentTitle",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "base": {
                    "name": "parent",
                    "type": "AccessAttribute",
                  },
                  "type": "Deref",
                },
                "name": "title",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "parentSlug",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "base": {
                    "base": {
                      "name": "parent",
                      "type": "AccessAttribute",
                    },
                    "type": "Deref",
                  },
                  "name": "slug",
                  "type": "AccessAttribute",
                },
                "name": "current",
                "type": "AccessAttribute",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`*[_type == "category"] {
    title,
    "slug": slug.current,
    ...(parent-> {
      "parentTitle": title,
      "parentSlug": slug.current
    }) 
  }`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "name": "_type",
            "type": "AccessAttribute",
          },
          "op": "==",
          "right": {
            "type": "Value",
            "value": "category",
          },
          "type": "OpCall",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "title",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "title",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "slug",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "name": "slug",
                  "type": "AccessAttribute",
                },
                "name": "current",
                "type": "AccessAttribute",
              },
            },
            {
              "type": "ObjectSplat",
              "value": {
                "base": {
                  "base": {
                    "base": {
                      "name": "parent",
                      "type": "AccessAttribute",
                    },
                    "type": "Deref",
                  },
                  "expr": {
                    "attributes": [
                      {
                        "name": "parentTitle",
                        "type": "ObjectAttributeValue",
                        "value": {
                          "name": "title",
                          "type": "AccessAttribute",
                        },
                      },
                      {
                        "name": "parentSlug",
                        "type": "ObjectAttributeValue",
                        "value": {
                          "base": {
                            "name": "slug",
                            "type": "AccessAttribute",
                          },
                          "name": "current",
                          "type": "AccessAttribute",
                        },
                      },
                    ],
                    "type": "Object",
                  },
                  "type": "Projection",
                },
                "type": "Group",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`*[_type == "product" && defined(salePrice) && salePrice < displayPrice]{
    ...,
    categories[]->
  }`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "left": {
              "left": {
                "name": "_type",
                "type": "AccessAttribute",
              },
              "op": "==",
              "right": {
                "type": "Value",
                "value": "product",
              },
              "type": "OpCall",
            },
            "right": {
              "args": [
                {
                  "name": "salePrice",
                  "type": "AccessAttribute",
                },
              ],
              "func": [Function],
              "name": "defined",
              "type": "FuncCall",
            },
            "type": "And",
          },
          "right": {
            "left": {
              "name": "salePrice",
              "type": "AccessAttribute",
            },
            "op": "<",
            "right": {
              "name": "displayPrice",
              "type": "AccessAttribute",
            },
            "type": "OpCall",
          },
          "type": "And",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "type": "ObjectSplat",
              "value": {
                "type": "This",
              },
            },
            {
              "name": "categories",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "base": {
                    "name": "categories",
                    "type": "AccessAttribute",
                  },
                  "type": "ArrayCoerce",
                },
                "expr": {
                  "base": {
                    "type": "This",
                  },
                  "type": "Deref",
                },
                "type": "Map",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
  expect(
    fullParse(groq`*[_type == "product" && defined(salePrice) && salePrice < displayPrice]{
    title,
    salePrice,
    displayPrice,
    "categories": categories[]->title
  }`)
  ).toMatchInlineSnapshot(`
    {
      "base": {
        "base": {
          "type": "Everything",
        },
        "expr": {
          "left": {
            "left": {
              "left": {
                "name": "_type",
                "type": "AccessAttribute",
              },
              "op": "==",
              "right": {
                "type": "Value",
                "value": "product",
              },
              "type": "OpCall",
            },
            "right": {
              "args": [
                {
                  "name": "salePrice",
                  "type": "AccessAttribute",
                },
              ],
              "func": [Function],
              "name": "defined",
              "type": "FuncCall",
            },
            "type": "And",
          },
          "right": {
            "left": {
              "name": "salePrice",
              "type": "AccessAttribute",
            },
            "op": "<",
            "right": {
              "name": "displayPrice",
              "type": "AccessAttribute",
            },
            "type": "OpCall",
          },
          "type": "And",
        },
        "type": "Filter",
      },
      "expr": {
        "base": {
          "type": "This",
        },
        "expr": {
          "attributes": [
            {
              "name": "title",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "title",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "salePrice",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "salePrice",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "displayPrice",
              "type": "ObjectAttributeValue",
              "value": {
                "name": "displayPrice",
                "type": "AccessAttribute",
              },
            },
            {
              "name": "categories",
              "type": "ObjectAttributeValue",
              "value": {
                "base": {
                  "base": {
                    "name": "categories",
                    "type": "AccessAttribute",
                  },
                  "type": "ArrayCoerce",
                },
                "expr": {
                  "base": {
                    "base": {
                      "type": "This",
                    },
                    "type": "Deref",
                  },
                  "name": "title",
                  "type": "AccessAttribute",
                },
                "type": "Map",
              },
            },
          ],
          "type": "Object",
        },
        "type": "Projection",
      },
      "type": "Map",
    }
  `)
})
