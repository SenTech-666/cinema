import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookingData } from '@/types';
import Header from '../../../components/Header/Header';
import './Payment.scss';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state as BookingData | null;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!bookingData) {
    return (
      <>
        <Header variant="transparent" />
        <div className="payment-page">
          <div className="container py-5 text-center text-white">
            Ошибка: данные бронирования не найдены
          </div>
        </div>
      </>
    );
  }

  const { movieTitle, time, hall, date, selectedSeats, totalPrice, sessionId } = bookingData;

  const handleGetCode = async () => {
    if (!sessionId) {
      setError('Отсутствует ID сеанса');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('seanceId', sessionId.toString());
      formData.append('ticketDate', new Date().toISOString().split('T')[0]); // сегодняшняя дата

      // Формируем массив tickets согласно документации
      const ticketsArray = selectedSeats.map(seat => ({
        row: seat.row,
        place: seat.number,
        coast: seat.type === 'vip' ? 350 : 250, // или брать из bookingData, если хранишь
      }));

      formData.append('tickets', JSON.stringify(ticketsArray));

      const response = await fetch('https://shfe-diplom.neto-server.ru/ticket', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.result) {
        // Переходим на страницу с QR-кодом и передаём реальные данные билетов
        navigate('/ticket', {
          state: {
            ...bookingData,
            tickets: data.result.tickets, // данные с сервера
          }
        });
      } else {
        setError(data.error || 'Не удалось создать билеты');
      }
    } catch (err: any) {
      console.error(err);
      setError('Ошибка соединения с сервером. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header variant="transparent" />

      <div className="payment-page">
        <div className="payment-page__background">
          <div className="payment-page__content">

            <div className="logo-big">
              ИДЁМ<span className="logo-big__v">В</span>КИНО
            </div>

            <div className="payment-card">
              <div className="payment-card__header">ВЫ ВЫБРАЛИ БИЛЕТЫ:</div>

              <div className="payment-card__body">
                <h2 className="payment-card__title">{movieTitle}</h2>

                <div className="payment-info">
                  <p>
                    <strong>Места:</strong>{' '}
                    {selectedSeats.map(s => `${s.row} ряд, место ${s.number}`).join(', ')}
                  </p>
                  <p><strong>В зале:</strong> {hall}</p>
                  <p><strong>Начало сеанса:</strong> {time}</p>
                  <p><strong>Дата:</strong> {date}</p>
                  <p><strong>Стоимость:</strong> {totalPrice} рублей</p>
                </div>
              </div>

              {error && <div className="payment-error">{error}</div>}

              <button 
                className="btn-get-code" 
                onClick={handleGetCode}
                disabled={isLoading}
              >
                {isLoading ? 'ОБРАБОТКА...' : 'ПОЛУЧИТЬ КОД БРОНИРОВАНИЯ'}
              </button>

              <div className="payment-note">
                После оплаты билет будет доступен в этом окне, а также придёт вам на почту.<br />
                Покажите QR-код нашему контролёру у входа в зал.<br />
                Приятного просмотра!
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Payment;