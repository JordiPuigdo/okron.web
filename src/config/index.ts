import { getClientFromHost } from 'lib/config';

import defaultConfig from './clients/default';
import jpont from './clients/jpont';
import kolder from './clients/kolder';

export const getClientConfig = (hostname: string = '') => {
  const clientId = getClientFromHost(hostname);
  console.log('Client ID:', clientId);
  switch (clientId) {
    case 'kolder':
      return kolder;
    case 'jpont':
      return jpont;
    default:
      return defaultConfig;
  }
};
