import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authStore } from '../stores/auth';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';

const schema = z.object({ login: z.string().min(1), password: z.string().min(1) });

export default observer(function Login() {
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors }, setError } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (data) => {
    const ok = await authStore.login(data.login, data.password);
    if (ok) nav('/');
    else {
      const msg = authStore.error;
      if (msg === 'USER_NOT_FOUND') setError('login', { message: 'Пользователь не найден' });
      else if (msg === 'WRONG_PASSWORD') setError('password', { message: 'Неверный пароль' });
      else setError('login', { message: 'Ошибка авторизации' });
    }
  });

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 320, margin: '80px auto', display: 'grid', gap: 12 }}>
      <input className="input" placeholder="Логин" {...register('login')} />
      {errors.login && <small style={{ color: 'red' }}>{String(errors.login.message)}</small>}
      <input className="input" placeholder="Пароль" type="password" {...register('password')} />
      {errors.password && <small style={{ color: 'red' }}>{String(errors.password.message)}</small>}
      <button className="btn primary" type="submit">Войти</button>
    </form>
  );
});
