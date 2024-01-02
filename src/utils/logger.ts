function timestamp() {
  return new Date().toISOString();
}

export function logInfo(message: string) {
  console.log(`${timestamp()} [INFO] ${message}`);
}

export function logWarn(message: string) {
  console.warn(`${timestamp()} [WARN] ${message}`);
}

export function logError(message: string) {
  console.error(`${timestamp()} [ERROR] ${message}`);
}

export function logDebug(message: string) {
  console.debug(`${timestamp()} [DEBUG] ${message}`);
}