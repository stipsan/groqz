// Based on https://github.com/sanity-io/sanity/blob/d7145405506388e86f2e122e3bdf686f9cbde997/packages/sanity/src/_internal/cli/actions/graphql/extractFromSanitySchema.ts

import type { Json } from '@groqz/json'
import {
  ArrayDefinition,
  DocumentDefinition,
  File,
  FileDefinition,
  ImageDefinition,
  ObjectDefinition,
  Reference,
  ReferenceDefinition,
  Schema as CompiledSchema,
  SchemaTypeDefinition,
} from '@sanity/types'

import type { ImageSource } from './types'

// Mocked IDs that have special treatment for whatever reason
const mockedIds = {
  imageAsset: 'image-7a450942c7845e53e1daddaffc2999f719352e16-3024x4032-jpg',
  fileAsset: 'file-0174669801cd7fc18dd98943e892ace59b3ce693-zip',
}

/** @alpha */
export async function extractFromSanitySchema(sanitySchema: CompiledSchema) {
  return JSON.parse(
    JSON.stringify(sanitySchema, (key, value) => {
      console.log(key, value)

      if (typeof value !== 'object') {
        return value
      }

      if (key === '') {
        return value._original.types.filter(
          (type: SchemaTypeDefinition) => type.type === 'document'
        )
      }

      if (value?.type === 'document') {
        return extractDocumentDefinition(value, sanitySchema)
      }

      return value
    })
  )
}

function extractDocumentDefinition(
  def: SchemaTypeDefinition<'document'>,
  sanitySchema: CompiledSchema
) {
  // @TODO auto gen _rev
  const result: Record<string, Json> = {
    _type: def.name,
    _id: def.name === 'sanity.imageAsset' ? mockedIds.imageAsset : def.name,
    _rev: 'cmQvgZcsUwgFEQbM1tdhoF',
    _createdAt: '2021-03-01T07:10:16Z',
    _updatedAt: '2021-03-01T07:10:16Z',
  }
  if ('fields' in def && Array.isArray(def.fields)) {
    return { ...extractFieldsFromType(def, sanitySchema), ...result }
  }

  return result
}

function extractFieldsFromType(
  def: ObjectDefinition | ImageDefinition | DocumentDefinition | FileDefinition,
  sanitySchema: CompiledSchema
) {
  const result: Record<string, unknown> = {}

  if (def.fields) {
    for (const field of def.fields) {
      switch (field.type) {
        case 'boolean':
          result[field.name] = true
          break
        case 'number':
          result[field.name] = 0
          break
        case 'reference':
          result[field.name] = extractReferenceDefinition(
            field as ReferenceDefinition,
            sanitySchema
          )
          break
        case 'datetime':
          result[field.name] = '2023-01-01T07:10:16Z'
          break
        case 'text':
        case 'string':
          result[field.name] = field.name
          break
        case 'image':
          result[field.name] = extractImageDefinition(
            field as ImageDefinition,
            sanitySchema
          )
          break
        case 'file':
          result[field.name] = extractFileDefinition(
            field as FileDefinition,
            sanitySchema
          )
          break
        case 'array':
          result[field.name] = extractArrayDefinition(
            field as ArrayDefinition,
            sanitySchema
          )
          break
        case 'object':
          result[field.name] = extractFieldsFromType(field as any, sanitySchema)
          break
        default:
          result[field.name] = extractCustomDefinition(
            field as any,
            sanitySchema
          )
          break
      }
    }
  }

  return result
}

function extractCustomDefinition(
  def: SchemaTypeDefinition,
  sanitySchema: CompiledSchema
) {
  const extendsDefinition = sanitySchema._original?.types.find(
    (type: SchemaTypeDefinition) => type.name === def.type
  )

  if (extendsDefinition) {
    switch (extendsDefinition.type) {
      case 'object':
        return {
          ...extractFieldsFromType(extendsDefinition as any, sanitySchema),
          _type: extendsDefinition.name,
        }
    }
  }

  throw new Error(`Unknown field type ${def.type}`)
}

function extractArrayDefinition(
  def: ArrayDefinition,
  sanitySchema: CompiledSchema
): unknown {
  return def.of.map((def) => {
    switch (def.type) {
      case 'datetime':
        return '2023-01-01T07:10:16Z'
      case 'text':
      case 'string':
        return def.name
      case 'image':
        return extractImageDefinition(def as ImageDefinition, sanitySchema)
      case 'file':
        return extractFileDefinition(def as FileDefinition, sanitySchema)
      case 'array':
        return extractArrayDefinition(def as ArrayDefinition, sanitySchema)
    }
  })
}

function extractReferenceDefinition(
  def: ReferenceDefinition,
  sanitySchema: CompiledSchema
): Reference {
  // @TODO handle references with more than one type
  const _ref = Array.isArray(def.to) ? def.to[0].type : def.to.type
  return {
    // @TODO auto gen _key
    _key: '2f83ba0f133c',
    _type: 'reference',
    _ref,
    _weak: def.weak ? true : undefined,
    _strengthenOnPublish: {
      template: {
        id: _ref,
        params: def.options?.filterParams as unknown as any,
      },
      type: _ref,
      weak: !!def.weak,
    },
  }
}

function extractImageDefinition(
  def: ImageDefinition,
  sanitySchema: CompiledSchema
) {
  const result: ImageSource = {
    _type: 'image',
    asset: { _ref: mockedIds.imageAsset, _type: 'reference' },
  }
  if (def.options?.hotspot) {
    result.crop = {
      _type: 'sanity.imageCrop',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0.0032679738562091387,
    }
    result.hotspot = {
      _type: 'sanity.imageHotspot',
      x: 0.5144927536231892,
      y: 0.5854493971501638,
      height: 0.5496285470710024,
      width: 0.6557057605650974,
    }
  }
  if (def.fields) {
    return { ...extractFieldsFromType(def, sanitySchema), ...result }
  }

  return result
}

function extractFileDefinition(
  def: FileDefinition,
  sanitySchema: CompiledSchema
) {
  const result: File = {
    _type: 'file',
    asset: { _ref: mockedIds.fileAsset, _type: 'reference' },
  }
  if (def.fields) {
    return { ...extractFieldsFromType(def, sanitySchema), ...result }
  }

  return result
}
