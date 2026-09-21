// schemas/b2bProject.ts

export default {
  name: 'b2bProject',
  title: 'B2B Project',
  type: 'document',
  fields: [
    {
      name: 'type',
      title: 'Type',
      type: 'string',
      description: 'Category, e.g. Procurement, Project Needs, Supply Toko',
    },
    {
      name: 'namaBarang',
      title: 'Nama Barang',
      type: 'string',
    },
    {
      name: 'namaPT',
      title: 'Nama PT / Client',
      type: 'string',
    },
    {
      name: 'quantity',
      title: 'Quantity',
      type: 'string',
    },
    {
      name: 'tanggal',
      title: 'Tanggal',
      type: 'date',
    },
    {
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
  ],
  orderings: [
    {
      title: 'Tanggal, Newest',
      name: 'tanggalDesc',
      by: [{field: 'tanggal', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'namaPT',
      subtitle: 'namaBarang',
      media: 'photo',
    },
  },
}
