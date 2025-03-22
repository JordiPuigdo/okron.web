import { generateKey } from 'app/types/SideNavItem';

export const PAYMENT_METHODS = [
  {
    id: generateKey(),
    name: 'Efectiu',
  },
  {
    id: generateKey(),
    name: 'Confirming 30 dies',
  },
  {
    id: generateKey(),
    name: 'Confirming 60 dies',
  },
  {
    id: generateKey(),
    name: 'Rebut 30 dies',
  },
  {
    id: generateKey(),
    name: 'Rebut 60 dies',
  },
  {
    id: generateKey(),
    name: 'Rebut 150 dies',
  },
  {
    id: generateKey(),
    name: 'Transferència 30 dies',
  },
  {
    id: generateKey(),
    name: 'Transferència 60 dies',
  },
  {
    id: generateKey(),
    name: 'Transferència directa',
  },
];
