export type DesignSimulation = {
  machineId: string
  stateId: string
  values: Record<string, string | number | boolean>
  trace: string[]
}
