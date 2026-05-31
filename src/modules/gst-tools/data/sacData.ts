export interface SACEntry {
  code: string
  description: string
  gstRate: number
}

export const SAC_DATA: SACEntry[] = [
  { code: '9954', description: 'Construction Services', gstRate: 18 },
  { code: '9961', description: 'Wholesale trade services', gstRate: 18 },
  { code: '9962', description: 'Retail trade services', gstRate: 18 },
  { code: '9963', description: 'Accommodation, food and beverage services', gstRate: 18 },
  { code: '9964', description: 'Passenger transport services', gstRate: 5 },
  { code: '9965', description: 'Goods transport services', gstRate: 5 },
  { code: '9966', description: 'Transport support services', gstRate: 18 },
  { code: '9967', description: 'Postal and courier services', gstRate: 18 },
  { code: '9968', description: 'Electricity, gas and water distribution services', gstRate: 18 },
  { code: '9969', description: 'Financial and related services', gstRate: 18 },
  { code: '9971', description: 'Real estate services', gstRate: 18 },
  { code: '9972', description: 'Leasing or rental services', gstRate: 18 },
  { code: '9973', description: 'Research and development services', gstRate: 18 },
  { code: '9981', description: 'Computer and related services', gstRate: 18 },
  { code: '9982', description: 'Legal and accounting services', gstRate: 18 },
  { code: '9983', description: 'Other professional, technical and business services', gstRate: 18 },
  { code: '9984', description: 'Telecommunications and broadcasting services', gstRate: 18 },
  { code: '9985', description: 'Support services', gstRate: 18 },
  { code: '9986', description: 'Agriculture, forestry and fishery support services', gstRate: 18 },
  { code: '9987', description: 'Maintenance, repair and installation services', gstRate: 18 },
  { code: '9988', description: 'Manufacturing services on physical inputs owned by others', gstRate: 18 },
  { code: '9989', description: 'Other manufacturing services', gstRate: 18 },
  { code: '9991', description: 'Public administration and other government services', gstRate: 0 },
  { code: '9992', description: 'Education services', gstRate: 0 },
  { code: '9993', description: 'Human health and social care services', gstRate: 0 },
  { code: '9994', description: 'Sewage and waste collection, treatment and disposal services', gstRate: 18 },
  { code: '9995', description: 'Services of membership organisations', gstRate: 18 },
  { code: '9996', description: 'Recreational, cultural and sporting services', gstRate: 18 },
  { code: '9997', description: 'Other services', gstRate: 18 },
  { code: '9998', description: 'Domestic services', gstRate: 18 },
  { code: '9999', description: 'Services provided by extraterritorial organisations', gstRate: 0 },
]
