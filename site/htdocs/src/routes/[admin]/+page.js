export const prerender = false;
import sveltiaConfig from '../../../static/admin/sveltiaConfig.json';

export const load = async () => {
  return {
    config: sveltiaConfig
  };
};
