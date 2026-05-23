import { Injectable } from '@nestjs/common';
import { context } from '@opentelemetry/api';

/**
 * Tracks the call stack of methods during request processing.
 * Useful for debugging execution flow and correlating logs across layers.
 *
 * Usage:
 *   - Push method name on entry: traceStack.push('ClassName.methodName')
 *   - Pop on exit: traceStack.pop()
 *   - Get stack for logging: traceStack.getStack()
 */
@Injectable()
export class TraceStackService {
  private readonly STACK_KEY = Symbol.for('trace:stack');

  /**
   * Push a method name to the call stack
   */
  push(methodName: string): void {
    const stack = this.getStack();
    const ctx = context.active().setValue(this.STACK_KEY, [...stack, methodName]);
    context.with(ctx, () => {
      // Context updated
    });
  }

  /**
   * Pop the last method from the call stack
   */
  pop(): void {
    const stack = this.getStack();
    if (stack.length > 0) {
      const newStack = stack.slice(0, -1);
      const ctx = context.active().setValue(this.STACK_KEY, newStack);
      context.with(ctx, () => {
        // Context updated
      });
    }
  }

  /**
   * Get the current call stack as an array
   */
  getStack(): string[] {
    const stack = context.active().getValue(this.STACK_KEY);
    return Array.isArray(stack) ? stack : [];
  }

  /**
   * Get the current call stack as a formatted string
   * Format: [className1.method1][className2.method2]...
   */
  getStackFormatted(): string {
    const stack = this.getStack();
    if (stack.length === 0) return '';
    return stack.map((s) => `[${s}]`).join('');
  }

  /**
   * Get the current stack depth (number of methods in the call chain)
   */
  getDepth(): number {
    return this.getStack().length;
  }

  /**
   * Get the current method name (last item in stack)
   */
  getCurrentMethod(): string | null {
    const stack = this.getStack();
    return stack.length > 0 ? stack[stack.length - 1] : null;
  }

  /**
   * Get the parent method name (second to last item in stack)
   */
  getParentMethod(): string | null {
    const stack = this.getStack();
    return stack.length > 1 ? stack[stack.length - 2] : null;
  }

  /**
   * Clear the entire call stack
   */
  clear(): void {
    context.active().setValue(this.STACK_KEY, []);
  }
}
