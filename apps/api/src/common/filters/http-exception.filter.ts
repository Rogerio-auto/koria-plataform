/**
 * Global HTTP exception filter — standardizes error responses.
 * TODO: Implement with ExceptionFilter interface
 * TODO: Log errors to core.errors table
 */

// import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

// @Catch(HttpException)
// export class HttpExceptionFilter implements ExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse();
//     const status = exception.getStatus();
//     response.status(status).json({
//       statusCode: status,
//       message: exception.message,
//       timestamp: new Date().toISOString(),
//     });
//   }
// }

export {}; // placeholder
