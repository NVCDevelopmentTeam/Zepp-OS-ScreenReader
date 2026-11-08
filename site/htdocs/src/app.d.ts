// Images imported with imagetools query parameters (?w=48&format=webp) resolve to a URL string
declare module '*format=webp' {
  const src: string
  export default src
}
