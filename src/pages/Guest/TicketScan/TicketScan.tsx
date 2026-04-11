import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../../../components/Header/Header';
import './TicketScan.scss';

const TicketScan = () => {
  const [searchParams] = useSearchParams();
  const [ticketData, setTicketData] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const encodedData = searchParams.get('data');

    if (!encodedData) {
      setStatus('error');
      return;
    }

    try {
      const decoded = JSON.parse(decodeURIComponent(encodedData));
      setTicketData(decoded);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }, [searchParams]);

  if (status === 'loading') {
    return <div className="ticket-scan-page">Загрузка билета...</div>;
  }

  if (status === 'error' || !ticketData) {
    return (
      <>
        <Header variant="transparent" />
        <div className="ticket-scan-page">
          <h2>Ошибка</h2>
          <p>Неверный QR-код или билет не найден</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header variant="transparent" />
      <div className="ticket-scan-page">
        <div className="ticket-scan-card">
          <h1 className="logo-big">ИДЁМ<span className="logo-big__v">В</span>КИНО</h1>

          <div className="scan-status success">
            ✓ Билет подтверждён
          </div>

          <div className="scan-info">
            <h2>{ticketData.movie}</h2>
            <p><strong>Дата:</strong> {ticketData.date}</p>
            <p><strong>Начало сеанса:</strong> {ticketData.time}</p>
            <p><strong>Зал:</strong> {ticketData.hall}</p>
            <p><strong>Места:</strong> {ticketData.seats}</p>
            <p><strong>Статус оплаты:</strong> <span className="paid">Оплачено</span></p>
          </div>

          <div className="scan-note">
            Билет действителен строго на свой сеанс.<br />
            Приятного просмотра!
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketScan;