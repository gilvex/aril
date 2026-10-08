import type { DesignMachineActionsProps } from './designMachineActionsProps.ts'
export type DesignMachineActionRowProps = Omit<
  DesignMachineActionsProps,
  'label'
> & { action: DesignMachineActionsProps['actions'][number]; index: number }
