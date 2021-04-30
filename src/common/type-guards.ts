export function isDefined(arg: unknown): boolean {
  return typeof arg !== 'undefined' && arg !== null;
}

export function isGeneric<Type>(arg: unknown): arg is Type {
  return isDefined(arg);
}

export function isObject(arg: unknown): arg is Record<string, unknown> {
  return typeof arg === 'object' && arg !== null;
}

export function isString(arg: unknown): arg is string {
  return typeof arg === 'string';
}

export function isRecord<Type>(arg: unknown): arg is Type {
  return isObject(arg) && Object.keys(arg).length > 0;
}
