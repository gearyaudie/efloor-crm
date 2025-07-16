export default {
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    {name: 'title', type: 'string', title: 'Title'},
    {name: 'excerpt', type: 'string', title: 'Excerpt'},
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {source: 'title', maxLength: 96},
    },
    {
      name: 'img',
      type: 'image',
      title: 'Main Image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{type: 'block'}],
    },
    {
      name: 'keywords',
      title: 'SEO Keywords',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Comma-separated keywords for SEO (e.g., vinyl, parket, flooring)',
    },
  ],
}
