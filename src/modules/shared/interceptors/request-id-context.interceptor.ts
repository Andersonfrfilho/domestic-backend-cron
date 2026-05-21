import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { runWithContext, getContext } from '@adatechnology/logger';

@Injectable()
export class RequestIdContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const requestId = (req as any).requestId;

    if (!requestId) {
      return next.handle();
    }

    const currentContext = getContext() ?? {};
    return new Observable((subscriber) => {
      runWithContext(
        {
          ...currentContext,
          requestId,
        },
        () => {
          next.handle().subscribe(subscriber);
        },
      );
    });
  }
}
