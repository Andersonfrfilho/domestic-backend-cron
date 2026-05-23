import { pushToTraceStack, popFromTraceStack } from '@adatechnology/logger';

export function TraceMethod() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const methodName = `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      pushToTraceStack(methodName);
      try {
        return await originalMethod.apply(this, args);
      } finally {
        popFromTraceStack();
      }
    };

    return descriptor;
  };
}
