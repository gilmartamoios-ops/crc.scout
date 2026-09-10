import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CRC.SCOUT | Inteligência de Comunidade',
  description: 'Plataforma de engajamento, curadoria e gestão da comunidade CRC.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-neutral-950 text-neutral-100 antialiased min-h-screen selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
