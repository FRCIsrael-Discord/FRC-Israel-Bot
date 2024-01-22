function timestamp() {
  return new Date().toISOString();
}

export function logInfo(...message: any) {
  console.log(`${timestamp()} [INFO] ${message.join(' ')}`);
}

export function logWarn(...message: any) {
  console.warn(`${timestamp()}[WARN] ${message.join(' ')}`);
}

export function logError(...message: any) {
  console.error(`${timestamp()}[ERROR] ${message.join(' ')}`);
}

export function logDebug(...message: any) {
  console.debug(`${timestamp()}[DEBUG] ${message.join(' ')}`);
}