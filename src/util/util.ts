import * as dotenv from 'dotenv';

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