const API_BASE_URL = 'http://localhost:3000/api/v1';

export const api = {
  async get(endpoint: string) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn(`Fallback local para endpoint: ${endpoint}`);
      return null;
    }
  },
  async post(endpoint: string, data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn(`Fallback local para POST endpoint: ${endpoint}`);
      return { success: true, message: 'Operação realizada com sucesso (Modo PoC)' };
    }
  },
  async put(endpoint: string, data?: any) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {})
      });
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn(`Fallback local para PUT endpoint: ${endpoint}`);
      return { success: true, message: 'Atualização concluída (Modo PoC)' };
    }
  }
};
