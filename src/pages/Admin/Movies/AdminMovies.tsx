import { useState } from 'react';
import { useApi } from '../../context/ApiContext';
import api from '../../api/Api';
import './AdminMovies.scss';

const AdminMovies = () => {
  const { movies, refreshData } = useApi();

  const [filmName, setFilmName] = useState('');
  const [filmDuration, setFilmDuration] = useState('');
  const [filmDescription, setFilmDescription] = useState('');
  const [filmOrigin, setFilmOrigin] = useState('');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPosterFile(e.target.files[0]);
    }
  };

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filmName || !filmDuration || !posterFile) {
      alert('Заполните название, длительность и загрузите постер');
      return;
    }

    setIsAdding(true);

    try {
      const formData = new FormData();
      formData.append('filmName', filmName);
      formData.append('filmDuration', filmDuration);
      formData.append('filmDescription', filmDescription);
      formData.append('filmOrigin', filmOrigin);
      formData.append('filePoster', posterFile);

      await api.addMovie(formData);   // пока метод не существует — будет ошибка

      alert('✅ Фильм успешно добавлен!');
      setFilmName('');
      setFilmDuration('');
      setFilmDescription('');
      setFilmOrigin('');
      setPosterFile(null);
      await refreshData();
    } catch (err: any) {
      alert('❌ ' + (err.message || 'Ошибка добавления фильма'));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="admin-movies">
      <div className="admin-section">
        <div className="admin-section__header">
          <h2>УПРАВЛЕНИЕ ФИЛЬМАМИ</h2>
        </div>

        <form onSubmit={handleAddMovie} className="add-movie-form">
          <div className="form-group">
            <label>Название фильма</label>
            <input
              type="text"
              value={filmName}
              onChange={(e) => setFilmName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Длительность (мин)</label>
              <input
                type="number"
                value={filmDuration}
                onChange={(e) => setFilmDuration(e.target.value)}
                required
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
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              value={filmDescription}
              onChange={(e) => setFilmDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Постер фильма (png, до 3 Мб)</label>
            <input 
              type="file" 
              accept="image/png" 
              onChange={handleFileChange}
              required 
            />
            {posterFile && <p>Выбран файл: {posterFile.name}</p>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={isAdding}>
            {isAdding ? 'Добавление...' : 'Добавить фильм'}
          </button>
        </form>
      </div>

      <div className="movies-list">
        <h3>Существующие фильмы ({movies.length})</h3>
        <div className="movies-grid">
          {movies.map((movie) => (
            <div key={movie.id} className="movie-card">
              <div className="movie-poster">
                {movie.film_poster ? (
                  <img src={movie.film_poster} alt={movie.film_name} />
                ) : (
                  <div className="no-poster">Нет постера</div>
                )}
              </div>
              <div className="movie-info">
                <h4>{movie.film_name}</h4>
                <p>{movie.film_duration} мин • {movie.film_origin}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminMovies;