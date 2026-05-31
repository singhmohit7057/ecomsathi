import { useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface WebSiteSchemaData {
  url?: string
  name?: string
  description?: string
}

interface WebApplicationSchemaData {
  name: string
  url: string
  description: string
  applicationCategory?: string
  operatingSystem?: string
  offers?: {
    price?: string
    priceCurrency?: string
  }
}

interface FAQItem {
  question: string
  answer: string
}

interface BreadcrumbItem {
  name: string
  url: string
}

interface OrganizationSchemaData {
  name?: string
  url?: string
  logo?: string
  description?: string
  email?: string
  sameAs?: string[]
}

type SchemaType =
  | 'WebSite'
  | 'WebApplication'
  | 'FAQPage'
  | 'BreadcrumbList'
  | 'Organization'

interface SchemaMarkupProps {
  type: SchemaType
  data:
    | WebSiteSchemaData
    | WebApplicationSchemaData
    | FAQItem[]
    | BreadcrumbItem[]
    | OrganizationSchemaData
}

// ─── Schema Builders ──────────────────────────────────────────────────────────

const SITE_URL = 'https://ecomsathi.vercel.app'
const SITE_NAME = 'EcomSathi'

export function WebSiteSchema({ url, name, description }: WebSiteSchemaData = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: name || SITE_NAME,
    url: url || SITE_URL,
    description:
      description ||
      'Free ecommerce tools for Indian sellers. SKU generator, PDF tools, label crop, GST calculator, background remover and more.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/tools?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
  }
}

export function WebApplicationSchema({
  name,
  url,
  description,
  applicationCategory = 'BusinessApplication',
  operatingSystem = 'Any',
  offers,
}: WebApplicationSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url,
    description,
    applicationCategory,
    operatingSystem,
    offers: {
      '@type': 'Offer',
      price: offers?.price ?? '0',
      priceCurrency: offers?.priceCurrency ?? 'INR',
    },
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}

export function FAQPageSchema(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function BreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

export function OrganizationSchema({
  name,
  url,
  logo,
  description,
  email,
  sameAs,
}: OrganizationSchemaData = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: name || SITE_NAME,
    url: url || SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: logo || `${SITE_URL}/logo.png`,
    },
    description:
      description ||
      'EcomSathi provides free ecommerce tools for Indian sellers — SKU generators, PDF tools, image tools, label crop, and GST utilities.',
    email: email || 'hello@ecomsathi.in',
    ...(sameAs && sameAs.length > 0 ? { sameAs } : {}),
    foundingDate: '2024',
    areaServed: 'IN',
    knowsLanguage: ['en', 'hi'],
  }
}

// ─── Helper: inject / update a <script type="application/ld+json"> ────────────

function useJsonLd(id: string, schema: object) {
  useEffect(() => {
    const attrValue = `json-ld-${id}`
    let el = document.querySelector<HTMLScriptElement>(`script[data-schema="${attrValue}"]`)
    if (!el) {
      el = document.createElement('script')
      el.setAttribute('type', 'application/ld+json')
      el.setAttribute('data-schema', attrValue)
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(schema)

    return () => {
      if (el && el.parentNode) el.parentNode.removeChild(el)
    }
  }, [id, schema])
}

// ─── Default Export Component ─────────────────────────────────────────────────

export default function SchemaMarkup({ type, data }: SchemaMarkupProps) {
  let schema: object = {}

  switch (type) {
    case 'WebSite':
      schema = WebSiteSchema(data as WebSiteSchemaData)
      break
    case 'WebApplication':
      schema = WebApplicationSchema(data as WebApplicationSchemaData)
      break
    case 'FAQPage':
      schema = FAQPageSchema(data as FAQItem[])
      break
    case 'BreadcrumbList':
      schema = BreadcrumbSchema(data as BreadcrumbItem[])
      break
    case 'Organization':
      schema = OrganizationSchema(data as OrganizationSchemaData)
      break
  }

  useJsonLd(type, schema)

  return null
}

// ─── Re-export types for consumers ───────────────────────────────────────────
export type {
  WebSiteSchemaData,
  WebApplicationSchemaData,
  FAQItem,
  BreadcrumbItem,
  OrganizationSchemaData,
  SchemaMarkupProps,
}
