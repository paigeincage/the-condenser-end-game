/**
 * Builder Configuration — THE key to templatization.
 *
 * Everything builder-specific lives here. When we strip personal data
 * to sell this as a product, this is what each builder customizes.
 * DR Horton, KB Homes, Lennar — they each get their own config.
 */

export interface BuilderConfig {
  builder: {
    name: string
    logo?: string
    portalUrl: string
    portalName: string
  }
  user: {
    name: string
    email: string
    role: string
    community: string
    communityId: string
    region: string
    market: string
  }
  // SCAR stages as used in PCP
  scarStages: string[]
  plans: string[]
  fieldContacts: string[]
}

export const config: BuilderConfig = {
  builder: {
    name: 'Pulte Homes',
    portalUrl: 'https://pcp.pulte.com/portal/home',
    portalName: 'PCP Portal',
  },
  user: {
    name: 'Paige Beltran',
    email: 'pbeltran@pulte.com',
    role: 'Construction Manager',
    community: 'Patterson Ranch',
    communityId: '8531',
    region: 'Texas',
    market: 'Austin Market 1024',
  },
  scarStages: [
    'Start',
    'Frame',
    'Second',
    'Final',
  ],
  plans: [
    'Hewitt 80080',
    'Mesilla 80120',
    'Sandalwood 80090',
    'Dinero 82230',
    'Becket 80060',
    'Enloe 82240',
  ],
  fieldContacts: [
    'Beltran, Paige',
    'Stranko, Luciano',
  ],
}
