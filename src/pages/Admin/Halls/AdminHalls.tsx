import { useState, useEffect } from 'react';
import { useApi } from '../../../context/ApiContext';
import api from '../../../api/Api';
import AddSeanceModal from '../../../components/Admin/Modals/AddSeanceModal';
import AddMovieModal from '../../../components/Admin/Modals/AddMovieModal';
import './AdminHalls.scss';

const AdminHalls = () => {
  const { halls, films, seances, refreshData } = useApi();

  // ==================== Состояние сворачивания блоков ====================
  const [isOpen, setIsOpen] = useState({
    halls: true,      // Управление залами
    config: true,     // Конфигурация залов
    prices: true,     // Конфигурация цен
    seances: true,    // Сетка сеансов
    sales: true,      // Открыть продажи
  });

  const toggleSection = (section: keyof typeof isOpen) => {
    setIsOpen(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // ==================== Основные состояния ====================
  const [selectedHallId, setSelectedHallId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newHallName, setNewHallName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Конфигурация зала
  const [rowsCount, setRowsCount] = useState(10);
  const [placesCount, setPlacesCount] = useState(12);
  const [localConfig, setLocalConfig] = useState<string[][]>([]);

  // Цены
  const [standardPrice, setStandardPrice] = useState(250);
  const [vipPrice, setVipPrice] = useState(350);

  // Drag & Drop сеанса
  const [draggedMovieId, setDraggedMovieId] = useState<number | null>(null);
  const [showAddSeanceModal, setShowAddSeanceModal] = useState(false);

  // Модалка добавления фильма
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);

  // Удаление сеанса
  const [isDeletingSeance, setIsDeletingSeance] = useState<number | null>(null);

  // ==================== БЛОК "ОТКРЫТЬ ПРОДАЖИ" ====================
  const [selectedOpenHallId, setSelectedOpenHallId] = useState<number | null>(null);
  const [isOpeningSales, setIsOpeningSales] = useState(false);

  // Выбор зала при загрузке
  useEffect(() => {
    if (halls.length > 0 && selectedHallId === null) {
      setSelectedHallId(halls[0].id);
      setSelectedOpenHallId(halls[0].id);
    }
  }, [halls]);

  const selectedHall = halls.find(h => h.id === selectedHallId);
  const selectedOpenHall = halls.find(h => h.id === selectedOpenHallId);

  // Загрузка данных выбранного зала
  useEffect(() => {
    if (selectedHall) {
      setRowsCount(selectedHall.hall_rows);
      setPlacesCount(selectedHall.hall_places);
      setLocalConfig(selectedHall.hall_config || []);
      setStandardPrice(selectedHall.hall_price_standart || 250);
      setVipPrice(selectedHall.hall_price_vip || 350);
    }
  }, [selectedHall]);

  // Пересоздание конфигурации при смене размеров
  useEffect(() => {
    const newConfig = Array.from({ length: rowsCount }, () =>
      Array(placesCount).fill('standart')
    );
    setLocalConfig(newConfig);
  }, [rowsCount, placesCount]);

  const toggleSeatType = (rowIndex: number, seatIndex: number) => {
    if (!localConfig[rowIndex]) return;
    const newConfig = localConfig.map(row => [...row]);
    const current = newConfig[rowIndex][seatIndex];

    if (current === 'standart') newConfig[rowIndex][seatIndex] = 'vip';
    else if (current === 'vip') newConfig[rowIndex][seatIndex] = 'disabled';
    else newConfig[rowIndex][seatIndex] = 'standart';

    setLocalConfig(newConfig);
  };

  // ==================== Управление залами ====================
  const handleCreateHall = async () => {
    if (!newHallName.trim()) return;
    try {
      await api.addHall(newHallName.trim());
      alert(`✅ Зал "${newHallName}" успешно создан!`);
      setNewHallName('');
      setShowCreateForm(false);
      await refreshData();
    } catch (err: any) {
      alert('❌ ' + (err.message || 'Ошибка создания зала'));
    }
  };

  const handleDeleteHall = async (hallId: number, hallName: string) => {
    if (!window.confirm(`Удалить зал "${hallName}"?\nВсе связанные сеансы также будут удалены.`)) return;
    setIsDeleting(hallId);
    try {
      await api.deleteHall(hallId);
      alert(`✅ Зал "${hallName}" успешно удалён`);
      await refreshData();
      if (selectedHallId === hallId) {
        setSelectedHallId(halls.length > 1 ? halls[0].id : null);
      }
    } catch (err: any) {
      alert('❌ ' + (err.message || 'Ошибка удаления зала'));
    } finally {
      setIsDeleting(null);
    }
  };

  // ==================== Сохранение ====================
  const handleSaveConfig = async () => {
    if (!selectedHall) return;
    setIsSaving(true);
    try {
      await api.updateHallConfig(selectedHall.id, rowsCount, placesCount, localConfig);
      alert('✅ Конфигурация зала успешно сохранена!');
      await refreshData();
    } catch (err: any) {
      alert('❌ ' + (err.message || 'Конфигурация зала не корректная'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrices = async () => {
    if (!selectedHall) return;
    setIsSaving(true);
    try {
      await api.updatePrices(selectedHall.id, standardPrice, vipPrice);
      alert('✅ Стоимость билетов успешно обновлена!');
      await refreshData();
    } catch (err: any) {
      alert('❌ ' + (err.message || 'Ошибка обновления цен'));
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== Открыть / Приостановить продажи ====================
  const handleToggleSales = async () => {
    if (!selectedOpenHallId) return;

    const currentHall = halls.find(h => h.id === selectedOpenHallId);
    if (!currentHall) return;

    const newStatus = currentHall.hall_open === 1 ? 0 : 1;

    setIsOpeningSales(true);

    try {
      await api.openSales(selectedOpenHallId, newStatus);

      alert(newStatus === 1 
        ? `✅ Продажи в зале "${currentHall.hall_name}" открыты!` 
        : `✅ Продажи в зале "${currentHall.hall_name}" приостановлены!`
      );

      await refreshData();
    } catch (err: any) {
      alert('❌ ' + (err.message || 'Ошибка изменения статуса продаж'));
    } finally {
      setIsOpeningSales(false);
    }
  };

  // ==================== Drag & Drop ====================
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, movieId: number) => {
    setDraggedMovieId(movieId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (hallId: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggedMovieId !== null) {
      setShowAddSeanceModal(true);
    }
    setDraggedMovieId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDeleteSeance = async (seanceId: number) => {
    if (!window.confirm('Удалить этот сеанс?')) return;
    setIsDeletingSeance(seanceId);
    try {
      await api.deleteSeance(seanceId);
      alert('✅ Сеанс успешно удалён');
      await refreshData();
    } catch (err: any) {
      alert('❌ ' + (err.message || 'Ошибка удаления сеанса'));
    } finally {
      setIsDeletingSeance(null);
    }
  };

  const getSeancesForHall = (hallId: number) => 
    seances.filter(s => s.seance_hallid === hallId);

  return (
    <div className="admin-halls">
      <div className="admin-header">
              ИДЁМ<span className="logo-big__v">В</span>КИНО
              <p>Администраторррская</p>
            </div>
            

      {/* 1. Управление залами */}
      <div className="admin-section">
        <div 
          className="admin-section__header" 
          onClick={() => toggleSection('halls')}
        >
          <h2>УПРАВЛЕНИЕ ЗАЛАМИ</h2>
          <span className={`arrow ${isOpen.halls ? 'open' : ''}`}>▼</span>
        </div>
        {isOpen.halls && (
          <div className="admin-section__content">
            {showCreateForm && (
              <div className="create-hall-form">
                <input
                  type="text"
                  placeholder="Название нового зала"
                  value={newHallName}
                  onChange={(e) => setNewHallName(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleCreateHall}>Создать</button>
              </div>
            )}

            <div className="halls-list">
              {halls.map((hall) => (
                <div key={hall.id} className="hall-item-wrapper">
                  <div
                    className={`hall-item ${selectedHallId === hall.id ? 'active' : ''}`}
                    onClick={() => setSelectedHallId(hall.id)}
                  >
                    {hall.hall_name}
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteHall(hall.id, hall.hall_name)}
                    disabled={isDeleting === hall.id}
                    title="Удалить зал"
                  >
                    🗑
                  </button>
                </div>
              ))}
              <button 
                className="btn-success" 
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                + Создать зал
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Конфигурация залов */}
      {selectedHall && (
        <div className="admin-section">
          <div 
            className="admin-section__header" 
            onClick={() => toggleSection('config')}
          >
            <h2>КОНФИГУРАЦИЯ ЗАЛОВ</h2>
            <span className={`arrow ${isOpen.config ? 'open' : ''}`}>▼</span>
          </div>
          {isOpen.config && (
            <div className="admin-section__content">
              <div className="config-form">
                <div className="hall-selector">
                  <label>Выберите зал для конфигурации:</label>
                  <div className="hall-buttons">
                    {halls.map(hall => (
                      <button
                        key={hall.id}
                        className={`hall-btn ${selectedHallId === hall.id ? 'active' : ''}`}
                        onClick={() => setSelectedHallId(hall.id)}
                      >
                        {hall.hall_name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="dimensions">
                  <div>
                    <label>Количество рядов</label>
                    <input
                      type="number"
                      value={rowsCount}
                      onChange={(e) => setRowsCount(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <label>Мест в ряду</label>
                    <input
                      type="number"
                      value={placesCount}
                      onChange={(e) => setPlacesCount(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="seat-grid">
                  {localConfig.map((row, rowIndex) => (
                    <div key={rowIndex} className="seat-row">
                      {row.map((seatType, seatIndex) => (
                        <button
                          key={seatIndex}
                          className={`seat ${seatType}`}
                          onClick={() => toggleSeatType(rowIndex, seatIndex)}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                <div className="legend">
                  <div className="legend-item"><span className="seat standart"></span> Обычное место</div>
                  <div className="legend-item"><span className="seat vip"></span> VIP место</div>
                  <div className="legend-item"><span className="seat disabled"></span> Заблокировано</div>
                </div>

                <div className="actions">
                  <button className="btn btn-outline-secondary">Отмена</button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveConfig}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Конфигурация цен */}
      {selectedHall && (
        <div className="admin-section">
          <div 
            className="admin-section__header" 
            onClick={() => toggleSection('prices')}
          >
            <h2>КОНФИГУРАЦИЯ ЦЕН</h2>
            <span className={`arrow ${isOpen.prices ? 'open' : ''}`}>▼</span>
          </div>
          {isOpen.prices && (
            <div className="admin-section__content">
              <div className="prices-form">
                <div className="price-group">
                  <label>Обычное место</label>
                  <div className="price-input">
                    <input
                      type="number"
                      value={standardPrice}
                      onChange={(e) => setStandardPrice(parseInt(e.target.value) || 0)}
                    />
                    <span>₽</span>
                  </div>
                </div>
                <div className="price-group">
                  <label>VIP место</label>
                  <div className="price-input">
                    <input
                      type="number"
                      value={vipPrice}
                      onChange={(e) => setVipPrice(parseInt(e.target.value) || 0)}
                    />
                    <span>₽</span>
                  </div>
                </div>
                <div className="actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleSavePrices}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Сохранение...' : 'Сохранить цены'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Сетка сеансов */}
      <div className="admin-section">
        <div 
          className="admin-section__header" 
          onClick={() => toggleSection('seances')}
        >
          <h2>СЕТКА СЕАНСОВ</h2>
          <button 
            className="btn btn-success"
            onClick={() => setShowAddMovieModal(true)}
          >
            ДОБАВИТЬ ФИЛЬМ
          </button>
          <span className={`arrow ${isOpen.seances ? 'open' : ''}`}>▼</span>
        </div>
        {isOpen.seances && (
          <div className="admin-section__content">
            <div className="seance-grid">
              {/* ... твой код сетки сеансов ... */}
              <div className="movies-row">
                {films.map((film) => (
                  <div
                    key={film.id}
                    className="movie-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, film.id)}
                  >
                    <img 
                      src={film.film_poster || "https://via.placeholder.com/80x45/1a1a1a/ffffff?text=Постер"} 
                      alt={film.film_name} 
                    />
                    <div className="movie-info">
                      <div className="movie-title">{film.film_name}</div>
                      <div className="movie-duration">{film.film_duration} минут</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="timelines">
                {halls.map((hall) => {
                  const hallSeances = getSeancesForHall(hall.id);
                  return (
                    <div 
                      key={hall.id} 
                      className="hall-timeline"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(hall.id, e)}
                    >
                      <div className="hall-title">ЗАЛ {hall.hall_name}</div>
                      <div className="timeline-track">
                        {hallSeances.map((seance) => {
                          const movie = films.find(m => m.id === seance.seance_filmid);
                          return (
                            <div key={seance.id} className="seance-block">
                              <div className="seance-content">
                                {seance.seance_time} — {movie?.film_name}
                              </div>
                              <button 
                                className="seance-delete"
                                onClick={() => handleDeleteSeance(seance.id)}
                                disabled={isDeletingSeance === seance.id}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Открыть продажи */}
      <div className="admin-section open-sales-section">
        <div 
          className="admin-section__header" 
          onClick={() => toggleSection('sales')}
        >
          <div className="header-with-icon">
            <div className="status-circle" />
            <h2>ОТКРЫТЬ ПРОДАЖИ</h2>
          </div>
          <span className={`arrow ${isOpen.sales ? 'open' : ''}`}>▼</span>
        </div>
        {isOpen.sales && (
          <div className="admin-section__content">
            <div className="open-sales-content">
              <p className="open-sales-label">Выберите зал для открытия/закрытия продаж:</p>

              <div className="hall-buttons">
                {halls.map((hall) => (
                  <button
                    key={hall.id}
                    className={`hall-btn ${selectedOpenHallId === hall.id ? 'active' : ''}`}
                    onClick={() => setSelectedOpenHallId(hall.id)}
                  >
                   {hall.hall_name}
                  </button>
                ))}
              </div>

              {selectedOpenHall && (
                <div className="sales-status">
                  <p>
                    {selectedOpenHall.hall_open === 1 
                      ? 'Продажи открыты' 
                      : 'Всё готово к открытию'}
                  </p>

                  <button
                    className={`btn btn-sales ${selectedOpenHall.hall_open === 1 ? 'btn-danger' : 'btn-success'}`}
                    onClick={handleToggleSales}
                    disabled={isOpeningSales}
                  >
                    {isOpeningSales 
                      ? 'Обработка...' 
                      : selectedOpenHall.hall_open === 1 
                        ? 'ПРИОСТАНОВИТЬ ПРОДАЖУ БИЛЕТОВ' 
                        : 'ОТКРЫТЬ ПРОДАЖУ БИЛЕТОВ'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Модальные окна */}
      <AddSeanceModal
        isOpen={showAddSeanceModal}
        onClose={() => setShowAddSeanceModal(false)}
        onSuccess={() => refreshData()}
      />

      <AddMovieModal
        isOpen={showAddMovieModal}
        onClose={() => setShowAddMovieModal(false)}
        onSuccess={() => refreshData()}
      />
    </div>
  );
};

export default AdminHalls;