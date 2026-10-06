export type AgentSecretProps = {
  t: import('i18next').TFunction<'translation', undefined>
  secret: string
  handleClick: () => Promise<void>
}
