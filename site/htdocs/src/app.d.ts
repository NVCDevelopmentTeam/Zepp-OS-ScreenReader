// Globals added by the Google Analytics and AdSense scripts
interface Window {
  dataLayer: unknown[]
  gtag: (...args: unknown[]) => void
  adsbygoogle?: unknown[]
  [key: string]: unknown
}

// Images imported with imagetools query parameters (?w=48&format=webp) resolve to a URL string
declare module '*format=webp' {
  const src: string
  export default src
}
