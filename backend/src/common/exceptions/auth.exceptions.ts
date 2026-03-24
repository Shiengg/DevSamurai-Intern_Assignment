import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
    constructor() {
        super(
            {
                statusCode: HttpStatus.UNAUTHORIZED,
                message: 'User not found',
                error: 'UserNotFoundException',
            },
            HttpStatus.UNAUTHORIZED,
        )
    }
}

export class UserAlreadyExistsException extends HttpException {
    constructor() {
        super(
            {
                statusCode: HttpStatus.CONFLICT,
                message: 'This email is already registered. Please sign in or try another email.',
                error: 'UserAlreadyExistsException',
            },
            HttpStatus.CONFLICT,
        )
    }
}

export class InvalidCredentialsException extends HttpException {
    constructor() {
        super(
            {
                statusCode: HttpStatus.UNAUTHORIZED,
                message: 'Invalid credentials. Please check your email and password.',
                error: 'InvalidCredentialsException',
            },
            HttpStatus.UNAUTHORIZED,
        )
    }
}