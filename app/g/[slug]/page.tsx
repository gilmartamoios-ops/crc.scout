import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Props = {
  params: {
    slug: string;
  };
};

export default async function GestorPublicoPage({ params }: Props) {
  const slug = params.slug.trim().toLowerCase();

  const { data: gestor, error } = await supabase
    .from('gestores')
    .select('id, nome, slug')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !gestor) {
    notFound();
  }

  return (
    <main>
      <h1>SCOUT.CRC</h1>
      <p>Prospecção vinculada a {gestor.nome}</p>
    </main>
  );
}