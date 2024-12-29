export const prerender = false;
import sveltiaConfig from '../../../sveltiaConfig.json';

export const load = async () => {
  return {
    config: sveltiaConfig
  };
};
