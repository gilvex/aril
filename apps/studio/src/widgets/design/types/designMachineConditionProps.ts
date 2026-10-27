import type { DesignLibrary, DesignMachine } from '@aril/domain/designLibrary'
export type DesignMachineConditionProps = {
  guard: DesignMachine['transitions'][string]['guard']
  library: DesignLibrary
  onChange: (guard: DesignMachine['transitions'][string]['guard']) => void
}
