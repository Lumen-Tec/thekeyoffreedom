import type { Hit } from "instantsearch.js"

/**
 * Imagen con url y texto alternativo para accesibilidad
 */
export type ProductImage = {
  url: string
  alt: string
}

/**
 * Facetas del producto
 */
export type ProductFacets = {
  color: string[]
  size: string[]
  recommend_use: string[]
  gender: string[]
}

/**
 * Esquema del producto recibido
 */
export type ProductRecord = {
  objectID: string
  title: string
  description: string
  brand: string
  price: number
  currency: string
  categories: string[]
  in_stock: boolean
  stock_quantity: number
  image: ProductImage
  facets: ProductFacets
}

export type ProductHit = Hit<ProductRecord>
