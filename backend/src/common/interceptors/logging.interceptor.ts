import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body } = request;

        const sanitizedBody = this.sanitizeRequestBody(body);

        this.logger.log(`${method} ${url} - Request: ${JSON.stringify(sanitizedBody)}`);

        const now = Date.now();
        return next.handle().pipe(
            tap((response) => {
                const responseTime = Date.now() - now;
                const sanitizedResponse = this.sanitizeResponseBody(response);

                this.logger.log(
                    `${method} ${url} - Response (${responseTime}ms): ${JSON.stringify(sanitizedResponse)}`,
                );
            }),
            catchError((error) => {
                const responseTime = Date.now() - now;
                this.logger.error(
                    `${method} ${url} - Error (${responseTime}ms): ${error.message}`,
                    error.stack,
                );
                return throwError(() => error);
            }),
        );
    }

    private sanitizeRequestBody(body: any): any {
        if (!body) return body;

        const sanitized = { ...body };

        // Remove sensitive fields
        const sensitiveFields = ['password', 'passwordhash', 'token', 'secret'];

        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });

        return sanitized;
    }

    private sanitizeResponseBody(response: any): any {
        if (!response) return response;

        const sanitized = { ...response };

        const sensitiveFields = ['password', 'passwordhash', 'token', 'secret'];

        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });

        // If response has user object, sanitize it
        if (sanitized.user && sanitized.user.passwordhash) {
            sanitized.user = { ...sanitized.user, passwordhash: '[REDACTED]' };
        }

        return sanitized;
    }
}
