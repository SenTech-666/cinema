import { Routes, Route } from 'react-router-dom';

// Guest pages
import Home from '../pages/Guest/Home/Home';
import Hall from '../pages/Guest/Hall/Hall';
import Payment from '../pages/Guest/Payment/Payment';
import Ticket from '../pages/Guest/Ticket/Ticket';
import TicketScan from '../pages/Guest/TicketScan/TicketScan';
import Login from '../pages/Guest/Login/Login';
// Admin
import AdminLayout from '../components/Admin/Layout/AdminLayout';
import AdminHalls from '../pages/Admin/Halls/AdminHalls';  

const Router = () => {
  return (
    <Routes>
      {/* Гостевая часть */}
      <Route path="/" element={<Home />} />
      <Route path="/hall/:sessionId" element={<Hall />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/ticket" element={<Ticket />} />
      <Route path="/ticket-scan" element={<TicketScan />} />
      <Route path="/login" element={<Login />} />

      {/* Админка */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<div>Добро пожаловать в админ-панель</div>} />
        <Route path="halls" element={<AdminHalls />} />
        <Route path="movies" element={<div>Управление фильмами (в разработке)</div>} />
        <Route path="sessions" element={<div>Сетка сеансов (в разработке)</div>} />
        <Route path="prices" element={<div>Конфигурация цен (в разработке)</div>} />
      </Route>

      <Route path="*" element={<div>404 — Страница не найдена</div>} />
    </Routes>
  );
};

export default Router;