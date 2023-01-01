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
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      date: 'date',
      media: 'coverImage',
    },
  },
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
  schema: {
    types: schemaTypes,
  },
  plugins: [
    deskTool(),
    visionTool({
      defaultApiVersion: '2022-08-08',
    }),
  ],
})

export default defineConfig([
  {
    name: 'default',
    title: 'Test Studio',
    projectId: 'ppsg7ml5',
    dataset: 'test',
    plugins: [sharedSettings()],
    basePath: '/test',
  },
  {
    name: 'playground',
    title: 'Test Studio',
    subtitle: 'Playground dataset',
    projectId: 'ppsg7ml5',
    dataset: 'playground',
    plugins: [sharedSettings()],
    basePath: '/playground',
  },
])
