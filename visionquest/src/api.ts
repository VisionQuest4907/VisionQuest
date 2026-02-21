const API_BASE = import.meta.env.VITE_API_BASE as string;

if (!API_BASE){
    throw new Error("WITE_API_BASE not defined");
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
): Promise<T> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if(token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `API Error ${response.status}: ${errorText || response.statusText}`
        );
    }
    return response.json();
}