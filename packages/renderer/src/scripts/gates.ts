/**
 * Features that currently need to be gated
 */
export enum Gate {
  Streams = "Streams",
}

export enum AccessLevel {
  None = "None",
  /**
   * Available only in dev
   */
  Dev = "Dev",
  /**
   * Available both in dev and production
   */
  Production = "Production",
}

const accessLevel = {
  [Gate.Streams]: AccessLevel.Dev,
};

export const gate = (gate: Gate) => {
  if (import.meta.env.DEV) {
    return (
      accessLevel[gate] === AccessLevel.Dev ||
      accessLevel[gate] === AccessLevel.Production
    );
  }

  return accessLevel[gate] === AccessLevel.Production;
};
