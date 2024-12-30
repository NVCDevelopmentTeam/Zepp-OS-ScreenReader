export const csr = true;
export const prerender = false;
import sveltiaConfig from '../../../static/sveltiaconfig.json';

export const load = async () => {
  return {
    config: sveltiaConfig
  };
};
