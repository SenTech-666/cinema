import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../context/ApiContext';
import './Home.scss';

const Home = () => {
  const { films, seances, halls, loading, error, refreshData } = useApi();
  const navigate = useNavigate();

  // ==================== Управление выбранным днём ====================
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  const dates = useMemo(() => {
    const result = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      const dayName = dayNames[date.getDay()];
      const dayNumber = date.getDate();

      result.push({
        fullDate: date.toISOString().split('T')[0],
        display: `${dayName}, ${dayNumber}`,
        isSaturday: date.getDay() === 6,
        isToday: i === 0,
      });
    }
    return result;
  }, []);

 

  // Фильтруем только активные залы (hall_open === 1)
  const activeHalls = useMemo(() => {
    return halls.filter(hall => hall.hall_open === 1);
  }, [halls]);

  // Фильтрация сеансов: только для активных залов и выбранной даты
  const filteredSeances = useMemo(() => {
    return seances.filter(seance => {
      const hall = activeHalls.find(h => h.id === seance.seance_hallid);
      return hall !== undefined; // только активные залы
    });
  }, [seances, activeHalls]);

  const handleSeanceClick = (seanceId: number) => {
    navigate(`/hall/${seanceId}`);
  };

  const getHallName = (hallId: number): string => {
    const hall = activeHalls.find((h) => h.id === hallId);
    return hall ? hall.hall_name : `Зал ${hallId}`;
  };

  if (loading) {
    return (
      <div className="home">
        <div className="container py-5 text-center">
          <h2>Загрузка афиши...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home">
        <div className="container py-5 text-center text-danger">
          <h2>Ошибка загрузки</h2>
          <p>{error}</p>
          <button className="btn btn-primary mt-3" onClick={refreshData}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Header */}
      <header className="home__header">
        <div className="container">
          <div className="home__top">
            <h1 className="logo">
              ИДЁМ<span>В</span>КИНО
            </h1>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/login')}
            >
              ВОЙТИ
            </button>
          </div>
        </div>
      </header>

      <div className="home__content">
        <div className="container">
          {/* Блок дат */}
          <div className="date-picker">
            {dates.slice(0, 6).map((date, index) => (
              <div
                key={index}
                className={`date-item ${index === selectedDateIndex ? 'active' : ''} ${date.isSaturday ? 'saturday' : ''}`}
                onClick={() => setSelectedDateIndex(index)}
                style={{
                  width: index === selectedDateIndex ? '241px' : '125px',
                }}
              >
                {date.display}
              </div>
            ))}

            <div 
              className="date-item arrow" 
              onClick={() => alert('Перелистывание недели — в разработке')}
            >
              →
            </div>
          </div>

          {/* Список фильмов */}
          {films.length > 0 ? (
            films.map((film) => {
              // Фильтруем сеансы только для активных залов
              const movieSeances = filteredSeances.filter(
                (s) => s.seance_filmid === film.id
              );

              const seancesByHall: Record<number, any[]> = {};

              movieSeances.forEach((seance) => {
                if (!seancesByHall[seance.seance_hallid]) {
                  seancesByHall[seance.seance_hallid] = [];
                }
                seancesByHall[seance.seance_hallid].push(seance);
              });

              if (Object.keys(seancesByHall).length === 0) {
                return null;
              }

              return (
                <div key={film.id} className="movie-row">
                  {/* Левая часть: Постер + залы под ним */}
                  <div className="movie-row__left">
                    <div className="movie-row__poster">
                      <img
                        src={film.film_poster || "https://via.placeholder.com/300x420/1a1a1a/ffffff?text=Постер"}
                        alt={film.film_name}
                      />
                    </div>

                    {/* Блоки залов под постером */}
                    <div className="home-seance-blocks">
                      {Object.entries(seancesByHall).map(([hallIdStr, hallSeances]) => {
                        const hallId = Number(hallIdStr);
                        const hallName = getHallName(hallId);

                        return (
                          <div key={hallId} className="home-seance-block">
                            <div className="home-seance-block__title">{hallName}</div>
                            <div className="home-seance-times">
                              {hallSeances.map((seance) => (
                                <span
                                  key={seance.id}
                                  className="home-time"
                                  onClick={() => handleSeanceClick(seance.id)}
                                >
                                  {seance.seance_time}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Правая часть: Название и описание */}
                  <div className="movie-row__info">
                    <h2 className="movie-row__title">{film.film_name}</h2>
                    <p className="movie-row__meta">
                      {film.film_duration} мин • {film.film_origin || '—'}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-5">
              <p>На данный момент нет доступных фильмов</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;