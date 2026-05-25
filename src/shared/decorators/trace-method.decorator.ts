import { pushToTraceStack, popFromTraceStack } from '@adatechnology/nestjs-logger';

export function TraceMethod() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const methodName = `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      pushToTraceStack(methodName);
      try {
        const result = originalMethod.apply(this, args);

        // Se retorna uma Promise, aguarda e popula após resolução
        if (result && typeof result.then === 'function') {
          return result
            .then((value: any) => {
              popFromTraceStack();
              return value;
            })
            .catch((error: any) => {
              popFromTraceStack();
              throw error;
            });
        }

        // Se é síncrono, popula imediatamente
        popFromTraceStack();
        return result;
      } catch (error) {
        popFromTraceStack();
        throw error;
      }
    };

    return descriptor;
  };
}
