'use client';

import { useState } from 'react';
import {
  CreditNote,
  CreditNoteUpdateRequest,
} from 'app/interfaces/CreditNote';
import { CreditNoteService } from 'app/services/creditNoteService';

import { CreditNoteDetailForm } from './CreditNoteDetailForm';

interface CreditNoteDetailClientProps {
  initialCreditNote: CreditNote;
}

export function CreditNoteDetailClient({
  initialCreditNote,
}: CreditNoteDetailClientProps) {
  const [creditNote, setCreditNote] = useState<CreditNote>(initialCreditNote);

  const creditNoteService = new CreditNoteService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const handleUpdate = async (request: CreditNoteUpdateRequest) => {
    try {
      const updated = await creditNoteService.update(request);
      setCreditNote(updated);
    } catch (error) {
      console.error('Error updating credit note:', error);
      throw error;
    }
  };

  return (
    <CreditNoteDetailForm creditNote={creditNote} onUpdate={handleUpdate} />
  );
}
