// Optional in-browser transport, installed before React mounts for the demo.
export const apiTransport: {
  request?: (url: string, init?: RequestInit) => Promise<Response>
} = {}
