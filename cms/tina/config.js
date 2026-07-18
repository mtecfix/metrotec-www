import { defineConfig } from 'tinacms'

export default defineConfig({
  branch: 'main',
  clientId: null,
  token: null,
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: '',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      {
        name: 'page',
        label: 'Pages',
        path: 'content/pages',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'string',
            name: 'slug',
            label: 'Slug',
            required: true,
          },
          {
            type: 'rich-text',
            name: 'content',
            label: 'Content',
            isBody: true,
          },
          {
            type: 'boolean',
            name: 'published',
            label: 'Published',
          },
        ],
      },
      {
        name: 'blog',
        label: 'Blog Posts',
        path: 'content/blog',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'string',
            name: 'slug',
            label: 'Slug',
            required: true,
          },
          {
            type: 'rich-text',
            name: 'content',
            label: 'Content',
            isBody: true,
          },
          {
            type: 'boolean',
            name: 'published',
            label: 'Published',
          },
        ],
      },
    ],
  },
})
