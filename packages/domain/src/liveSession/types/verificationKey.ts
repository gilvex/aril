export type VerificationKey = Awaited<
  ReturnType<typeof crypto.subtle.importKey>
>
