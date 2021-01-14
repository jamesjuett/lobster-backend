import * as dotenv from 'dotenv';
import fs from 'fs';

export function assert(condition: any, message: string = "") : asserts condition {
  if (!condition) {
    throw Error("Assert failed: " + message);
  }
};

export function assertExists<T>(obj: T | undefined) : T {
  if (obj === undefined) {
    throw new Error();
  }
  return obj;
}

let config_loaded = false;
export function dotenv_config() {
  if (!config_loaded) {
    dotenv.config();
    config_loaded = true;
  }
}

export function getDockerSecret(name: string) {
  try {
    return fs.readFileSync(`/run/secrets/${name}`, "utf8");
  }
  catch (e) {
    throw new Error(`Unable to find docker secret "${name}"`);
  }
}