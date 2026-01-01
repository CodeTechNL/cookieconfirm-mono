export default () => {
  return {
    name: 'strip-html-comments',
    apply: 'build',
    enforce: 'post' as const,

    generateBundle(_options: any, bundle: Record<string, any>) {
      for (const fileName of Object.keys(bundle)) {
        const chunkOrAsset = bundle[fileName]

        // Alleen assets (geen JS chunks)
        if (chunkOrAsset.type !== 'asset') continue
        if (!fileName.endsWith('.html')) continue

        const source = String(chunkOrAsset.source ?? '')

        // Strip normale HTML comments, maar laat IE conditional comments (<!--[if ...]>) met rust
        chunkOrAsset.source = source.replace(/<!--(?!\[if\b)[\s\S]*?-->/g, '')
      }
    },
  }
}
