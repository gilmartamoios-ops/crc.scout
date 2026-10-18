import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'E se seu consumo gerasse renda recorrente?',
  description: 'Descubra como transformar produtos do dia a dia em uma comunidade de renda recorrente. Sem taxa de adesão e sem estoque.',
  openGraph: {
    title: 'E se seu consumo gerasse renda recorrente?',
    description: 'Acesse o SCOUT e descubra como funciona na prática. Risco Zero.',
    url: 'https://crc-scout.vercel.app',
    siteName: 'CRC SCOUT',
    images: [
      {
        url: 'https://crc-scout.vercel.app/assets/capa-preview.jpg', // Coloque aqui o link absoluto da imagem de capa que está na sua pasta public/assets
        width: 1200,
        height: 630,
        alt: 'Santinho Digital CRC Scout',
      },
    ],
    type: 'website',
  },
};