import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { BookingData } from '@/types';
import Header from '../../../components/Header/Header';
import './Ticket.scss';

const Ticket = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const qrRef = useRef<HTMLCanvasElement>(null);

  const bookingData = location.state as BookingData | null;
  const [isSaved, setIsSaved] = useState(false);

  if (!bookingData) {
    return (
      <>
        <Header variant="transparent" />
        <div className="ticket-page">
          <div className="ticket-page__content">
            <div className="error-message">Ошибка: данные билета не найдены</div>
          </div>
        </div>
      </>
    );
  }

  const { movieTitle, time, hall, date, selectedSeats, totalPrice } = bookingData;

  // Формируем ЧЕЛОВЕКОЧИТАЕМЫЙ текст для QR-кода (именно то, что увидит контролёр)
  const qrText = `
ИДЁМ В КИНО

БИЛЕТ № ${Date.now().toString(36).toUpperCase()}

ФИЛЬМ: ${movieTitle}
ДАТА:  ${date}
ВРЕМЯ: ${time}
ЗАЛ:   ${hall}

МЕСТА: ${selectedSeats.map(s => `Ряд ${s.row} место ${s.number}`).join(', ')}

СТОИМОСТЬ: ${totalPrice} ₽

Билет действителен строго на свой сеанс
  `.trim();

  // Генерация QR-кода
  useEffect(() => {
    if (qrRef.current) {
      QRCode.toCanvas(qrRef.current, qrText, {
        width: 280,
        margin: 2,
        color: { dark: '#1a1a1a', light: '#ffffff' },
        errorCorrectionLevel: 'H'
      });
    }
  }, [qrText]);

  const handleSaveTicket = () => {
    const savedTickets = JSON.parse(localStorage.getItem('savedTickets') || '[]');
    savedTickets.push({
      code: `BK-${Date.now().toString(36).toUpperCase()}`,
      ...bookingData,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('savedTickets', JSON.stringify(savedTickets));
    setIsSaved(true);
    alert('Билет успешно сохранён!');
  };

  return (
    <>
      <Header variant="transparent" />

      <div className="ticket-page">
        <div className="ticket-page__background" />

        <div className="ticket-page__content">
          <div className="logo-big">
            ИДЁМ<span className="logo-big__v">В</span>КИНО
          </div>

          <div className="ticket-card">
            <div className="ticket-card__header">
              <div className="ticket-title">ЭЛЕКТРОННЫЙ БИЛЕТ</div>
            </div>

            <div className="ticket-content">
              <div className="ticket-info">
                <p><strong>Фильм:</strong> {movieTitle}</p>
                <p><strong>Дата:</strong> {date}</p>
                <p><strong>Время:</strong> {time}</p>
                <p><strong>Зал:</strong> {hall}</p>
                <p><strong>Места:</strong> {selectedSeats.map(s => `Ряд ${s.row}, место ${s.number}`).join(', ')}</p>
                <p><strong>Стоимость:</strong> {totalPrice} ₽</p>
              </div>

              <div className="qr-section">
                <h3>QR-код для входа</h3>
                <div className="qr-container">
                  <canvas ref={qrRef} className="qr-code" />
                </div>
              </div>

              <div className="ticket-note">
                Билет действителен строго на свой сеанс.<br />
                Покажите QR-код контролёру при входе в зал.
              </div>
            </div>

            <div className="ticket-actions">
              <button 
                className="btn btn-outline-light" 
                onClick={() => navigate('/')}
              >
                Вернуться на главную
              </button>

              <button 
                className="btn btn-success" 
                onClick={handleSaveTicket} 
                disabled={isSaved}
              >
                {isSaved ? '✓ Билет сохранён' : 'Сохранить билет'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Ticket;