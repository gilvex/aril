export type DesignVariableValueProps = {
  type: string
  value: string | number | boolean
  label: string
  onChange: (value: string | number | boolean) => void
  disabled?: boolean
}
