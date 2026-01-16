/**
 * WorkOrderForm - Components refactoritzats per l'edició d'ordres de treball.
 *
 * Estructura modular seguint principis SOLID:
 * - SRP: Cada component té una única responsabilitat
 * - OCP: Fàcil afegir noves seccions sense modificar existents
 * - DIP: Components depenen d'abstraccions (interfaces, props)
 *
 * Layout inspirat en apps socials (Instagram, TikTok, Facebook):
 * - Cards amb ombres suaus
 * - Seccions col·lapsables
 * - Navegació per tabs
 * - Colors de marca consistents
 */

// Layout components
export * from './layout';

// Hooks
export { useWorkOrderForm, type UseWorkOrderFormReturn } from './hooks';

// Main components
export { WorkOrderHeader } from './WorkOrderHeader';
export { WorkOrderEventsTable } from './WorkOrderEventsTable';

// Section components
export { WorkOrderMainForm, WorkOrderSidebar } from './sections';
