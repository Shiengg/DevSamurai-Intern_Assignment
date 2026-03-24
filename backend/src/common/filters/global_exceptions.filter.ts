import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const request = context.getRequest<Request>();

        const sanitizedBody = this.sanitizeResponseBody(request.body);

        let status: number;
        let message: string;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                message = (exceptionResponse as any).message || 'Internal server error';
            } else {
                message = 'Internal server error';
            }
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
        }

        this.logger.error(
            `${request.method} ${request.url} - Error: ${message} - Body: ${JSON.stringify(sanitizedBody)}`,
            exception instanceof Error ? exception.stack : undefined,
        )

        response.status(status).json({
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        })
    }

    private sanitizeResponseBody(body: any): any {
        if (!body || typeof body !== 'object') {
            return body;
        }

        const sanitized = { ...body };
        const sensitiveFields = ['password', 'passwordhash', 'token', 'secret'];
        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });

        return sanitized;
    }
}