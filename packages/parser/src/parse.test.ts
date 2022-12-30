import groq from 'groq'
import { parse as fullParse } from 'groq-js'
import { expect, test } from 'vitest'

import { parse } from './parse'

test('Filters', () => {
  let query = groq`*`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`*[]`
  expect(parse(query)).toEqual(fullParse(query))

  // _type filters are persisted
  query = groq`*[_type == "movie"]`
  expect(parse(query)).toEqual(fullParse(query))

  // Unrelated filters are replaced with `true`
  expect(parse(groq`*[_id == "abc.123"]`)).toEqual(fullParse(groq`*[true]`))

  query = groq`*[_type in ["movie", "person"]]`
  expect(parse(query)).toEqual(fullParse(query))

  expect(
    parse(
      groq`*[_type == "movie" && popularity > 15 && releaseDate > "2016-04-25"]`
    )
  ).toEqual(fullParse(groq`*[_type == "movie" && true && true]`))
})

test('Text matching', () => {
  expect(parse(groq`"foo bar" match "fo*"`)).toEqual(fullParse(groq`true`))
  expect(parse(groq`*[text match "word"]`)).toEqual(fullParse(groq`*[true]`))
})

test('Slice Operations', () => {
  const query = groq`*[_type == "movie"][0]`
  expect(parse(query)).toEqual(fullParse(query))

  expect(parse(groq`*[_type == "movie"][1]`)).toEqual(
    fullParse(groq`*[_type == "movie"][0]`)
  )

  expect(parse(groq`*[_type == "movie"][0..5]`)).toEqual(
    fullParse(groq`*[_type == "movie"]`)
  )

  expect(parse(groq`*[_type == "movie"]{title}[0...10]`)).toEqual(
    fullParse(groq`*[_type == "movie"]{title}`)
  )

  expect(parse(groq`*[_type == "movie"][0...10]{title}`)).toEqual(
    fullParse(groq`*[_type == "movie"]{title}`)
  )
})

test('Ordering', () => {
  expect(
    parse(
      groq`*[_type == "movie"] | order(releaseDate desc) | order(_createdAt asc)`
    )
  ).toEqual(fullParse(groq`*[_type == "movie"]`))

  expect(parse(groq`*[_type == "person"] | order(name) | {age}`)).toEqual(
    fullParse(groq`*[_type == "person"] | {age}`)
  )

  expect(parse(groq`*[_type == "movie"] | order(_createdAt desc)[0]`)).toEqual(
    fullParse(groq`*[_type == "movie"][0]`)
  )

  expect(
    parse(groq`*[_type == "movie"][0..9] | order(_createdAt asc)`)
  ).toEqual(fullParse(groq`*[_type == "movie"]`))

  // Handle super complex long chain
  expect(
    parse(
      groq`*[_type == "movie"] | order(releaseDate desc) | order(_createdAt asc) | score(body match "jacuzzi") | order(name) | score(body match "jacuzzi", bedrooms > 2, available && !inContract) | {age}`
    )
  ).toEqual(fullParse(groq`*[_type == "movie"]{age}`))
})

test('Joins', () => {
  let query = groq`*[_type=='movie']{title,'cast': castMembers[].person->name}`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`*[_type=='movie']{title,'cast': castMembers[].person->{_id, name}}`
  expect(parse(query)).toEqual(fullParse(query))

  expect(
    parse(
      groq`*[_type=='movie']{title,'cast': castMembers[country == "NO"].person->{_id, name}}`
    )
  ).toEqual(
    fullParse(
      groq`*[_type=='movie']{title,'cast': castMembers[true].person->{_id, name}}`
    )
  )

  expect(
    parse(
      groq`*[_type == "book" && author._ref in *[_type=="author" && name=="John Doe"]._id ]{...}`
    )
  ).toEqual(fullParse(groq`*[_type == "book" && true ]{...}`))
})

test('Objects and Arrays', () => {
  expect(
    parse(groq`{
    // People ordered by Nobel prize year
    "peopleByPrizeYear": *[]|order(prizes[0].year desc){
      "name": firstname + " " + surname,
      "orderYear": prizes[0].year,
      prizes
    },
    // List of all prizes ordered by year awarded
    "allPrizes": *[].prizes[]|order(year desc)
  }`)
  ).toEqual(
    fullParse(groq`{
    "peopleByPrizeYear": *[]{
      "name": firstname + " " + surname,
      "orderYear": prizes[0].year,
      prizes
    },
    "allPrizes": *[].prizes[]
  }`)
  )

  const query = groq`*[].prizes[]`
  expect(parse(query)).toEqual(fullParse(query))
})

test('Object Projections', () => {
  let query = groq`*[_type == 'movie']{_id, _type, title}`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`*[_type == 'movie']{'renamedId': _id, _type, title}`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`*[_type == 'movie'].title`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`*[_type == 'movie']{'characterNames': castMembers[].characterName}`
  expect(parse(query)).toEqual(fullParse(query))

  expect(
    parse(
      groq`*[_type=='movie' && title == 'Arrival']{title,'posterUrl': poster.asset->url}`
    )
  ).toEqual(
    fullParse(
      groq`*[_type=='movie' && true]{title,'posterUrl': poster.asset->url}`
    )
  )

  query = groq`*[_type == 'movie']{...}`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`*[_type == 'movie']{'posterUrl': poster.asset->url, ...}`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`*[_type == 'movie']{..., 'rating': coalesce(rating, 'unknown')}`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`*[_type == 'movie']{"actorCount": count(actors)}`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`*[_type == 'movie']{castMembers[]{characterName, person}}`
  expect(parse(query)).toEqual(fullParse(query))

  expect(
    parse(
      groq`*[_type == 'movie']{castMembers[characterName match 'Ripley']{characterName, person}}`
    )
  ).toEqual(
    fullParse(
      groq`*[_type == 'movie']{castMembers[true]{characterName, person}}`
    )
  )

  query = groq`*[_type == 'book']{authors[]->{name, bio}}`
  expect(parse(query)).toEqual(fullParse(query))

  expect(
    parse(groq`{'threeMovieTitles': *[_type=='movie'][0..2].title}`)
  ).toEqual(fullParse(groq`{'threeMovieTitles': *[_type=='movie'].title}`))

  expect(
    parse(
      groq`{'featuredMovie': *[_type == 'movie' && title == 'Alien'][0], 'scifiMovies': *[_type == 'movie' && 'sci-fi' in genres]}`
    )
  ).toEqual(
    fullParse(
      groq`{'featuredMovie': *[_type == 'movie' && true][0], 'scifiMovies': *[_type == 'movie' && true]}`
    )
  )
})

test('Special variables', () => {
  expect(parse(groq`*[ @["1"] ]`)).toEqual(fullParse(groq`*[ @["1"] ]`))
  expect(parse(groq`*[ @[$prop]._ref == $refId ]`)).toEqual(
    fullParse(groq`*[true]`)
  )

  let query = groq`*{"arraySizes": arrays[]{"size": count(@)}}`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`*[_type=="person"]{
      name,
      "relatedMovies": *[_type=='movie' && references(^._id)]{ title }
    }`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`*[_type=="person"]{
    name,
    "relatedMovies": *[_type=='movie' && references(^._id)]{ title }
  }`
  expect(parse(query)).toEqual(fullParse(query))
})

test('Conditionals', () => {
  expect(
    parse(groq`*[_type=='movie']{..., "popularity": select(
    popularity > 20 => "high",
    popularity > 10 => "medium",
    popularity <= 10 => "low"
  )}`)
  ).toEqual(
    fullParse(groq`*[_type=='movie']{..., "popularity": select(
    true => "high",
    true => "medium",
    true => "low"
  )}`)
  )

  expect(
    parse(groq`*[_type=='movie']{..., "popularity": select(
    popularity > 20 => "high",
    popularity > 10 => "medium",
    "low"
  )}`)
  ).toEqual(
    fullParse(groq`*[_type=='movie']{..., "popularity": select(
    true => "high",
    true => "medium",
    "low"
  )}`)
  )

  expect(
    parse(groq`*[_type=='movie']{
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
  ).toEqual(
    fullParse(groq`*[_type=='movie']{
    ...,
    true => {
      "screenings": *[_type == 'screening' && true],
      "news": *[_type == 'news' && true],
    },
    true && true => {
      "featured": true,
      "awards": *[_type == 'award' && true],
    },
  }`)
  )

  expect(
    parse(groq`*[_type=='movie']{
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
  ).toEqual(
    fullParse(groq`*[_type=='movie']{
    ...,
    ...select(true => {
      "screenings": *[_type == 'screening' && true],
      "news": *[_type == 'news' && true],
    }),
    ...select(true && true => {
      "featured": true,
      "awards": *[_type == 'award' && true],
    }),
  }`)
  )

  const query = groq`content[]{
    _type == 'type1' => {
      // Your selection of fields for type1
    },
    _type == 'type2' => {
      // Your selection of fields for type2
      "url": file.asset->url // Use joins to get data of referenced document
    }
  }`
  expect(parse(query)).toEqual(fullParse(query))
})

test('Functions', () => {
  let query = groq`*[references("person_sigourney-weaver")]{title}`
  expect(parse(query)).toEqual(fullParse(query))

  expect(
    parse(
      groq`*[_type=="movie" && references(*[_type=="person" && age > 99]._id)]{title}`
    )
  ).toEqual(
    fullParse(
      groq`*[_type=="movie" && references(*[_type=="person" && true]._id)]{title}`
    )
  )

  query = groq`*[defined(tags)]`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`*{"title": coalesce(title.fi, title.en)}`
  expect(parse(query)).toEqual(fullParse(query))

  expect(parse(groq`count(*[_type == 'movie' && rating == 'R'])`)).toEqual(
    fullParse(groq`count(*[_type == 'movie' && true])`)
  )

  query = groq`*[_type == 'movie']{
    title, 
    "actorCount": count(actors) // Counts the number of elements in the array actors
  }`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`round(3.14)`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`round(3.14, 1)`
  expect(parse(query)).toEqual(fullParse(query))

  expect(
    parse(groq`*[_type == "post"] 
  | score(description match "GROQ") 
  | order(_score desc) 
  { _score, title }`)
  ).toEqual(fullParse(groq`*[_type == "post"] { _score, title }`))

  query = groq`array::unique(*._type)`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`*[_type == "post"] 
  { "plaintextBody": pt::text(body) }`
  expect(parse(query)).toEqual(fullParse(query))
})

test('Arithmetic and Concatenation', () => {
  let query = groq`1 + 2`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`"abc" + "def"`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`[1,2] + [3,4]`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`{"a":1,"b":2} + {"c":3}`
  expect(parse(query)).toEqual(fullParse(query))
})

test('Advanced', () => {
  expect(
    parse(groq`*[_type == "person"] {
    firstName, lastName
  } | order(firstName + " " + lastName)`)
  ).toEqual(
    fullParse(groq`*[_type == "person"] {
    firstName, lastName
  }`)
  )

  expect(
    parse(groq`*[_type == "person"] {
    _id, parent,
    "siblings": *[_type == ^._type && parent._ref == ^._id] 
  }`)
  ).toEqual(
    fullParse(groq`*[_type == "person"] {
    _id, parent,
    "siblings": *[_type == ^._type && true] 
  }`)
  )

  expect(parse(groq`* { _id, "draft": *[_id == "drafts." + ^._id] }`)).toEqual(
    fullParse(groq`* { _id, "draft": *[true] }`)
  )

  let query = groq`count(*[_type == "person" && isPublished])`
  expect(parse(query)).toEqual(fullParse(query))

  expect(
    parse(
      groq`count(*[_type == "person" && (firstName + " " + lastName) == "Ronald McDonald"])`
    )
  ).toEqual(fullParse(groq`count(*[_type == "person" && true])`))

  expect(parse(groq`* | order(name)`)).toEqual(fullParse(groq`*`))

  query = groq`*[_type == "category"] {
    title,
    parent->
  }`
  expect(parse(query)).toEqual(fullParse(query))

  expect(
    parse(groq`*[_type == "category"] {
    title,
    "parent": *[_id == ^.parent._ref][0] 
  }`)
  ).toEqual(
    fullParse(groq`*[_type == "category"] {
    title,
    "parent": *[true][0] 
  }`)
  )

  query = groq`*[_type == "category"] {
    title,
    "slug": slug.current,
    "parentTitle": parent->title, 
    "parentSlug": parent->slug.current
  }`
  expect(parse(query)).toEqual(fullParse(query))

  query = groq`*[_type == "category"] {
    title,
    "slug": slug.current,
    ...(parent-> {
      "parentTitle": title,
      "parentSlug": slug.current
    }) 
  }`
  expect(parse(query)).toEqual(fullParse(query))

  expect(
    parse(groq`*[_type == "product" && defined(salePrice) && salePrice < displayPrice]{
    ...,
    categories[]->
  }`)
  ).toEqual(
    fullParse(groq`*[_type == "product" && defined(salePrice) && true]{
    ...,
    categories[]->
  }`)
  )

  expect(
    parse(groq`*[_type == "product" && defined(salePrice) && salePrice < displayPrice]{
    title,
    salePrice,
    displayPrice,
    "categories": categories[]->title
  }`)
  ).toEqual(
    fullParse(groq`*[_type == "product" && defined(salePrice) && true]{
    title,
    salePrice,
    displayPrice,
    "categories": categories[]->title
  }`)
  )
})
