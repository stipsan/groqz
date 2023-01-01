import { type EvaluateOptions, groqToTs } from '@groqz/to-ts'

export const getTypegenOutput = async (
  queries: string[],
  options: EvaluateOptions
): Promise<string> => {
  const interfaces: string[] = []
  for (const [index, query] of queries.entries()) {
    interfaces.push(`export interface Typegen${index} {
      query: ${JSON.stringify(query)};
      schema: z.ZodType<${await groqToTs(query, options)}>;
    }`)
  }

  return `
  // This file was automatically generated. Edits will be overwritten
  import {z} from "zod";

  ${interfaces.join('\n\n')}`
}
