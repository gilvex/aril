import type {
  DesignLibrary,
  DesignMachine,
} from '@pomegranate/domain/designLibrary'
export type DesignMachineActionsProps = {
  label: string
  actions: DesignMachine['transitions'][string]['actions']
  library: DesignLibrary
  onChange: (actions: DesignMachine['transitions'][string]['actions']) => void
}
