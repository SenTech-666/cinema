import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/Api';
import Header from '../../../components/Header/Header';
import './Login.scss';

const Login = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState('shfe-diplom@netology.ru'); 
  const [password, setPassword] = useState('shfe-diplom');       
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.login(login, password);
      console.log('Login success:', result);
      navigate('/admin/halls', { replace: true });
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header variant="transparent" />
      <div className="login-page">
        <div className="login-card">
          <h2>АВТОРИЗАЦИЯ</h2>
          <p className="login-subtitle">Администраторская</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="shfe-diplom@netology.ru"
                required
              />
            </div>

            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Авторизация...' : 'АВТОРИЗОВАТЬСЯ'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;