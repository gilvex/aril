import { useCallback } from 'react'
import type { SyntheticEvent } from 'react'
import { getProductBranding } from '@/shared/deploymentSettings/index.ts'
import type { ProductLogoProps } from '../types/productLogoProps.ts'

export function ProductLogo(props: ProductLogoProps) {
  const fallback = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
    if (event.currentTarget.getAttribute('src') !== '/aril.svg')
      event.currentTarget.src = '/aril.svg'
  }, [])
  return (
    <img
      {...props}
      src={getProductBranding().productLogoUrl}
      alt=""
      referrerPolicy="no-referrer"
      onError={fallback}
      style={{ ...props.style, objectFit: 'contain' }}
    />
  )
}
