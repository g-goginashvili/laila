import { firebaseAuth } from "./firebase";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://core.gviano.com/api";

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

const parseBody = async (response: Response) => {
    const text = await response.text();
    if (!text) return undefined;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
    const token = await firebaseAuth.currentUser?.getIdToken();

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    });

    const body = await parseBody(response);

    if (!response.ok) {
        const message = typeof body === "object" && body?.message ? body.message : `Request failed (${response.status})`;
        throw new ApiError(response.status, message);
    }

    return body as T;
};

export const http = {
    get: <T>(path: string, options?: RequestInit) =>
        request<T>(path, { ...options, method: "GET" }),
    post: <T>(path: string, body: unknown, options?: RequestInit) =>
        request<T>(path, { ...options, method: "POST", body: JSON.stringify(body) }),
    put: <T>(path: string, body: unknown, options?: RequestInit) =>
        request<T>(path, { ...options, method: "PUT", body: JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown, options?: RequestInit) =>
        request<T>(path, { ...options, method: "PATCH", body: JSON.stringify(body) }),
    delete: <T>(path: string, options?: RequestInit) =>
        request<T>(path, { ...options, method: "DELETE" }),
};
