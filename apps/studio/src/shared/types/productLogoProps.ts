import type { ImgHTMLAttributes } from 'react'
export type ProductLogoProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'alt' | 'onError'
>
