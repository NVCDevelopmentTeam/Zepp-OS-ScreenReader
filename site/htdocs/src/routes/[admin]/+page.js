export const ssr = true;
export const prerender = false;
import sveltiaConfig from '../../../sveltiaconfig.json';

export const load = async () => {
  return {
    config: sveltiaConfig
  };
};
