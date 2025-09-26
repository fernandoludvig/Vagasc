import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'VagaSC - Marketplace de Estacionamento Privado',
    template: '%s | VagaSC',
  },
  description: 'Encontre e alugue vagas de estacionamento privado em Florianópolis. Conectamos proprietários de vagas com motoristas de forma segura e prática.',
  keywords: [
    'estacionamento',
    'vaga',
    'Florianópolis',
    'aluguel',
    'parking',
    'marketplace',
    'estacionamento privado',
    'vaga de estacionamento',
  ],
  authors: [{ name: 'VagaSC Team' }],
  creator: 'VagaSC',
  publisher: 'VagaSC',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://vagasc.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://vagasc.com',
    title: 'VagaSC - Marketplace de Estacionamento Privado',
    description: 'Encontre e alugue vagas de estacionamento privado em Florianópolis',
    siteName: 'VagaSC',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VagaSC - Marketplace de Estacionamento',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VagaSC - Marketplace de Estacionamento Privado',
    description: 'Encontre e alugue vagas de estacionamento privado em Florianópolis',
    images: ['/og-image.png'],
    creator: '@vagasc',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}
