import { useState } from 'react';
import api from '../../../api/Api';
import './AddMovieModal.scss';

interface AddMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddMovieModal = ({ isOpen, onClose, onSuccess }: AddMovieModalProps) => {
  const [filmName, setFilmName] = useState('');
  const [filmDuration, setFilmDuration] = useState('');
  const [filmDescription, setFilmDescription] = useState('');
  const [filmOrigin, setFilmOrigin] = useState('');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPosterFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filmName || !filmDuration || !posterFile) {
      alert('Заполните название, длительность и загрузите постер');
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('filmName', filmName);
      formData.append('filmDuration', filmDuration);
      if (filmDescription) formData.append('filmDescription', filmDescription);
      if (filmOrigin) formData.append('filmOrigin', filmOrigin);
      formData.append('filePoster', posterFile);

      await api.addMovie(formData);   // вызов API

      alert('✅ Фильм успешно добавлен!');
      onSuccess();
      onClose();

      // Сброс формы
      setFilmName('');
      setFilmDuration('');
      setFilmDescription('');
      setFilmOrigin('');
      setPosterFile(null);
    } catch (err: any) {
      alert('❌ ' + (err.message || 'Ошибка добавления фильма'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>ДОБАВЛЕНИЕ ФИЛЬМА</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Название фильма</label>
              <input
                type="text"
                placeholder="Например, «Гражданин Кейн»"
                value={filmName}
                onChange={(e) => setFilmName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Продолжительность фильма (мин.)</label>
              <input
                type="number"
                value={filmDuration}
                onChange={(e) => setFilmDuration(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Описание фильма</label>
              <textarea
                rows={4}
                value={filmDescription}
                onChange={(e) => setFilmDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Страна</label>
              <input
                type="text"
                value={filmOrigin}
                onChange={(e) => setFilmOrigin(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Постер фильма (png, jpg)</label>
              <input 
                type="file" 
                accept="image/png, image/jpeg" 
                onChange={handleFileChange}
                required 
              />
              {posterFile && <p className="file-name">Выбран: {posterFile.name}</p>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              ОТМЕНИТЬ
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Добавление...' : 'ДОБАВИТЬ ФИЛЬМ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMovieModal;