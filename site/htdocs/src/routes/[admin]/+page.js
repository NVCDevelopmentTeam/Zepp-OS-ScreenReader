export const csr = true;
import sveltiaConfig from '../../../static/admin/sveltiaConfig.json';

export const load = async () => {
  return {
    config: sveltiaConfig
  };
};
