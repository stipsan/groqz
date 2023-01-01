import { createMachine } from 'xstate'

createMachine({
  tsTypes: {},
  schema: {
    events: {} as { type: 'PING' },
  },
  on: {
    PING: {
      actions: 'log `event`',
    },
  },
})
