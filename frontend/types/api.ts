export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    total: number;
    page: number;
    limit: number;
}

export interface ApiErrorResponse<T> extends ApiResponse<T> {
    message: string;
    statusCode: number;
    error: string;
}