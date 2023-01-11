# GROQZ (experimental)

Transforms [GROQ] strings to [zod] schemas in your TypeScript codebase.
This lets you check your app is using query responses to the [Sanity Content Lake](https://www.sanity.io/docs/datastore) in a way that is runtime safe.
Basically eliminate bugs like:

```console
TypeError: Cannot read properties of undefined
```

## Concept

In a project with a `sanity.config.ts` file (introduced in [Sanity Studio v3]) that defines a schema like this:

```ts
import { defineConfig } from 'sanity'

export default defineConfig({
  schema: {
    types: [
      {
        name: 'page',
        type: 'document',
        fields: [
          {
            name: 'title',
            type: 'string',
          },
          {
            name: 'likes',
            type: 'number',
          },
        ],
      },
    ],
  },
})
```

It takes [GROQ] strings as input, and provides `{query: string, schema: z.ZodType}` as output:

```ts
import { groq } from 'groqz'

const { query, schema } = groq`*[_type == "page"]{_type, title, likes}`
```

You forward the `query` string to [@sanity/client], or any other library that takes [GROQ] as input and a JSON response. And then call `schema.parse` on that response:

```ts
import {groq} from 'groqz'

const {query, schema} = groq`*[_type == "page"]{_type, title, likes}`

// Sanity Client on Content Lake
import {createClient} from `@sanity/client`

const client = createClient()
const data = schema.parse(await client.fetch(query))

// Querying Content Lake with another client
import PicoSanity from 'picosanity'

const client = new PicoSanity()

const data = schema.parse(await client.fetch(query))

// Type safety for live preview modes
import { definePreview } from '@sanity/preview-kit'
import {useDeferredValue, useMemo} from 'react

const usePreview = definePreview()
function ReactComponent() {
  const deferredData = useDeferredValue(usePreview(query))
  // live preview may re-render frequently if there's a lot of Studio activity (multiple people editing documents that are being previewed)
  // so wrapping it in useDeferredValue + useMemo lets React defer the zod parsing of the response if IO is too busy for it to be done on every re-render
  const data = useMemo(() => schema.parse(deferredData), [deferredData])
}
```

This is similar to how other libraries like [`groqd`] works, and libraries like [`@sanity/client`] may be updated to take `{query, schema}` as input in the future:

```
// This is just an example scenario, `@sanity/client` doesn't support this
import {createClient} from `@sanity/client`
import {groq} from 'groqz'

const client = createClient()
const data = await client.fetch(groq`*[]`)
// data is typed as {_type: "page", title?: string, likes?: number}[]
// as `client` is calling `schema.parse` on the resposne before returning it
```

## Design

It's necessary to provide both typegen and codegen for this to work end-to-end. The generated typings that TS uses to check that you are using your GROQ data in a runtime safe is built on [zod]. And [zod] typings live under the assumption that you called `schema.parse` on the data, letting it throw a parser error should the input JSON mismatch the generated schema.
Unfortunately there's no tool we can use that can deal let us setup typegen and codegen at the same time. We have to provide tooling that integrates with peoples TypeScript setup, and their bundler/codegen, as two separate strategies.

### Typegen

In order to do runtime checks in TypeScript it's necessary to generate typings. [This is because TS only have an API that lets us extend the "editing experience"](https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin), it doesn't have a plugin API that would let us generate typigns from arbitrary GROQ strings as part of running the TS cli `tsc`. It leaves us with two options: IDE plugins that integrate with the editing experience and generate typings in that process, and a cli.

- [groqz] and its cli command `groqz typegen src/**/*.ts`
- (planned) `groqz-vscode`
- (maybe) `groqz-intellij` (can be done like [`import-cost`](https://github.com/denofevil/import-cost) so it works in WebStorm, Intellij IDEA and all the rest)

### Codegen

We'll have to support a wide range of build plugins to integrate with the diversity of tooling that folks use.

- (planned) `@groqz/babel-plugin` that can be used with general babel setups, as well as [babel macros](https://github.com/kentcdodds/babel-plugin-macros) (used in frameworks like [CRA] that supports it instead of letting you use a custom `babel.config|.babelrc` file).
- if all else fails, `@groqz/to-js` can be used to generate the runtime code for projects that use tooling that we don't have a plugin for.

## When developing GROQZ

### Useful commands

- `pnpm build` - Build all packages and the docs site
- `pnpm dev` - Develop all packages and the docs site
- `pnpm lint` - Lint all packages
- `pnpm changeset` - Generate a changeset
- `pnpm clean` - Clean up all `node_modules` and `dist` folders (runs each package's clean script)

## Versioning and Publishing packages

Package publishing has been configured using [Changesets](https://github.com/changesets/changesets). Please review their [documentation](https://github.com/changesets/changesets#documentation) to familiarize yourself with the workflow.

This example comes with automated npm releases setup in a [GitHub Action](https://github.com/changesets/action). To get this working, you will need to create an `NPM_TOKEN` and `GITHUB_TOKEN` in your repository settings. You should also install the [Changesets bot](https://github.com/apps/changeset-bot) on your GitHub repository as well.

For more information about this automation, refer to the official [changesets documentation](https://github.com/changesets/changesets/blob/main/docs/automating-changesets.md)

[groq-js]: https://github.com/sanity-io/groq-js
[zod]: https://zod.dev/
[groq]: https://www.sanity.io/docs/groq
[sanity content lake]: https://www.sanity.io/docs/datastore
[sanity studio v3]: https://www.sanity.io/blog/sanity-studio-v3-simplified-yet-powerful-customization
[`groqd`]: https://github.com/FormidableLabs/groqd
[cra]: https://create-react-app.dev/
