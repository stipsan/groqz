// This file was automatically generated. Edits will be overwritten
import { z } from 'zod'

export interface gen0 {
  query: /* groq */ `*[_type in ["category", "page"]]{..., category->{title}}`
  schema: z.ZodType<
    (
      | {
          title?: (string | undefined) | null
          category?:
            | (
                | {
                    title?: (string | undefined) | null
                  }
                | undefined
              )
            | null
          _type: 'page'
          _id: string
          _rev: string
          _createdAt: string
          _updatedAt: string
        }
      | {
          title?: (string | undefined) | null
          image?:
            | (
                | {
                    _type: 'image'
                    asset?:
                      | (
                          | {
                              _ref?: (string | undefined) | null
                              _type: 'reference'
                            }
                          | undefined
                        )
                      | null
                  }
                | undefined
              )
            | null
          _type: 'category'
          _id: string
          _rev: string
          _createdAt: string
          _updatedAt: string
          category?: import('groqz').Json | undefined
        }
    )[]
  >
}

export interface gen1 {
  query: /* groq */ `*[_type == "category"]{title, _type, "image": image.asset->{url, size}}[0]`
  schema: z.ZodType<{
    title?: (string | undefined) | null
    _type: 'category'
    image?:
      | (
          | {
              url?: (string | undefined) | null
              size?: (number | undefined) | null
            }
          | undefined
        )
      | null
  }>
}

export interface gen2 {
  query: /* groq */ `*[_type == "movie"]`
  schema: z.ZodType<import('groqz').Json[]>
}
