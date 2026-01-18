import * as os from 'os';
import * as path from 'path';

export const PEEMODORO_DIR = path.join(os.homedir(), '.peemodoro');
export const STATE_FILE = path.join(PEEMODORO_DIR, 'state.json');
export const LOCK_FILE = path.join(PEEMODORO_DIR, 'state.lock');
export const CONFIG_FILE = path.join(PEEMODORO_DIR, 'config.json');
export const DB_PATH = path.join(PEEMODORO_DIR, 'history.db');
export const LOCK_TIMEOUT = 5000;
