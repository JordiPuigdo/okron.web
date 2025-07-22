export const getClientFromHost = (hostname: string): string => {
  // Ejemplo de hostname: 'kolder.okron.com'
  const subdomain = hostname.split('.')[0];

  // Lista de clientes permitidos
  const allowedClients = ['kolder', 'jpont'];

  return allowedClients.includes(subdomain) ? subdomain : 'default';
};
