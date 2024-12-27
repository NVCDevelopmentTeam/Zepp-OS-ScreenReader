export const prerender = false;

import config from '../../../sveltia.config.js';

export const load = async () => {
  return {
    config
  };
};