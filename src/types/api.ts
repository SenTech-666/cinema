// src/types/api.ts — актуальные типы под реальный API Нетологии
export interface Hall {
  id: number;
  hall_name: string;           
  hall_rows: number;
  hall_places: number;
  hall_config: string[][];     
  hall_price_standart: number;
  hall_price_vip: number;
  hall_open: 0 | 1;            // 0 = закрыт, 1 = открыт
}

export interface Movie {
  id: number;
  film_name: string;
  film_duration: number;
  film_origin?: string;
  film_poster?: string;
}

export interface Seance {
  id: number;
  seance_filmid: number;
  seance_hallid: number;
  seance_time: string;
}

export interface AllDataResponse {
  halls: Hall[];
  films: Movie[];
  seances: Seance[];
}