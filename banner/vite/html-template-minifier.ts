import type { Plugin } from 'vite'

/**
 * Minifies whitespace and removes HTML comments inside template literals
 * that contain HTML for our banner UI. Runs only during build.
 */
export function htmlTemplateMinifier(): Plugin {
  return {
    name: 'html-template-minifier',
    apply: 'build',
    enforce: 'post',
    transform(code, id) {
      // Only process our source files
      if (!/\/src\/js\//.test(id)) return null

      // Fast bailout if no backticks present
      if (code.indexOf('`') === -1) return null

      const result = minimizeTemplates(code)
      if (result.changed) {
        return {
          code: result.code,
          map: null,
        }
      }
      return null
    },
  }
}

function minimizeTemplates(src: string): { code: string; changed: boolean } {
  let i = 0
  const n = src.length
  let out = ''
  let changed = false
  let inTemplate = false
  let exprDepth = 0
  let buf = '' // accumulates literal chunk inside template

  const flushLiteral = () => {
    if (buf.length) {
      const original = buf
      // Only attempt to minify if it looks like HTML
      if (original.includes('<')) {
        let s = original
        // remove HTML comments
        s = s.replace(/<!--[\s\S]*?-->/g, '')
        // collapse whitespace
        s = s.replace(/[\t\n\r]+/g, ' ')
        s = s.replace(/\s{2,}/g, ' ')
        // remove whitespace between tags
        s = s.replace(/>\s+</g, '><')
        // trim edge spaces
        s = s.trim()
        if (s !== original) changed = true
        out += s
      } else {
        out += original
      }
      buf = ''
    }
  }

  while (i < n) {
    const ch = src[i]
    const prev = i > 0 ? src[i - 1] : ''

    if (!inTemplate) {
      if (ch === '`') {
        inTemplate = true
        out += ch
        i++
        continue
      }
      out += ch
      i++
      continue
    }

    // Inside template
    if (exprDepth === 0 && ch === '`' && prev !== '\\') {
      // End of template literal
      flushLiteral()
      inTemplate = false
      out += ch
      i++
      continue
    }

    if (ch === '$' && src[i + 1] === '{' && prev !== '\\') {
      // Enter expression: flush literal and copy expression as-is
      flushLiteral()
      out += '${'
      i += 2
      exprDepth = 1
      // copy until matching }
      while (i < n && exprDepth > 0) {
        const c = src[i]
        out += c
        if (c === '{') exprDepth++
        else if (c === '}') exprDepth--
        i++
      }
      continue
    }

    // Collect literal characters
    buf += ch
    i++
  }

  // In case of unclosed template, flush what we have
  if (buf) flushLiteral()

  return { code: out, changed }
}
