import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TraceStackService } from '@modules/shared/services/trace-stack.service';

/**
 * Initializes and cleans up the trace stack for each request.
 * Should be registered early in the interceptor chain (before other interceptors).
 */
@Injectable()
export class TraceStackInterceptor implements NestInterceptor {
  constructor(private readonly traceStack: TraceStackService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Clear any previous stack (defensive)
    this.traceStack.clear();

    return next.handle().pipe(
      finalize(() => {
        // Clean up stack after request completes
        this.traceStack.clear();
      }),
    );
  }
}
