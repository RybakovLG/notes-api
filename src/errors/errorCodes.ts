export const appErrorsByCode = {
    ENTITY_PARSE_FAILED: {
        title: 'Entity parse failed',
        status: 400,
        detail: 'Неверный формат JSON',
    },
    VALIDATION_ERROR: {
        title: 'Validation error',
        status: 400,
        detail: 'Неверный формат данных',
    },
    METHOD_NOT_ALLOWED: {
        title: 'Method not allowed',
        status: 405,
        detail: 'Метод запроса не разрешён',
    },
    ENTITY_TOO_LARGE: {
        title: 'Entity too large',
        status: 413,
        detail: 'Превышен размер запроса',
    },
    INTERNAL_SERVER_ERROR: {
        title: 'Internal server error',
        status: 500,
        detail: 'Внутренняя ошибка сервера',
    },
    ENTITY_NOT_FOUND: {
        title: 'Entity not found',
        status: 404,
        detail: 'Сущность не найдена',
    },
} satisfies Record<string, { title: string, status: number, detail: string }>

export type AppErrorCode = keyof typeof appErrorsByCode

export const problemType = (code: AppErrorCode) =>
    `/problems/${code.toLowerCase().replaceAll('_', '-')}`
