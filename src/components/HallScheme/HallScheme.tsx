import { useState} from 'react';
import { Seat } from '@/types';
import './HallScheme.scss';

interface HallSchemeProps {
  config: string[][];           
  onSeatsChange: (seats: Seat[]) => void;
}

const HallScheme = ({ config, onSeatsChange }: HallSchemeProps) => {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  // Преобразуем конфигурацию сервера в массив Seat
  const generateSeats = (): Seat[] => {
    const seats: Seat[] = [];

    config.forEach((row, rowIndex) => {
      row.forEach((type, colIndex) => {
        const seatNumber = colIndex + 1;

        const seat: Seat = {
          id: `${rowIndex + 1}-${seatNumber}`,
          row: rowIndex + 1,
          number: seatNumber,
          type: type === 'vip' ? 'vip' : 'standard',
          status: type === 'taken' ? 'occupied' : 
                  type === 'disabled' ? 'blocked' : 'free',
        };
        seats.push(seat);
      });
    });

    return seats;
  };

  const seats = generateSeats();

  const toggleSeat = (seat: Seat) => {
    if (seat.status === 'occupied' || seat.status === 'blocked') return;

    let newSelected: Seat[];
    if (selectedSeats.some(s => s.id === seat.id)) {
      newSelected = selectedSeats.filter(s => s.id !== seat.id);
    } else {
      newSelected = [...selectedSeats, seat];
    }

    setSelectedSeats(newSelected);
    onSeatsChange(newSelected);
  };

  // Группируем по рядам
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);

  return (
    <div className="hall-scheme">
      <div className="hall-scheme__screen">ЭКРАН</div>

      <div className="hall-scheme__rows">
        {Object.keys(seatsByRow).map((rowNumStr) => {
          const rowNum = parseInt(rowNumStr);
          const rowSeats = seatsByRow[rowNum];

          return (
            <div key={rowNum} className="hall-row">
              {/* Убрали номер ряда */}
              {/* <div className="row-number">{rowNum}</div> */}

              <div className="hall-row__seats">
                {rowSeats.map((seat) => {
                  const isSelected = selectedSeats.some(s => s.id === seat.id);

                  return (
                    <button
                      key={seat.id}
                      className={`seat 
                        seat--${seat.type} 
                        seat--${seat.status} 
                        ${isSelected ? 'seat--selected' : ''}`}
                      onClick={() => toggleSeat(seat)}
                      disabled={seat.status === 'occupied' || seat.status === 'blocked'}
                    >
                      {/* Убрали номер места внутри кресла */}
                      {/* {seat.number} */}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Легенда */}
      <div className="hall-scheme__legend">
        <div className="legend-item">
          <span className="seat seat--standard seat--free"></span>
          <span>Свободно (обычное)</span>
        </div>
        <div className="legend-item">
          <span className="seat seat--vip seat--free"></span>
          <span>Свободно VIP</span>
        </div>
        <div className="legend-item">
          <span className="seat seat--occupied"></span>
          <span>Занято</span>
        </div>
        <div className="legend-item">
          <span className="seat seat--selected"></span>
          <span>Выбрано</span>
        </div>
      </div>
    </div>
  );
};

export default HallScheme;