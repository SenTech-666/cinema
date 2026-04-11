// src/api/Api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'https://shfe-diplom.neto-server.ru';

class Api {
  private static instance: Api;
  private token: string | null = null;

  private constructor() {}

  static getInstance(): Api {
    if (!Api.instance) {
      Api.instance = new Api();
    }
    return Api.instance;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('authToken');
    }
    return this.token;
  }

  // ====================== Улучшенный request метод ======================
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      ...options.headers,
    } as HeadersInit;

    const token = this.getToken();
    if (token) {
      (headers as any).Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        try {
          const text = await response.text();
          if (text) errorMessage = text.substring(0, 200);
        } catch {}
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Ошибка API');
    }

    return data.result as T;
  }

  // ====================== Основные методы ======================
  async getAllData() {
    return this.request('/alldata');
  }

  async login(login: string, password: string) {
    const formData = new FormData();
    formData.append('login', login);
    formData.append('password', password);

    try {
      const result = await this.request<any>('/login', {
        method: 'POST',
        body: formData,
      });

      if (result.token) {
        this.setToken(result.token);
      }
      return result;
    } catch (err: any) {
      console.error('Login error details:', err);
      throw err;
    }
  }

  async addHall(hallName: string) {
    const formData = new FormData();
    formData.append('hallName', hallName);

    return this.request('/hall', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Открытие / приостановка продаж билетов в зале
   * @param hallId - ID зала
   * @param hallOpen - 1 = открыть продажи, 0 = закрыть продажи
   */
  async openSales(hallId: number, hallOpen: 0 | 1) {
    const formData = new FormData();
    formData.append('hallOpen', hallOpen.toString());

    return this.request(`/open/${hallId}`, {
      method: 'POST',
      body: formData,
    });
  }

  // ====================== Методы для админки ======================
  async deleteHall(hallId: number) {
    return this.request(`/hall/${hallId}`, {
      method: 'DELETE',
    });
  }

  async updateHallConfig(hallId: number, rowCount: number, placeCount: number, config: string[][]) {
    const formData = new FormData();
    formData.append('rowCount', rowCount.toString());
    formData.append('placeCount', placeCount.toString());
    formData.append('config', JSON.stringify(config));

    return this.request(`/hall/${hallId}`, {
      method: 'POST',
      body: formData,
    });
  }

  async updatePrices(hallId: number, priceStandart: number, priceVip: number) {
    const formData = new FormData();
    formData.append('priceStandart', priceStandart.toString());
    formData.append('priceVip', priceVip.toString());

    return this.request(`/price/${hallId}`, {
      method: 'POST',
      body: formData,
    });
  }

  // ====================== Методы для сеансов ======================
  async addSeance(seanceHallid: number, seanceFilmid: number, seanceTime: string) {
    const formData = new FormData();
    formData.append('seanceHallid', seanceHallid.toString());
    formData.append('seanceFilmid', seanceFilmid.toString());
    formData.append('seanceTime', seanceTime);

    return this.request('/seance', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteSeance(seanceId: number) {
    return this.request(`/seance/${seanceId}`, {
      method: 'DELETE',
    });
  }

  // Добавление фильма
  async addMovie(formData: FormData) {
    return this.request('/film', {
      method: 'POST',
      body: formData,
    });
  }
}

const api = Api.getInstance();
export default api;