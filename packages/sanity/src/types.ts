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
