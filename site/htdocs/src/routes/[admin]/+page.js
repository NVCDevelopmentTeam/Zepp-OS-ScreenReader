export const prerender = false;

export const load = async ({ fetch }) => {
  const response = await fetch('/sveltiaConfig.json');
  const config = await response.json();

  return {
    config
  };
};
