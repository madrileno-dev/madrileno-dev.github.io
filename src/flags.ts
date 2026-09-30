const on = (v: string | undefined) => v === "true" || v === "1";

export const flags = {
  support: on(import.meta.env.PUBLISH_SUPPORT),
};
