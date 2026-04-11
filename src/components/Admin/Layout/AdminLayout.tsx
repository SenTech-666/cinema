import { Outlet } from 'react-router-dom';
import './AdminLayout.scss';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;