// schemas/product.js

export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      name: 'desc',
      title: 'Description',
      type: 'text',
    },

    // PRICE VARIANTS
    {
      name: 'priceVariants',
      title: 'Price Variants',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              title: 'Variant Label',
              type: 'string',
              description: 'Example: 1 KG, 4 KG, 20 KG, L8, L15, L30',
            },
            {
              name: 'price',
              title: 'Price',
              type: 'number',
            },
          ],
        },
      ],
    },

    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {source: 'name', maxLength: 96}, // fixed source
    },

    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{type: 'block'}],
    },

    // MULTIPLE IMAGES
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
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
