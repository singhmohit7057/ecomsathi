export interface ToolItem {
  name: string
  path: string
  iconName: string
}

export interface ToolCategoryData {
  id: string
  title: string
  description: string
  tools: ToolItem[]
  href: string
  buttonText: string
  colorScheme: 'blue' | 'cyan' | 'green' | 'rose' | 'violet' | 'amber'
}

export interface PopularToolData {
  name: string
  description: string
  path: string
  category: string
  colorScheme: 'blue' | 'cyan' | 'green' | 'rose' | 'violet' | 'amber'
}

export interface FAQItemData {
  question: string
  answer: string
}

export interface MarketplaceData {
  name: string
  accentColor: string
  bgColor: string
  textColor: string
  badge?: string
}
