import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'

export default defineConfig({
  projectId: 't42bb3h1',
  dataset: 'production',
  plugins: [deskTool()],
  schema: {
    types: [
      {
        name: 'page',
        title: 'Page',
        type: 'document',
        fields: [
          {
            name: 'title',
            title: 'Title',
            type: 'string',
          },
          {
            name: 'category',
            title: 'Category',
            type: 'reference',
            to: { type: 'category' },
          },
        ],
      },
      {
        name: 'category',
        title: 'Category',
        type: 'document',
        fields: [
          {
            name: 'title',
            title: 'Title',
            type: 'string',
          },
          {
            name: 'image',
            title: 'Image',
            type: 'image',
          },
        ],
      },
    ],
  },
})
