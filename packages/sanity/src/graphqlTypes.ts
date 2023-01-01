/**
 * These types are lifted from: https://github.com/sanity-io/sanity/blob/d7145405506388e86f2e122e3bdf686f9cbde997/packages/sanity/src/_internal/cli/actions/graphql/types.ts
 */

import type { GraphQLAPIConfig } from '@sanity/cli'
import type { Schema } from '@sanity/types'

/** @alpha */
export interface SchemaDefinitionish {
  name: string
  type: string
  fields?: SchemaDefinitionish[]
}

/** @alpha */
export interface ResolvedSerializableProperties {
  projectId: string
  dataset: string
  schemaTypes: SchemaDefinitionish[]
}

/** @alpha */
export interface ResolvedSourceProperties {
  projectId: string
  dataset: string
  schema: Schema
}

/** @alpha */
export type TypeResolvedGraphQLAPI = Omit<
  GraphQLAPIConfig,
  'workspace' | 'source'
> &
  ResolvedSerializableProperties

/** @alpha */
export type ResolvedGraphQLAPI = Omit<
  GraphQLAPIConfig,
  'workspace' | 'source'
> &
  ResolvedSourceProperties
