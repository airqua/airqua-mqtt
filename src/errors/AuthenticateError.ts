export class AuthenticateError extends Error {
    returnCode: number;

    constructor(code: number, message?: string) {
        super(message);
        this.returnCode = code;
    }
}