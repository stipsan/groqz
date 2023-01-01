import { type EvaluateOptions, groqToTs } from '@groqz/to-ts'

export const getTypegenOutput = async (
  types: { query: string; identifier: string }[],
  options: EvaluateOptions
): Promise<string> => {
  const interfaces: string[] = []
  for (const { query, identifier } of types) {
    interfaces.push(`export interface ${identifier} {
      query: ${JSON.stringify(query)};
      schema: z.ZodType<${await groqToTs(query, options)}>;
    }`)
  }

  return `
  // This file was automatically generated. Edits will be overwritten
  import {z} from "zod";

  ${interfaces.join('\n\n')}`
}
