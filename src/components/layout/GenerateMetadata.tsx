import { useSessionStore } from 'app/stores/globalStore';

export async function generateMetadata() {
  const config = useSessionStore.getState().config;
  return {
    title: 'Okron',
    description: 'Gestió',
    icons: config?.company?.urlLogo || '/default-favicon.png',
  };
}
