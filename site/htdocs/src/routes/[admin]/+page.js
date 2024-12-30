export const ssr = false;
export const prerender = true;
import sveltiaConfig from '../../../sveltiaconfig.json';

export const load = async () => {
  return {
    config: sveltiaConfig
  };
};
