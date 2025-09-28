// api.ts
const API_BASE_URL = "/api";  // All API calls go through Nginx proxy

export async function fetchInstructions(category: string) {
    const res = await fetch(`${API_BASE_URL}/instructions/${category}`);
    return res.json();
}
