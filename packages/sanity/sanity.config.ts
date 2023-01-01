/* eslint-disable @typescript-eslint/no-explicit-any */
import { visionTool } from '@sanity/vision'
import {
  defineArrayMember,
  defineConfig,
  defineField,
  definePlugin,
  defineType,
} from 'sanity'
import { deskTool } from 'sanity/desk'

const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'picture',
      title: 'Picture',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
  ],
})

const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'caption',
          title: 'Caption',
          type: 'string',
          options: { isHighlighted: true },
        },
      ],
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: author.name }],
    }),
  ],
})

const settings = defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  preview: { select: { title: 'title', subtitle: 'description' } },
  fields: [
    defineField({
      name: 'title',
      description: 'This field is the title of your blog.',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      description:
        'Used both for the <meta> description tag for SEO, and the blog subheader.',
      title: 'Descriprion',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          options: {},
          styles: [],
          lists: [],
          marks: {
            decorators: [],
            annotations: [
              defineField({
                type: 'object',
                name: 'link',
                fields: [
                  {
                    type: 'string',
                    name: 'href',
                    title: 'URL',
                    validation: (rule) => rule.required(),
                  },
                ],
              }),
            ],
          },
        }),
      ],
      validation: (rule) => rule.max(155).required(),
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      description:
        'Used for social media previews when linking to the index page.',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
        }),
      ],
    }),
  ],
})

const schemaTypes = [author, post, settings]

const sharedSettings = definePlugin({
  name: 'sharedSettings',
  plugins: [
    deskTool(),
    visionTool({
      defaultApiVersion: '2022-08-08',
    }),
  ],
})

const example = defineType({
  name: 'example',
  title: 'Example',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'exampleReference1',
      type: 'reference',
      to: defineType({ name: 'example', type: 'example' }) as any,
    }),
    defineField({
      name: 'exampleReference2',
      type: 'reference',
      to: [defineType({ name: 'example', type: 'example' }) as any],
    }),
    defineField({
      name: 'exampleReference3',
      type: 'reference',
      weak: true as any,
      to: [defineType({ name: 'example', type: 'example' }) as any],
    }),
  ],
})

const everything = [example]

export default defineConfig([
  {
    name: 'default',
    title: 'Test Studio',
    projectId: 't42bb3h1',
    dataset: 'production',
    plugins: [sharedSettings()],
    basePath: '/test',
    schema: {
      types: schemaTypes,
    },
  },
  {
    name: 'everything',
    title: 'Test Studio',
    subtitle: 'Everything dataset',
    projectId: 't42bb3h1',
    dataset: 'production',
    plugins: [sharedSettings()],
    basePath: '/everything',
    schema: {
      types: everything,
    },
  },
])
