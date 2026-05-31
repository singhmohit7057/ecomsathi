import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  canonicalUrl?: string
  noIndex?: boolean
  schema?: object
}

const DEFAULT_TITLE_SUFFIX = ' | EcomSathi'
const DEFAULT_DESCRIPTION =
  'Free ecommerce tools for sellers. SKU generator, barcode generator, PDF tools, label crop, GST calculator, background remover and more. Made for Indian sellers on Amazon, Flipkart, Meesho.'
const DEFAULT_OG_IMAGE = '/og-image.png'
const SITE_URL = 'https://ecomsathi.vercel.app'

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
  return el
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
  return el
}

function setJsonLd(schema: object) {
  let el = document.querySelector<HTMLScriptElement>('script[data-seo="json-ld"]')
  if (!el) {
    el = document.createElement('script')
    el.setAttribute('type', 'application/ld+json')
    el.setAttribute('data-seo', 'json-ld')
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(schema)
  return el
}

export default function SEO({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonicalUrl,
  noIndex = false,
  schema,
}: SEOProps) {
  useEffect(() => {
    const resolvedTitle = title
      ? title.includes('EcomSathi')
        ? title
        : `${title}${DEFAULT_TITLE_SUFFIX}`
      : `EcomSathi — Free Ecommerce Tools for Indian Sellers`
    const resolvedDescription = description || DEFAULT_DESCRIPTION
    const resolvedImage = ogImage
      ? ogImage.startsWith('http')
        ? ogImage
        : `${SITE_URL}${ogImage}`
      : `${SITE_URL}${DEFAULT_OG_IMAGE}`
    const resolvedCanonical = canonicalUrl || `${SITE_URL}${window.location.pathname}`

    // Page title
    const prevTitle = document.title
    document.title = resolvedTitle

    // Basic meta
    const descEl = setMeta('description', resolvedDescription)
    const kwEl = keywords ? setMeta('keywords', keywords) : null
    const robotsEl = setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow')

    // Open Graph
    const ogTitleEl = setMeta('og:title', resolvedTitle, 'property')
    const ogDescEl = setMeta('og:description', resolvedDescription, 'property')
    const ogImageEl = setMeta('og:image', resolvedImage, 'property')
    const ogUrlEl = setMeta('og:url', resolvedCanonical, 'property')
    const ogTypeEl = setMeta('og:type', ogType, 'property')
    const ogSiteEl = setMeta('og:site_name', 'EcomSathi', 'property')

    // Twitter Card
    const twCardEl = setMeta('twitter:card', 'summary_large_image')
    const twTitleEl = setMeta('twitter:title', resolvedTitle)
    const twDescEl = setMeta('twitter:description', resolvedDescription)
    const twImageEl = setMeta('twitter:image', resolvedImage)

    // Canonical
    const canonicalEl = setCanonical(resolvedCanonical)

    // JSON-LD
    const jsonLdEl = schema ? setJsonLd(schema) : null

    return () => {
      document.title = prevTitle

      // Remove metas we created (only remove if we set them)
      ;[
        descEl,
        kwEl,
        robotsEl,
        ogTitleEl,
        ogDescEl,
        ogImageEl,
        ogUrlEl,
        ogTypeEl,
        ogSiteEl,
        twCardEl,
        twTitleEl,
        twDescEl,
        twImageEl,
      ].forEach((el) => {
        if (el && el.parentNode) el.parentNode.removeChild(el)
      })

      if (canonicalEl && canonicalEl.parentNode) canonicalEl.parentNode.removeChild(canonicalEl)
      if (jsonLdEl && jsonLdEl.parentNode) jsonLdEl.parentNode.removeChild(jsonLdEl)
    }
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, noIndex, schema])

  return null
}

export type { SEOProps }
