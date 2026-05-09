import { useState, useEffect } from 'react';
import { useApi } from '../../../context/ApiContext';
import api from '../../../api/Api';
import './AddSeanceModal.scss';

interface AddSeanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSeanceModal = ({ isOpen, onClose, onSuccess }: AddSeanceModalProps) => {
  const { halls, films } = useApi();

  const [selectedHallId, setSelectedHallId] = useState<number | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [time, setTime] = useState('14:00');
  const [isSaving, setIsSaving] = useState(false);

  // При открытии модалки сбрасываем значения
  useEffect(() => {
    if (isOpen) {
      setSelectedHallId(halls.length > 0 ? halls[0].id : null);
      setSelectedMovieId(films.length > 0 ? films[0].id : null);
      setTime('14:00');
    }
  }, [isOpen, halls, films]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selectedHallId || !selectedMovieId) {
      alert('Выберите зал и фильм');
      return;
    }

    setIsSaving(true);
    try {
      await api.addSeance(selectedHallId, selectedMovieId, time);
      alert(`✅ Сеанс на ${time} успешно добавлен!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert('❌ ' + (err.message || 'Не удалось добавить сеанс'));
    } finally {
      setIsSaving(false);
    }
  };

  

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>ДОБАВЛЕНИЕ СЕАНСА</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Название зала</label>
            <select 
              value={selectedHallId || ''} 
              onChange={(e) => setSelectedHallId(Number(e.target.value))}
            >
              {halls.map(hall => (
                <option key={hall.id} value={hall.id}>
                  {hall.hall_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Название фильма</label>
            <select 
              value={selectedMovieId || ''} 
              onChange={(e) => setSelectedMovieId(Number(e.target.value))}
            >
              {films.map(film => (
                <option key={film.id} value={film.id}>
                  {film.film_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Время начала</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            ОТМЕНИТЬ
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={isSaving || !selectedHallId || !selectedMovieId}
          >
            {isSaving ? 'Добавление...' : 'ДОБАВИТЬ СЕАНС'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSeanceModal;