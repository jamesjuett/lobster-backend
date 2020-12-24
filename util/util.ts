import * as dotenv from 'dotenv';

let config_loaded = false;
export function dotenv_config() {
  if (!config_loaded) {
    dotenv.config();
    config_loaded = true;
  }
}