function timestamp() {
  return new Date().toISOString();
}

export function logInfo(message: any) {
  console.log(`${timestamp()} [INFO] ${message}`);
}

export function logWarn(message: any) {
  console.warn(`${timestamp()} [WARN] ${message}`);
}

export function logError(message: any) {
  console.error(`${timestamp()} [ERROR] ${message}`);
}

export function logDebug(message: any) {
  console.debug(`${timestamp()} [DEBUG] ${message}`);
}