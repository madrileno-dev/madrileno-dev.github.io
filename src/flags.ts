const on = (v: string | undefined) => v === "true" || v === "1";

export const flags = {
  manifesto: on(import.meta.env.PUBLISH_MANIFESTO),
  support: on(import.meta.env.PUBLISH_SUPPORT),
};
