import { Response } from 'express';


export namespace respond {
    /**
     * Response after server error (HTTP 500)
     * @param res Express response object
     * @param error Error message explaining the error
     */
    export function serverError(res: Response, error: string) {
        res.status(500);
        const body = { success: false, error };
        res.json(body);
        return body;
    }

    /**
     * Response after bad request (HTTP 400)
     * @param res Express response object
     * @param error Error message explaining the error
     */
    export function badRequest(res: Response, error: string) {
        res.status(400);
        const body = { success: false, error };
        res.json(body);
        return body;
    }

    /**
     * Response when a resource is not found (HTTP 404)
     * @param res Express response object
     * @param error Error message explaining the error
     */
    export function notFound(res: Response, error: string) {
        res.status(404);
        const body = { success: false, error };
        res.json(body);
        return body;
    }

    /**
     * Response after a correct authentication, contains a valid JWT token
     * @param res Express response object
     * @param token Token of the authenticated user
     */
    export function withAuthToken(res: Response, token: string) {
        res.status(200);
        const body = { success: true, token };
        res.json(body);
        return body;
    }

    /**
     * Response after a user creation
     * @param res Express response object
     * @param token Token of the authenticated user
     */
    export function withId(res: Response, id: string) {
        res.status(200);
        const body = { success: true, id };
        res.json(body);
        return body;
    }

    /**
     * Response after an incorrect authentication
     * @param res Express response object
     * @param error Message explaining the error
     */
    export function notAuthenticated(res: Response, error?: string) {
        res.status(401);
        const body = { success: false, error: error ?? 'Unauthorized access' };
        res.json(body);
        return body;
    }
}