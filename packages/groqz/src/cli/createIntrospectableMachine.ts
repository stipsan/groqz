import { AnyStateMachine, createMachine } from 'xstate'

import { MachineExtractResult } from './MachineExtractResult'

function stubAllWith<T>(value: T): Record<string, T> {
  return new Proxy(
    {},
    {
      get: () => value,
    }
  )
}

export function createIntrospectableMachine(
  machineResult: MachineExtractResult
): AnyStateMachine {
  // xstate-ignore-next-line
  return createMachine(
    {
      ...machineResult.toConfig(),
      context: {},
    },
    {
      guards: stubAllWith(() => false),
      actions: machineResult.getChooseActionsToAddToOptions(),
    }
  )
}
