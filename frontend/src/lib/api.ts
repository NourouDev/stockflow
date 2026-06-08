import { auth } from "./firebase";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) return {};
  
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
  };
}

export const api = {
  async get(path: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}${path}`, { headers });
    return res.json();
  },
  async post(path: string, body: any) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return res.json();
  },
  async patch(path: string, body: any) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return res.json();
  },
  async delete(path: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "DELETE",
      headers,
    });
    return res.status === 204 ? null : res.json();
  },
};
