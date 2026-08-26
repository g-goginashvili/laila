const request = async (
    path: string, accessToken?: string, options?: RequestInit
) => {
    const requestSkeleton = async (token?: string) => {
        return await fetch(`https://core.gviano.com/api${path}`, {
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options?.headers,
            },
            ...options,
        });
    };

    const response = await requestSkeleton(accessToken);
    const responseJson = await response.json();
    if (!response.ok) throw new Error(`Request failed: ${responseJson.error}`);
    
    return responseJson;
};

export const http = {
    get: (path: string, accessToken?: string, options?: RequestInit) =>
        request(path, accessToken, { ...options, method: "GET" }),
    post: (path: string, body: unknown, accessToken?: string, options?: RequestInit) =>
        request(path, accessToken, { ...options, method: "POST", body: JSON.stringify(body) }),
    put: (path: string, body: unknown, accessToken?: string, options?: RequestInit) =>
        request(path, accessToken, { ...options, method: "PUT", body: JSON.stringify(body) }),
    delete: (path: string, accessToken?: string, options?: RequestInit) =>
        request(path, accessToken, { ...options, method: "DELETE" }),
};