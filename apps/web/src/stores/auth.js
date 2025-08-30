import { makeObservable, observable, action, computed, reaction, runInAction } from 'mobx';
import { api } from '../api';

class AuthStore {
  user = null;
  token = localStorage.getItem('token') || null;
  error = null;

  constructor() {
    makeObservable(this, {
      user: observable.ref,
      token: observable.ref,
      error: observable.ref,

      isAuthenticated: computed,

      setUser: action.bound,
      setToken: action.bound,
      setError: action.bound,
      login: action.bound,
      logout: action.bound,
    });

    const cached = localStorage.getItem('user');
    if (cached) {
      try { this.user = JSON.parse(cached); } catch { }
    }

    reaction(
      () => ({ token: this.token, user: this.user }),
      ({ token, user }) => {
        if (token) localStorage.setItem('token', token); else localStorage.removeItem('token');
        if (user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user');
      }
    );
  }

  get isAuthenticated() {
    return !!this.token;
  }

  setUser(u) { this.user = u; }
  setToken(t) { this.token = t; }
  setError(e) { this.error = e; }

  async login(login, password) {
    this.setError(null);
    try {
      const res = await api.post('/auth/login', { login, password });
      runInAction(() => {
        this.token = res.data.token;
        this.user = res.data.user;
      });
      return true;
    } catch (e) {
      runInAction(() => {
        this.error = e?.response?.data?.error || 'LOGIN_ERROR';
      });
      return false;
    }
  }

  logout() {
    this.setUser(null);
    this.setToken(null);
  }
}

export const authStore = new AuthStore();
