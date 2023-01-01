/**
 * https://github.com/sanity-io/sanity/blob/d7145405506388e86f2e122e3bdf686f9cbde997/packages/sanity/src/_internal/cli/actions/graphql/types.ts#L151
 * @alpha
 * */
export interface SchemaDefinitionish {
  name: string
  type: string
  fields?: SchemaDefinitionish[]
}

/** @alpha */
export interface TypeResolvedStudioConfig {
  schemaTypes: SchemaDefinitionish[]
}

/**
 * https://github.com/sanity-io/sanity/blob/d7145405506388e86f2e122e3bdf686f9cbde997/packages/sanity/src/core/components/image/Image.tsx#L7
 * @alpha
 */
export interface ImageCrop {
  _type: 'sanity.imageCrop'
  top: number
  bottom: number
  left: number
  right: number
}
/**
 * https://github.com/sanity-io/sanity/blob/d7145405506388e86f2e122e3bdf686f9cbde997/packages/sanity/src/core/components/image/Image.tsx#L15
 * @alpha
 */
export interface ImageHotspot {
  _type: 'sanity.imageHotspot'
  x: number
  y: number
  height: number
  width: number
}
/**
 * https://github.com/sanity-io/sanity/blob/d7145405506388e86f2e122e3bdf686f9cbde997/packages/sanity/src/core/components/image/Image.tsx#L23
 * @alpha
 */
export interface ImageSource {
  _type: 'image'
  asset: {
    _type: 'reference'
    _ref: string
  }
  crop?: ImageCrop
  hotspot?: ImageHotspot
  // Image types can have custom fields
  [key: string]: unknown
}
