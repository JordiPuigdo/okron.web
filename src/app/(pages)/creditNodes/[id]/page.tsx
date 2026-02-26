import { CreditNote } from 'app/interfaces/CreditNote';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import { CreditNoteDetailClient } from './components/CreditNoteDetailClient';

async function getCreditNote(id: string): Promise<CreditNote | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}credit-notes/${id}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) return null;

    return res.json();
  } catch (error) {
    console.error('Error fetching credit note:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const creditNote = await getCreditNote(params.id);
  return {
    title: creditNote?.code || 'Credit Note',
  };
}

interface CreditNoteDetailPageProps {
  params: { id: string };
}

export default async function CreditNoteDetailPage({
  params,
}: CreditNoteDetailPageProps) {
  const creditNote = await getCreditNote(params.id);

  if (!creditNote) {
    return (
      <MainLayout>
        <Container fullWidth>
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">Credit note not found</p>
          </div>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container fullWidth>
        <CreditNoteDetailClient initialCreditNote={creditNote} />
      </Container>
    </MainLayout>
  );
}
