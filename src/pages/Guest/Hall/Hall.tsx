import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../../context/ApiContext';
import Header from '../../../components/Header/Header';
import HallScheme from '../../../components/HallScheme/HallScheme';
import { Seat } from '@/types';
import './Hall.scss';

const Hall = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { seances, films, halls } = useApi();

  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [hallConfig, setHallConfig] = useState<string[][]>([]);
  const [standardPrice, setStandardPrice] = useState(250);
  const [vipPrice, setVipPrice] = useState(350);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Находим текущий сеанс, фильм и зал
  const seance = seances.find(s => s.id === Number(sessionId));
  const movie = seance ? films.find(m => m.id === seance.seance_filmid) : null;
  const hall = seance ? halls.find(h => h.id === seance.seance_hallid) : null;

  // Формируем конфигурацию зала из /alldata
  useEffect(() => {
    if (!sessionId || !seance || !movie || !hall) {
      setLoading(false);
      setError('Сеанс или зал не найден');
      return;
    }

    let config = hall.hall_config || [];

    // Если сервер вернул пустую конфигурацию — создаём базовую
    if (config.length === 0 || config.every(row => row.length === 0)) {
      config = Array.from({ length: hall.hall_rows }, () =>
        Array(hall.hall_places).fill('standart')
      );
    }

    setHallConfig(config);
    setStandardPrice(hall.hall_price_standart || 250);
    setVipPrice(hall.hall_price_vip || 350);
    setLoading(false);
    setError(null);

  }, [sessionId, seance, movie, hall]);

  const totalPrice = selectedSeats.reduce((sum, seat) => 
    sum + (seat.type === 'vip' ? vipPrice : standardPrice), 0);

  const handleSeatsChange = (seats: Seat[]) => {
    setSelectedSeats(seats);
  };

  const handleBook = () => {
    if (selectedSeats.length === 0 || !seance || !movie || !hall) return;

    navigate('/payment', {
      state: {
        sessionId: Number(sessionId),
        movieTitle: movie.film_name,
        time: seance.seance_time,
        hall: hall.hall_name || `Зал ${hall.id}`,
        hallName: hall.hall_name,           // важно для Ticket
        date: new Date().toLocaleDateString('ru-RU', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        }),
        selectedSeats,
        totalPrice
      }
    });
  };

  if (loading) {
    return (
      <>
        <Header variant="transparent" />
        <div className="hall-page">
          <div className="hall-page__content">
            <div className="text-center py-10 text-white">Загрузка схемы зала...</div>
          </div>
        </div>
      </>
    );
  }

  if (error || !seance || !movie || !hall) {
    return (
      <>
        <Header variant="transparent" />
        <div className="hall-page">
          <div className="hall-page__content">
            <div className="text-center py-10 text-red-400">
              {error || 'Сеанс не найден'}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header variant="transparent" />

      <div className="hall-page">
        <div className="hall-page__background" />

        <div className="hall-page__content">

          {/* Заголовок */}
          <div className="hall-page__header">
            <div className="logo-big">
              ИДЁМ<span className="logo-big__v">В</span>КИНО
            </div>
          </div>

          {/* Информация о сеансе */}
          <div className="hall-page__info">
            <h1 className="hall-page__title">{movie.film_name}</h1>
            <p className="hall-page__details">
              Начало сеанса: <strong>{seance.seance_time}</strong> • {hall.hall_name || `Зал ${hall.id}`}
            </p>
          </div>

          {/* Схема зала */}
          <div className="hall-scheme-wrapper">
            <HallScheme 
              config={hallConfig} 
              onSeatsChange={handleSeatsChange} 
            />
          </div>

          {/* Действия */}
          <div className="hall-page__actions">
            <div className="selected-info">
              Выбрано мест: <strong>{selectedSeats.length}</strong> • 
              Сумма: <strong>{totalPrice} ₽</strong>
            </div>

            <button
              className="btn btn-book"
              onClick={handleBook}
              disabled={selectedSeats.length === 0}
            >
              ЗАБРОНИРОВАТЬ
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default Hall;