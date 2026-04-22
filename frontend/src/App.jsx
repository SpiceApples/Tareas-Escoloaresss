import React, { useEffect, useMemo, useState, createContext, useContext } from 'react';

export const LanguageContext = createContext('es');

export function useTranslation() {
  const lang = useContext(LanguageContext);
  return function t(esStr, enStr) {
    return lang === 'en' ? (enStr || esStr) : esStr;
  };
}
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '811564986134-8rgc04t2r94tcrulo4gm167cr2u32s07.apps.googleusercontent.com';
const DAY_LABELS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
const SCHOOL_DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'];
const MATERIA_COLORS = [
  '#0ea5a4',
  '#f59e0b',
  '#ef4444',
  '#3b82f6',
  '#22c55e',
  '#f97316',
  '#14b8a6',
  '#84cc16'
];
const EN_DAYS = { Lun: 'Mon', Mar: 'Tue', Mie: 'Wed', Jue: 'Thu', Vie: 'Fri', Sab: 'Sat', Dom: 'Sun' };

const getLang = () => localStorage.getItem('te_lang') || 'es';

const formatMonth = (value, customLang) => {
  if (!value) return '';
  const lang = customLang || (typeof localStorage !== 'undefined' ? localStorage.getItem('te_lang') : 'es');
  const date = new Date(value);
  const month = date.getMonth();
  const year = date.getFullYear();
  const es = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const en = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return lang === 'en' ? `${en[month]} ${year}` : `${es[month]} de ${year}`;
};

const normalizeDate = (value) => {
  if (!value) return null;
  const raw = value.includes('T') ? value : `${value}T00:00:00`;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const formatDate = (value, customLang) => {
  const parsed = normalizeDate(value);
  const lang = customLang || getLang();
  if (!parsed) return lang === 'en' ? 'No date' : 'Sin fecha';
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(parsed);
};

const formatTime = (value) => {
  if (!value) return '';
  const [hour, minute] = value.split(':');
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
};

const toMinutes = (value) => {
  if (!value) return 0;
  const [hour, minute] = value.split(':');
  return Number(hour) * 60 + Number(minute || 0);
};

const startOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const getMateriaColor = (idMateria, customColor) => {
  if (customColor) return customColor;
  const index = Math.abs(Number(idMateria || 0)) % MATERIA_COLORS.length;
  return MATERIA_COLORS[index];
};

const buildError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const request = async (path, { method = 'GET', body, token } = {}) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = { error: text };
    }
  }

  if (response.status === 401 || response.status === 403) {
    const lang = localStorage.getItem('te_lang') || 'es';
    throw buildError(data?.error || (lang === 'en' ? 'Session expired, please log in again.' : 'Sesión expirada, vuelve a iniciar sesión.'), 'AUTH');
  }

  if (!response.ok) {
    const lang = localStorage.getItem('te_lang') || 'es';
    throw buildError(data?.error || (lang === 'en' ? 'Unexpected error in request.' : 'Error inesperado en la solicitud.'), 'REQUEST');
  }

  return data;
};

const emptyNotice = { type: '', message: '' };

const NAV_ITEMS = [
  { id: 'dashboard', labelEs: 'Resumen', labelEn: 'Overview', icon: '📊' },
  { id: 'periodos', labelEs: 'Periodos', labelEn: 'Terms', icon: '🗓️' },
  { id: 'materias', labelEs: 'Materias', labelEn: 'Subjects', icon: '📚' },
  { id: 'tareas', labelEs: 'Tareas', labelEn: 'Tasks', icon: '📝' },
  { id: 'horarios', labelEs: 'Calendario', labelEn: 'Calendar', icon: '⏰' }
];

const buildTaskStatus = (task) => {
  const due = normalizeDate(task.fecha_entrega);
  const today = startOfToday();
  if (task.completada) {
    return { label: 'Completada', tone: 'success' };
  }
  if (due && due < today) {
    return { label: 'Vencida', tone: 'danger' };
  }
  return { label: 'Pendiente', tone: 'warning' };
};

const sortByFechaEntrega = (a, b) => {
  const dateA = normalizeDate(a.fecha_entrega);
  const dateB = normalizeDate(b.fecha_entrega);
  if (!dateA || !dateB) return 0;
  return dateA - dateB;
};

const sortByHora = (a, b) => toMinutes(a.hora_inicio) - toMinutes(b.hora_inicio);

const initTaskForm = {
  titulo: '',
  descripcion: '',
  fecha_entrega: '',
  hora_entrega: '',
  id_materia: '',
  color: ''
};

const initPeriodoForm = {
  nombre: '',
  fecha_inicio: '',
  fecha_fin: '',
  color: ''
};

const initMateriaForm = {
  nombre: '',
  profesor: '',
  id_periodo: '',
  color: ''
};

const initHorarioForm = {
  dia_semana: 'Lun',
  hora_inicio: '07:00',
  hora_fin: '08:30',
  id_materia: '',
  color: ''
};

const isSameDay = (date, other) =>
  date.getFullYear() === other.getFullYear() &&
  date.getMonth() === other.getMonth() &&
  date.getDate() === other.getDate();

function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9333ea" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="128" fill="url(#logoGradient)" />
      <path
        d="M150 260L220 330L362 188"
        stroke="white"
        strokeWidth="60"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('te_token') || '');
  
  useEffect(() => {
    console.log('--- Configuración de Tareas Escolares ---');
    console.log('API Base URL:', API_BASE);
    console.log('Google Client:', GOOGLE_CLIENT_ID);
    console.log('-----------------------------------------');
  }, []);

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('te_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [resetToken, setResetToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || '';
  });
  const [view, setView] = useState('dashboard');
  const [periodos, setPeriodos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [activePeriodoId, setActivePeriodoId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [notice, setNotice] = useState(emptyNotice);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('te_theme') || 'dark');
  const [language, setLanguage] = useState(() => localStorage.getItem('te_lang') || 'es');
  const [installPrompt, setInstallPrompt] = useState(null);

  const t = (esStr, enStr) => (language === 'en' ? (enStr || esStr) : esStr);

  useEffect(() => {
    localStorage.setItem('te_lang', language);
    document.documentElement.lang = language;
    document.title = t('Tareas Escolares', 'School Tasks');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', t('Organizador de tareas, materias y horarios para estudiantes.', 'Student task manager, subjects and schedules.'));
    }
  }, [language]);

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } else {
      const msg = t(
        'Para instalar:\n\nEn Android/Chrome: Toca los tres puntos (⋮) y selecciona "Instalar aplicación".\n\nEn iOS/Safari: Toca el botón compartir (📤) y selecciona "Agregar a la pantalla de inicio".',
        'To install:\n\nOn Android/Chrome: Tap the three dots (⋮) and select "Install app".\n\nOn iOS/Safari: Tap the share button (📤) and select "Add to home screen".'
      );
      alert(msg);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('te_theme', theme);
  }, [theme]);

  const materiasById = useMemo(
    () => new Map(materias.map((materia) => [materia.id_materia, materia])),
    [materias]
  );

  const filteredMaterias = useMemo(() => {
    if (!activePeriodoId) return materias;
    return materias.filter((materia) => materia.id_periodo === activePeriodoId);
  }, [materias, activePeriodoId]);

  const filteredTareas = useMemo(() => {
    if (!activePeriodoId) return tareas;
    return tareas.filter((tarea) => {
      const materia = materiasById.get(tarea.id_materia);
      return materia?.id_periodo === activePeriodoId;
    });
  }, [tareas, activePeriodoId, materiasById]);

  const filteredHorarios = useMemo(() => {
    if (!activePeriodoId) return horarios;
    return horarios.filter((horario) => {
      const materia = materiasById.get(horario.id_materia);
      return materia?.id_periodo === activePeriodoId;
    });
  }, [horarios, activePeriodoId, materiasById]);

  const handleLogout = (message) => {
    localStorage.removeItem('te_token');
    localStorage.removeItem('te_user');
    setToken('');
    setUser(null);
    setPeriodos([]);
    setMaterias([]);
    setTareas([]);
    setHorarios([]);
    setActivePeriodoId(null);
    setSelectedTask(null);
    if (message) {
      setNotice({ type: 'warning', message });
    }
  };

  const showNotice = (type, message) => {
    setNotice({ type, message });
  };

  const loadAll = async (mode = 'sync') => {
    if (!token) return;
    if (mode === 'initial') {
      setIsLoading(true);
    } else {
      setIsSyncing(true);
    }

    try {
      const [periodosData, materiasData, tareasData, horariosData] = await Promise.all([
        request('/api/periodos/', { token }),
        request('/api/materias/', { token }),
        request('/api/tareas/', { token }),
        request('/api/horarios/', { token })
      ]);

      setPeriodos(periodosData || []);
      setMaterias(materiasData || []);
      setTareas(tareasData || []);
      setHorarios((horariosData || []).sort(sortByHora));

      setActivePeriodoId((current) => {
        if (current && periodosData?.some((periodo) => periodo.id_periodo === current)) {
          return current;
        }
        return periodosData?.[0]?.id_periodo || null;
      });
    } catch (error) {
      if (error.code === 'AUTH') {
        handleLogout(error.message);
      } else {
        showNotice('danger', error.message);
      }
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAll('initial');
    }
  }, [token]);

  const handleLogin = async ({ correo, password }) => {
    setIsLoading(true);
    setNotice(emptyNotice);
    try {
      const data = await request('/api/auth/login', {
        method: 'POST',
        body: { correo, password }
      });
      setToken(data.token);
      setUser(data.usuario);
      localStorage.setItem('te_token', data.token);
      localStorage.setItem('te_user', JSON.stringify(data.usuario));
      showNotice('success', t('Bienvenido, sesión iniciada.', 'Welcome, logged in.'));
    } catch (error) {
      showNotice('danger', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async ({ nombre, correo, password }) => {
    setIsLoading(true);
    setNotice(emptyNotice);
    try {
      await request('/api/auth/register', {
        method: 'POST',
        body: { nombre, correo, password }
      });
      const data = await request('/api/auth/login', {
        method: 'POST',
        body: { correo, password }
      });
      setToken(data.token);
      setUser(data.usuario);
      localStorage.setItem('te_token', data.token);
      localStorage.setItem('te_user', JSON.stringify(data.usuario));
      showNotice('success', t('Cuenta creada e iniciada.', 'Account created and logged in.'));
    } catch (error) {
      showNotice('danger', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (idToken) => {
    setIsLoading(true);
    setNotice(emptyNotice);
    try {
      const data = await request('/api/auth/google-login', {
        method: 'POST',
        body: { idToken }
      });
      setToken(data.token);
      setUser(data.usuario);
      localStorage.setItem('te_token', data.token);
      localStorage.setItem('te_user', JSON.stringify(data.usuario));
      showNotice('success', t('Bienvenido con Google.', 'Welcome with Google.'));
    } catch (error) {
      showNotice('danger', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = () => {
    const mockUser = {
      id: 999,
      nombre: 'Test Alumno',
      correo: 'test@example.com'
    };
    const mockToken = 'mock-jwt-token-for-testing';
    setToken(mockToken);
    setUser(mockUser);
    localStorage.setItem('te_token', mockToken);
    localStorage.setItem('te_user', JSON.stringify(mockUser));
    showNotice('success', t('Modo de prueba activado.', 'Test mode activated.'));
  };

  const handleForgotPassword = async (correo) => {
    setIsLoading(true);
    try {
      const data = await request('/api/auth/forgot-password', {
        method: 'POST',
        body: { correo }
      });
      showNotice('success', data.message);
    } catch (error) {
      showNotice('danger', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (tokenParam, newPassword) => {
    setIsLoading(true);
    try {
      const data = await request('/api/auth/reset-password', {
        method: 'POST',
        body: { token: tokenParam, newPassword }
      });
      showNotice('success', data.message);
      setResetToken(''); // Limpiar token para volver al login
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      showNotice('danger', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePeriodo = async (payload) => {
    try {
      await request('/api/periodos/', { method: 'POST', body: payload, token });
      showNotice('success', t('Periodo guardado.', 'Term saved.'));
      await loadAll();
    } catch (error) {
      showNotice('danger', error.message);
    }
  };

  const handleUpdatePeriodo = async (id, payload) => {
    try {
      await request(`/api/periodos/${id}`, { method: 'PUT', body: payload, token });
      showNotice('success', t('Periodo actualizado.', 'Term updated.'));
      await loadAll();
    } catch (error) {
      showNotice('danger', error.message);
    }
  };

  const handleDeletePeriodo = async (id) => {
    try {
      await request(`/api/periodos/${id}`, { method: 'DELETE', token });
      showNotice('success', t('Periodo eliminado.', 'Term deleted.'));
      await loadAll();
    } catch (error) {
      showNotice('danger', error.message);
    }
  };

  const handleCreateMateria = async (payload) => {
    try {
      await request('/api/materias/', { method: 'POST', body: payload, token });
      showNotice('success', t('Materia guardada.', 'Subject saved.'));
      await loadAll();
    } catch (error) {
      showNotice('danger', error.message);
    }
  };

  const handleUpdateMateria = async (id, payload) => {
    try {
      await request(`/api/materias/${id}`, { method: 'PUT', body: payload, token });
      showNotice('success', t('Materia personalizada.', 'Subject updated.'));
      await loadAll();
    } catch (error) {
      showNotice('danger', error.message);
    }
  };

  const handleDeleteMateria = async (id) => {
    try {
      await request(`/api/materias/${id}`, { method: 'DELETE', token });
      showNotice('success', t('Materia eliminada.', 'Subject deleted.'));
      await loadAll();
    } catch (error) {
      showNotice('danger', error.message);
    }
  };

  const handleCreateTarea = async (payload) => {
    try {
      await request('/api/tareas/', { method: 'POST', body: payload, token });
      showNotice('success', t('Tarea creada.', 'Task created.'));
      await loadAll();
    } catch (error) {
      showNotice('danger', error.message);
    }
  };

  const handleUpdateTarea = async (id, payload) => {
    try {
      await request(`/api/tareas/${id}`, { method: 'PUT', body: payload, token });
      showNotice('success', t('Tarea actualizada.', 'Task updated.'));
      await loadAll();
    } catch (error) {
      showNotice('danger', error.message);
    }
  };

  const handleDeleteTarea = async (id) => {
    try {
      await request(`/api/tareas/${id}`, { method: 'DELETE', token });
      showNotice('success', t('Tarea eliminada.', 'Task deleted.'));
      await loadAll();
    } catch (error) {
      showNotice('danger', error.message);
    }
  };

  const handleCompleteTarea = async (id) => {
    try {
      await request(`/api/tareas/${id}/completar`, { method: 'PATCH', token });
      showNotice('success', t('Tarea completada.', 'Task completed.'));
      await loadAll();
    } catch (error) {
      showNotice('danger', error.message);
    }
  };

  const handleCreateHorario = async (payload) => {
    try {
      await request('/api/horarios/', { method: 'POST', body: payload, token });
      showNotice('success', t('Horario guardado.', 'Schedule saved.'));
      await loadAll();
    } catch (error) {
      showNotice('danger', error.message);
    }
  };

  const handleUpdateHorario = async (id, payload) => {
    try {
      await request(`/api/horarios/${id}`, { method: 'PUT', body: payload, token });
      showNotice('success', t('Horario actualizado.', 'Schedule updated.'));
      await loadAll();
    } catch (error) {
      showNotice('danger', error.message);
    }
  };

  const handleDeleteHorario = async (id) => {
    try {
      await request(`/api/horarios/${id}`, { method: 'DELETE', token });
      showNotice('success', t('Horario eliminado.', 'Schedule deleted.'));
      await loadAll();
    } catch (error) {
      showNotice('danger', error.message);
    }
  };

  const tareasStats = useMemo(() => {
    const today = startOfToday();
    let pendientes = 0;
    let vencidas = 0;
    let completadas = 0;

    filteredTareas.forEach((tarea) => {
      const due = normalizeDate(tarea.fecha_entrega);
      if (tarea.completada) {
        completadas += 1;
      } else if (due && due < today) {
        vencidas += 1;
      } else {
        pendientes += 1;
      }
    });

    return { pendientes, vencidas, completadas };
  }, [filteredTareas]);

  if (!token) {
    return (
      <LanguageContext.Provider value={language}>
        <div className="app auth">
          <AuthPanel
            onLogin={handleLogin}
            onRegister={handleRegister}
            onGoogleLogin={handleGoogleLogin}
            onTestLogin={handleTestLogin}
            onForgotPassword={handleForgotPassword}
            onResetPassword={handleResetPassword}
            resetToken={resetToken}
            setResetToken={setResetToken}
            loading={isLoading}
            notice={notice}
            theme={theme}
            setTheme={setTheme}
          />
        </div>
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={language}>
    <div className="app">
      <div className="shell">
        <aside className="sidebar">
          <div className="brand">
            <Logo size={42} />
            <div className="brand-text">
              <span className="brand-kicker">{t('Tareas', 'School')}</span>
              <h1>{t('Escolares', 'Tasks')}</h1>
            </div>
          </div>
          <div className="user-card">
            <p className="user-name">{user?.nombre || t('Alumno', 'Student')}</p>
            <span className="user-email">{user?.correo}</span>
          </div>
          <nav className="nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-button ${view === item.id ? 'active' : ''}`}
                onClick={() => setView(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{t(item.labelEs, item.labelEn)}</span>
              </button>
            ))}
          </nav>
          <button type="button" className="nav-button ghost" onClick={() => handleLogout(t('Sesión cerrada.', 'Logged out.'))}
          >
            {t('Cerrar sesión', 'Log out')}
          </button>
          
          {!window.matchMedia('(display-mode: standalone)').matches && (
            <button
              type="button"
              className={`button-install ${!installPrompt ? 'info' : ''}`}
              onClick={handleInstall}
            >
              <span className="nav-icon">{installPrompt ? '📲' : 'ℹ️'}</span>
              <span className="nav-label">
                {installPrompt ? t('Instalar App', '[Fixed] Install App') : t('¿Cómo instalar?', '[Fixed] How to install?')}
              </span>
            </button>
          )}

          <button
            type="button"
            className="button-install info"
            style={{ marginTop: '8px' }}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert(t('¡Enlace copiado al portapapeles!', 'Link copied to clipboard!'));
            }}
          >
            <span className="nav-icon">🔗</span>
            <span className="nav-label">{t('Compartir link', '[Fixed] Share link')}</span>
          </button>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="mobile-brand">
              <Logo size={32} />
              <div className="brand-text">
                <span className="brand-kicker">{t('Tareas', 'School')}</span>
                <h1>{t('Escolares', 'Tasks')}</h1>
              </div>
            </div>
            <div>
              <p className="eyebrow">{t('Panel de seguimiento', 'Tracking panel')}</p>
              <h2>{t('Hola', 'Hello')} {user?.nombre?.split(' ')[0] || t('de nuevo', 'again')}</h2>
            </div>
            <div className="period-selector">
              <button
                type="button"
                className="theme-toggle"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={theme === 'dark' 
                  ? t('Cambiar a modo claro', 'Switch to light mode') 
                  : t('Cambiar a modo oscuro', 'Switch to dark mode')}
                aria-label={t('Cambiar tema', 'Toggle theme')}
              >
                <div className="theme-toggle-track">
                  <div className="theme-toggle-thumb">
                    {theme === 'dark' ? '🌙' : '☀️'}
                  </div>
                </div>
              </button>
              <button
                type="button"
                className="theme-toggle"
                onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
                style={{ marginLeft: '8px', background: 'transparent', border: '1px solid var(--stroke)', borderRadius: '12px', color: 'var(--ink)' }}
              >
                {language === 'es' ? 'EN' : 'ES'}
              </button>
              <label>
                {t('Periodo actual', 'Current section')}
                <select
                  value={activePeriodoId || ''}
                  onChange={(event) => setActivePeriodoId(event.target.value ? Number(event.target.value) : null)}
                >
                  <option value="">{t('Todos los periodos', 'All terms')}</option>
                  {periodos.map((periodo) => (
                    <option key={periodo.id_periodo} value={periodo.id_periodo}>
                      {periodo.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <span className="sync-pill">{isSyncing ? t('Sincronizando…', 'Syncing...') : t('En línea', 'Online')}</span>
            </div>
          </header>

          {notice.message ? (
            <div className={`notice ${notice.type}`}>
              {notice.message}
            </div>
          ) : null}

          {isLoading ? (
            <div className="loading">{t('Cargando información…', 'Loading information...')}</div>
          ) : (
            <div className="content">
              {view === 'dashboard' && (
                <Dashboard
                  tareas={filteredTareas}
                  materias={filteredMaterias}
                  horarios={filteredHorarios}
                  tareasStats={tareasStats}
                  onSelectTask={setSelectedTask}
                  selectedTask={selectedTask}
                  onCompleteTask={handleCompleteTarea}
                />
              )}
              {view === 'periodos' && (
                <PeriodosPanel
                  periodos={periodos}
                  onCreate={handleCreatePeriodo}
                  onUpdate={handleUpdatePeriodo}
                  onDelete={handleDeletePeriodo}
                />
              )}
              {view === 'materias' && (
                <MateriasPanel
                  materias={filteredMaterias}
                  periodos={periodos}
                  activePeriodoId={activePeriodoId}
                  onCreate={handleCreateMateria}
                  onUpdate={handleUpdateMateria}
                  onDelete={handleDeleteMateria}
                />
              )}
              {view === 'tareas' && (
                <TareasPanel
                  tareas={filteredTareas}
                  materias={filteredMaterias}
                  onCreate={handleCreateTarea}
                  onUpdate={handleUpdateTarea}
                  onDelete={handleDeleteTarea}
                  onComplete={handleCompleteTarea}
                  onSelectTask={setSelectedTask}
                />
              )}
              {view === 'horarios' && (
                <HorariosPanel
                  horarios={filteredHorarios}
                  materias={filteredMaterias}
                  onCreate={handleCreateHorario}
                  onUpdate={handleUpdateHorario}
                  onDelete={handleDeleteHorario}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
    </LanguageContext.Provider>
  );
}

function AuthPanel({
  onLogin, onRegister, onGoogleLogin, onTestLogin, onForgotPassword, onResetPassword,
  resetToken, setResetToken, loading, notice, theme, setTheme
}) {
  const t = useTranslation();
  const [mode, setMode] = useState(resetToken ? 'reset' : 'login');
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', confirmPassword: '' });

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          onGoogleLogin(response.credential);
        }
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: theme === 'dark' ? 'filled_blue' : 'outline', size: 'large', width: '100%' }
      );
    }
  }, [mode, theme]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (mode === 'login') {
      onLogin({ correo: form.correo, password: form.password });
    } else if (mode === 'register') {
      onRegister(form);
    } else if (mode === 'forgot') {
      onForgotPassword(form.correo);
    } else if (mode === 'reset') {
      if (form.password !== form.confirmPassword) {
        alert(t('Las contraseñas no coinciden.', "Passwords don't match."));
        return;
      }
      onResetPassword(resetToken, form.password);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-theme-switcher">
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' 
            ? t('Cambiar a modo claro', 'Switch to light mode') 
            : t('Cambiar a modo oscuro', 'Switch to dark mode')}
          aria-label={t('Cambiar tema', 'Toggle theme')}
        >
          <div className="theme-toggle-track">
            <div className="theme-toggle-thumb">
              {theme === 'dark' ? '🌙' : '☀️'}
            </div>
          </div>
        </button>
      </div>
      <div className="auth-card-evernote">
        <div className="auth-header">
          <div className="auth-logo">
            <Logo size={64} />
          </div>
          <h1>
            {mode === 'login' && t('Tareas Escolares', 'School Tasks')}
            {mode === 'register' && t('Crear Cuenta', 'Create Account')}
            {mode === 'forgot' && t('Recuperar Cuenta', 'Recover Account')}
            {mode === 'reset' && t('Nueva Contraseña', 'New Password')}
          </h1>
          <p className="auth-subtitle">
            {mode === 'forgot' ? t('Te enviaremos un enlace a tu correo.', 'We will send a link to your email.') : t('Organiza todo lo importante.', 'Organize everything important.')}
          </p>
        </div>

        {(mode === 'login' || mode === 'register') && (
          <>
            <div className="auth-social">
              <div id="google-btn"></div>
            </div>
            <div className="auth-divider">
              <span>{t('o', 'or')}</span>
            </div>
          </>
        )}

        {notice?.message ? (
          <div className={`notice ${notice.type}`}>
            {notice.message}
          </div>
        ) : null}

        <form className="auth-form-evernote" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <input
              type="text"
              placeholder={t('Nombre completo', 'Full name')}
              value={form.nombre}
              onChange={(event) => setForm({ ...form, nombre: event.target.value })}
              required
            />
          )}

          {(mode !== 'reset') && (
            <input
              type="email"
              placeholder={t('Correo electrónico', 'Email address')}
              value={form.correo}
              onChange={(event) => setForm({ ...form, correo: event.target.value })}
              required
            />
          )}

          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <input
              type="password"
              placeholder={mode === 'reset' ? t('Nueva contraseña', 'New password') : t('Contraseña', 'Password')}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          )}

          {mode === 'reset' && (
            <input
              type="password"
              placeholder={t('Confirmar contraseña', 'Confirm password')}
              value={form.confirmPassword}
              onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
              required
            />
          )}

          <button type="submit" className="button-evernote-primary" disabled={loading}>
            {loading ? t('Procesando…', 'Processing...') :
              mode === 'login' ? t('Iniciar sesión', 'Log in') :
              mode === 'register' ? t('Crear cuenta', 'Sign up') :
              mode === 'forgot' ? t('Enviar enlace', 'Send link') : t('Actualizar contraseña', 'Update password')}
          </button>

          {mode === 'login' && (
            <button 
              type="button" 
              className="button-evernote-ghost" 
              style={{ marginTop: '12px', border: '1px dashed var(--ink-light)', opacity: 0.8 }}
              onClick={onTestLogin}
            >
              {t('🚀 Probar sin cuenta (Invitado)', '🚀 Test without account (Guest)')}
            </button>
          )}
        </form>

        <div className="auth-footer">
          {mode === 'login' && (
            <>
              <a href="#" onClick={(e) => { e.preventDefault(); setMode('forgot'); }}>{t('¿Olvidaste tu contraseña?', 'Forgot your password?')}</a>
              <p>{t('¿No tienes una cuenta?', "Don't have an account?")}</p>
              <button type="button" className="link-button" onClick={() => setMode('register')}>
                {t('Crear cuenta', 'Sign up')}
              </button>
            </>
          )}
          {(mode === 'register' || mode === 'forgot' || mode === 'reset') && (
            <>
              <p>{mode === 'register' ? t('¿Ya tienes una cuenta?', 'Already have an account?') : t('¿Recordaste tu contraseña?', 'Remembered your password?')}</p>
              <button type="button" className="link-button" onClick={() => {
                setMode('login');
                setResetToken('');
                window.history.replaceState({}, document.title, window.location.pathname);
              }}>
                {t('Iniciar sesión', 'Log in')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ tareas, materias, horarios, tareasStats, onSelectTask, selectedTask, onCompleteTask }) {
  const t = useTranslation();
  const lang = useContext(LanguageContext);
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  const upcomingTasks = useMemo(() => {
    const today = startOfToday();
    return tareas
      .filter((tarea) => normalizeDate(tarea.fecha_entrega))
      .sort(sortByFechaEntrega)
      .filter((tarea) => normalizeDate(tarea.fecha_entrega) >= today)
      .slice(0, 5);
  }, [tareas]);

  return (
    <div className="panel">
      <div className="summary-grid">
        <SummaryCard title={t("Pendientes", "Pending")} value={tareasStats.pendientes} tone="warning" />
        <SummaryCard title={t("Completadas", "Completed")} value={tareasStats.completadas} tone="success" />
        <SummaryCard title={t("Vencidas", "Overdue")} value={tareasStats.vencidas} tone="danger" />
        <SummaryCard title={t("Materias", "Subjects")} value={materias.length} />
        <SummaryCard title={t("Calendario", "Calendar")} value={horarios.length} />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h3>{t('Calendario', 'Calendar')}</h3>
              <p className="muted">{t('Tareas pendientes y completadas del mes.', 'Pending and completed tasks for the month.')}</p>
            </div>
            <div className="calendar-nav">
              <button type="button" className="button ghost" onClick={() => {
                const copy = new Date(calendarDate);
                copy.setMonth(copy.getMonth() - 1);
                setCalendarDate(copy);
              }}>
                {t('Anterior', 'Prev')}
              </button>
              <span>{formatMonth(calendarDate, lang)}</span>
              <button type="button" className="button ghost" onClick={() => {
                const copy = new Date(calendarDate);
                copy.setMonth(copy.getMonth() + 1);
                setCalendarDate(copy);
              }}>
                {t('Siguiente', 'Next')}
              </button>
            </div>
          </div>
          <Calendar
            date={calendarDate}
            tasks={tareas}
            onSelectTask={onSelectTask}
          />
        </div>

        <div className="side-column">
          <div className="card">
            <h3>{t('Próximas entregas', 'Upcoming deadlines')}</h3>
            <div className="list">
              {upcomingTasks.length === 0 ? (
                <EmptyState message={t("No hay tareas próximas.", "No upcoming tasks.")} />
              ) : (
                upcomingTasks.map((tarea) => {
                  const status = buildTaskStatus(tarea);
                  return (
                    <button
                      key={tarea.id_tarea}
                      type="button"
                      className="list-item"
                      style={{ borderLeft: `4px solid ${tarea.color || getMateriaColor(tarea.id_materia, tarea.materia_color)}` }}
                      onClick={() => onSelectTask(tarea)}
                    >
                      <div>
                        <p className="strong">{tarea.titulo}</p>
                        <p className="muted">{formatDate(tarea.fecha_entrega, lang)}</p>
                      </div>
                      <span className={`chip ${status.tone}`}>{t(status.label, status.label === 'Completada' ? 'Completed' : status.label === 'Pendiente' ? 'Pending' : 'Overdue')}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="card">
            <h3>{t('Detalle de tarea', 'Task detail')}</h3>
            {selectedTask ? (
              <TaskDetail task={selectedTask} onCompleteTask={onCompleteTask} />
            ) : (
              <EmptyState message={t("Selecciona una tarea del calendario o la lista.", "Select a task from the calendar or list.")} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PeriodosPanel({ periodos, onCreate, onUpdate, onDelete }) {
  const t = useTranslation();
  const lang = useContext(LanguageContext);
  const [form, setForm] = useState(initPeriodoForm);
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editingId) {
      onUpdate(editingId, form);
    } else {
      onCreate(form);
    }
    setForm(initPeriodoForm);
    setEditingId(null);
  };

  return (
    <div className="panel">
      <div className="card">
        <h3>{editingId ? t('Editar periodo', 'Edit term') : t('Nuevo periodo', 'New term')}</h3>
        <form className="form inline" onSubmit={handleSubmit}>
          <label>
            {t('Nombre', 'Name')}
            <input
              type="text"
              value={form.nombre}
              onChange={(event) => setForm({ ...form, nombre: event.target.value })}
              required
            />
          </label>
          <label>
            {t('Fecha inicio', 'Start date')}
            <input
              type="date"
              value={form.fecha_inicio}
              onChange={(event) => setForm({ ...form, fecha_inicio: event.target.value })}
              required
            />
          </label>
          <label>
            {t('Fecha fin', 'End date')}
            <input
              type="date"
              value={form.fecha_fin}
              onChange={(event) => setForm({ ...form, fecha_fin: event.target.value })}
              required
            />
          </label>
          <label>
            {t('Color', 'Color')}
            <input
              type="color"
              value={form.color || '#7c3aed'}
              onChange={(event) => setForm({ ...form, color: event.target.value })}
            />
          </label>
          <div className="actions">
            <button type="submit" className="button primary">
              {editingId ? t('Guardar cambios', 'Save changes') : t('Crear periodo', 'Create term')}
            </button>
            {editingId ? (
              <button type="button" className="button ghost" onClick={() => {
                setEditingId(null);
                setForm(initPeriodoForm);
              }}>
                {t('Cancelar', 'Cancel')}
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="card">
        <h3>{t('Mis periodos', 'My terms')}</h3>
        <div className="table">
          {periodos.length === 0 ? (
            <EmptyState message={t("Aún no tienes periodos registrados.", "You don't have any terms registered yet.")} />
          ) : (
            periodos.map((periodo) => (
              <div
                key={periodo.id_periodo}
                className="table-row"
                style={{ borderLeft: `4px solid ${periodo.color || '#7c3aed'}` }}
              >
                <div>
                  <p className="strong">{periodo.nombre}</p>
                  <p className="muted">
                    {formatDate(periodo.fecha_inicio, lang)} - {formatDate(periodo.fecha_fin, lang)}
                  </p>
                </div>
                <div className="row-actions">
                  <button type="button" className="button ghost" onClick={() => {
                    setEditingId(periodo.id_periodo);
                    setForm({
                      nombre: periodo.nombre,
                      fecha_inicio: periodo.fecha_inicio,
                      fecha_fin: periodo.fecha_fin,
                      color: periodo.color || ''
                    });
                  }}>
                    {t('Editar', 'Edit')}
                  </button>
                  <button type="button" className="button ghost danger" onClick={() => onDelete(periodo.id_periodo)}>
                    {t('Eliminar', 'Delete')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function MateriasPanel({ materias, periodos, activePeriodoId, onCreate, onUpdate, onDelete }) {
  const t = useTranslation();
  const [form, setForm] = useState({ ...initMateriaForm, id_periodo: activePeriodoId || '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!editingId) {
      setForm((current) => ({ ...current, id_periodo: activePeriodoId || '' }));
    }
  }, [activePeriodoId, editingId]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = { ...form, id_periodo: Number(form.id_periodo) };
    if (editingId) {
      onUpdate(editingId, payload);
    } else {
      onCreate(payload);
    }
    setForm({ ...initMateriaForm, id_periodo: activePeriodoId || '' });
    setEditingId(null);
  };

  return (
    <div className="panel">
      <div className="card">
        <h3>{editingId ? t('Editar materia', 'Edit subject') : t('Nueva materia', 'New subject')}</h3>
        <form className="form inline" onSubmit={handleSubmit}>
          <label>
            {t('Nombre', 'Name')}
            <input
              type="text"
              value={form.nombre}
              onChange={(event) => setForm({ ...form, nombre: event.target.value })}
              required
            />
          </label>
          <label>
            {t('Profesor', 'Teacher')}
            <input
              type="text"
              value={form.profesor}
              onChange={(event) => setForm({ ...form, profesor: event.target.value })}
              placeholder={t("Opcional", "Optional")}
            />
          </label>
          <label>
            {t('Periodo', 'Term')}
            <select
              value={form.id_periodo}
              onChange={(event) => setForm({ ...form, id_periodo: event.target.value })}
              required
            >
              <option value="">{t('Selecciona un periodo', 'Select a term')}</option>
              {periodos.map((periodo) => (
                <option key={periodo.id_periodo} value={periodo.id_periodo}>
                  {periodo.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('Color', 'Color')}
            <input
              type="color"
              value={form.color || '#7c3aed'}
              onChange={(event) => setForm({ ...form, color: event.target.value })}
            />
          </label>
          <div className="actions">
            <button type="submit" className="button primary">
              {editingId ? t('Guardar cambios', 'Save changes') : t('Crear materia', 'Create subject')}
            </button>
            {editingId ? (
              <button type="button" className="button ghost" onClick={() => {
                setEditingId(null);
                setForm({ ...initMateriaForm, id_periodo: activePeriodoId || '' });
              }}>
                {t('Cancelar', 'Cancel')}
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="card">
        <h3>{t('Materias del periodo', 'Subjects for the term')}</h3>
        <div className="table">
          {materias.length === 0 ? (
            <EmptyState message={t("Aún no hay materias en este periodo.", "No subjects in this term yet.")} />
          ) : (
            materias.map((materia) => (
              <div
                key={materia.id_materia}
                className="table-row"
                style={{ borderLeft: `4px solid ${materia.color || getMateriaColor(materia.id_materia)}` }}
              >
                <div>
                  <p className="strong">{materia.nombre}</p>
                  <p className="muted">{materia.profesor || t('Sin profesor asignado', 'No teacher assigned')}</p>
                </div>
                <div className="row-actions">
                  <button type="button" className="button ghost" onClick={() => {
                    setEditingId(materia.id_materia);
                    setForm({
                      nombre: materia.nombre,
                      profesor: materia.profesor || '',
                      id_periodo: materia.id_periodo,
                      color: materia.color || ''
                    });
                  }}>
                    {t('Editar', 'Edit')}
                  </button>
                  <button type="button" className="button ghost danger" onClick={() => onDelete(materia.id_materia)}>
                    {t('Eliminar', 'Delete')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TareasPanel({ tareas, materias, onCreate, onUpdate, onDelete, onComplete, onSelectTask }) {
  const t = useTranslation();
  const lang = useContext(LanguageContext);
  const [form, setForm] = useState(initTaskForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('todas');

  useEffect(() => {
    if (!editingId && materias.length > 0 && !form.id_materia) {
      setForm((current) => ({ ...current, id_materia: materias[0]?.id_materia || '' }));
    }
  }, [materias, editingId]);

  const filtered = useMemo(() => {
    const today = startOfToday();
    return tareas.filter((tarea) => {
      if (filter === 'completadas') return tarea.completada;
      if (filter === 'pendientes') {
        const due = normalizeDate(tarea.fecha_entrega);
        return !tarea.completada && (!due || due >= today);
      }
      if (filter === 'vencidas') {
        const due = normalizeDate(tarea.fecha_entrega);
        return !tarea.completada && due && due < today;
      }
      return true;
    });
  }, [tareas, filter]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = { ...form, id_materia: Number(form.id_materia) };
    if (editingId) {
      onUpdate(editingId, payload);
    } else {
      onCreate(payload);
    }
    setForm(initTaskForm);
    setEditingId(null);
  };

  return (
    <div className="panel">
      <div className="card">
        <h3>{editingId ? t('Editar tarea', 'Edit task') : t('Nueva tarea', 'New task')}</h3>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              {t('Título', 'Title')}
              <input
                type="text"
                value={form.titulo}
                onChange={(event) => setForm({ ...form, titulo: event.target.value })}
                required
              />
            </label>
            <label>
              {t('Materia', 'Subject')}
              <select
                value={form.id_materia}
                onChange={(event) => setForm({ ...form, id_materia: event.target.value })}
                required
              >
                <option value="">{t('Selecciona una materia', 'Select a subject')}</option>
                {materias.map((materia) => (
                  <option key={materia.id_materia} value={materia.id_materia}>
                    {materia.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('Fecha de entrega', 'Due date')}
              <input
                type="date"
                value={form.fecha_entrega}
                onChange={(event) => setForm({ ...form, fecha_entrega: event.target.value })}
                required
              />
            </label>
            <label>
              {t('Hora de entrega', 'Due time')}
              <input
                type="time"
                value={form.hora_entrega || ''}
                onChange={(event) => setForm({ ...form, hora_entrega: event.target.value })}
              />
            </label>
            <label>
              {t('Color', 'Color')}
              <input
                type="color"
                value={form.color || '#7c3aed'}
                onChange={(event) => setForm({ ...form, color: event.target.value })}
              />
            </label>
          </div>
          <label>
            {t('Descripción', 'Description')}
            <textarea
              rows="3"
              value={form.descripcion}
              onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
            />
          </label>
          <div className="actions">
            <button type="submit" className="button primary">
              {editingId ? t('Guardar cambios', 'Save changes') : t('Crear tarea', 'Create task')}
            </button>
            {editingId ? (
              <button type="button" className="button ghost" onClick={() => {
                setEditingId(null);
                setForm(initTaskForm);
              }}>
                {t('Cancelar', 'Cancel')}
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3>{t('Lista de tareas', 'Task list')}</h3>
            <p className="muted">{t('Filtra por estado y da seguimiento a cada entrega.', 'Filter by status and track each delivery.')}</p>
          </div>
          <div className="filter-group">
            <button type="button" className={filter === 'todas' ? 'active' : ''} onClick={() => setFilter('todas')}>
              {t('Todas', 'All')}
            </button>
            <button type="button" className={filter === 'pendientes' ? 'active' : ''} onClick={() => setFilter('pendientes')}>
              {t('Pendientes', 'Pending')}
            </button>
            <button type="button" className={filter === 'completadas' ? 'active' : ''} onClick={() => setFilter('completadas')}>
              {t('Completadas', 'Completed')}
            </button>
            <button type="button" className={filter === 'vencidas' ? 'active' : ''} onClick={() => setFilter('vencidas')}>
              {t('Vencidas', 'Overdue')}
            </button>
          </div>
        </div>

        <div className="table">
          {filtered.length === 0 ? (
            <EmptyState message={t("No hay tareas para mostrar en este filtro.", "No tasks to show in this filter.")} />
          ) : (
            filtered.map((tarea) => {
              const status = buildTaskStatus(tarea);
              return (
                <div
                  key={tarea.id_tarea}
                  className="table-row"
                  style={{ borderLeft: `4px solid ${tarea.color || getMateriaColor(tarea.id_materia, tarea.materia_color)}` }}
                >
                  <div>
                    <p className="strong">{tarea.titulo}</p>
                    <p className="muted">
                      {formatDate(tarea.fecha_entrega, lang)} 
                      {tarea.hora_entrega ? ` · ${formatTime(tarea.hora_entrega)}` : ''}
                    </p>
                    <div className="meta">
                      <span className="chip subtle" style={{ background: `${tarea.materia_color}22`, color: tarea.materia_color }}>
                        {tarea.materia || t('Materia', 'Subject')}
                      </span>
                      <span className={`chip ${status.tone}`}>{t(status.label, status.label === 'Completada' ? 'Completed' : status.label === 'Pendiente' ? 'Pending' : 'Overdue')}</span>
                    </div>
                  </div>
                  <div className="row-actions">
                    {!tarea.completada ? (
                      <button type="button" className="button ghost" onClick={() => onComplete(tarea.id_tarea)}>
                        {t('Marcar completa', 'Mark complete')}
                      </button>
                    ) : null}
                    <button type="button" className="button ghost" onClick={() => onSelectTask(tarea)}>
                      {t('Ver detalle', 'View details')}
                    </button>
                    <button type="button" className="button ghost" onClick={() => {
                      setEditingId(tarea.id_tarea);
                      setForm({
                        titulo: tarea.titulo,
                        descripcion: tarea.descripcion || '',
                        fecha_entrega: tarea.fecha_entrega,
                        hora_entrega: tarea.hora_entrega || '',
                        id_materia: tarea.id_materia,
                        color: tarea.color || ''
                      });
                    }}>
                      {t('Editar', 'Edit')}
                    </button>
                    <button type="button" className="button ghost danger" onClick={() => onDelete(tarea.id_tarea)}>
                      {t('Eliminar', 'Delete')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function HorariosPanel({ horarios, materias, onCreate, onUpdate, onDelete }) {
  const t = useTranslation();
  const [form, setForm] = useState(initHorarioForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!editingId && materias.length > 0 && !form.id_materia) {
      setForm((current) => ({ ...current, id_materia: materias[0]?.id_materia || '' }));
    }
  }, [materias, editingId]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = { ...form, id_materia: Number(form.id_materia) };
    if (editingId) {
      onUpdate(editingId, payload);
    } else {
      onCreate(payload);
    }
    setEditingId(null);
    setForm(initHorarioForm);
  };

  return (
    <div className="panel">
      <div className="card">
        <h3>{editingId ? t('Editar bloque de horario', 'Edit time block') : t('Nuevo bloque de horario', 'New time block')}</h3>
        <form className="form inline" onSubmit={handleSubmit}>
          <label>
            {t('Materia', 'Subject')}
            <select
              value={form.id_materia}
              onChange={(event) => setForm({ ...form, id_materia: event.target.value })}
              required
            >
              <option value="">{t('Selecciona una materia', 'Select a subject')}</option>
              {materias.map((materia) => (
                <option key={materia.id_materia} value={materia.id_materia}>
                  {materia.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('Día', 'Day')}
            <select
              value={form.dia_semana}
              onChange={(event) => setForm({ ...form, dia_semana: event.target.value })}
            >
              {SCHOOL_DAYS.map((day) => (
                <option key={day} value={day}>
                  {t(day, day === 'Lun' ? 'Mon' : day === 'Mar' ? 'Tue' : day === 'Mie' ? 'Wed' : day === 'Jue' ? 'Thu' : 'Fri')}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('Inicio', 'Start')}
            <input
              type="time"
              value={form.hora_inicio}
              onChange={(event) => setForm({ ...form, hora_inicio: event.target.value })}
              required
            />
          </label>
          <label>
            {t('Fin', 'End')}
            <input
              type="time"
              value={form.hora_fin}
              onChange={(event) => setForm({ ...form, hora_fin: event.target.value })}
              required
            />
          </label>
          <label>
            {t('Color', 'Color')}
            <input
              type="color"
              value={form.color || '#7c3aed'}
              onChange={(event) => setForm({ ...form, color: event.target.value })}
            />
          </label>
          <div className="actions">
            <button type="submit" className="button primary">
              {editingId ? t('Guardar cambios', 'Save changes') : t('Crear horario', 'Create schedule')}
            </button>
            {editingId ? (
              <button type="button" className="button ghost" onClick={() => {
                setEditingId(null);
                setForm(initHorarioForm);
              }}>
                {t('Cancelar', 'Cancel')}
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3>{t('Horario semanal', 'Weekly schedule')}</h3>
            <p className="muted">{t('Vista en bloques de colores por materia.', 'Color-blocked view by subject.')}</p>
          </div>
        </div>
        <ScheduleGrid horarios={horarios} materias={materias} />
      </div>

      <div className="card">
        <h3>{t('Bloques registrados', 'Registered blocks')}</h3>
        <div className="table">
          {horarios.length === 0 ? (
            <EmptyState message={t("Registra horarios para visualizar la semana.", "Register schedules to view the week.")} />
          ) : (
            horarios.map((horario) => (
              <div key={horario.id_horario} className="table-row">
                <div>
                  <p className="strong">{horario.materia || t('Materia', 'Subject')}</p>
                  <p className="muted">
                    {t(horario.dia_semana, EN_DAYS[horario.dia_semana])} · {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                  </p>
                </div>
                <div className="row-actions">
                  <button type="button" className="button ghost" onClick={() => {
                    setEditingId(horario.id_horario);
                    setForm({
                      dia_semana: horario.dia_semana,
                      hora_inicio: formatTime(horario.hora_inicio),
                      hora_fin: formatTime(horario.hora_fin),
                      id_materia: horario.id_materia,
                      color: horario.color || ''
                    });
                  }}>
                    {t('Editar', 'Edit')}
                  </button>
                  <button type="button" className="button ghost danger" onClick={() => onDelete(horario.id_horario)}>
                    {t('Eliminar', 'Delete')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Calendar({ date, tasks, onSelectTask }) {
  const t = useTranslation();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(date.getFullYear(), date.getMonth(), day));
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        {DAY_LABELS.map((label) => (
          <span key={label}>{t(label, EN_DAYS[label])}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {cells.map((cellDate, index) => {
          if (!cellDate) {
            return <div key={`empty-${index}`} className="calendar-cell empty" />;
          }

          const tasksForDay = tasks.filter((task) => {
            const due = normalizeDate(task.fecha_entrega);
            return due ? isSameDay(due, cellDate) : false;
          });

          return (
            <div key={cellDate.toISOString()} className="calendar-cell">
              <span className="calendar-day">{cellDate.getDate()}</span>
              <div className="calendar-tasks">
                {tasksForDay.slice(0, 3).map((task) => {
                  const status = buildTaskStatus(task);
                  return (
                    <button
                      key={task.id_tarea}
                      type="button"
                      className={`task-pill ${status.tone}`}
                      style={{ background: task.color || getMateriaColor(task.id_materia, task.materia_color) }}
                      onClick={() => onSelectTask(task)}
                    >
                      {task.titulo}
                    </button>
                  );
                })}
                {tasksForDay.length > 3 ? (
                  <span className="muted">+{tasksForDay.length - 3} {t('más', 'more')}</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleGrid({ horarios, materias }) {
  const t = useTranslation();
  const scheduleStart = 7 * 60;
  const scheduleEnd = 20 * 60;
  const minuteHeight = 1.2;

  const materiasById = useMemo(
    () => new Map(materias.map((materia) => [materia.id_materia, materia])),
    [materias]
  );

  const hours = [];
  for (let hour = 7; hour <= 20; hour += 1) {
    hours.push(`${String(hour).padStart(2, '0')}:00`);
  }

  return (
    <div className="schedule">
      <div className="schedule-times">
        {hours.map((hour) => (
          <span key={hour}>{hour}</span>
        ))}
      </div>
      <div className="schedule-grid">
        {SCHOOL_DAYS.map((day) => (
          <div key={day} className="schedule-day">
            <div className="day-label">{t(day, day === 'Lun' ? 'Mon' : day === 'Mar' ? 'Tue' : day === 'Mie' ? 'Wed' : day === 'Jue' ? 'Thu' : 'Fri')}</div>
            <div className="day-body" style={{ height: (scheduleEnd - scheduleStart) * minuteHeight }}>
              {horarios
                .filter((horario) => horario.dia_semana === day)
                .map((horario) => {
                    const start = Math.max(toMinutes(horario.hora_inicio), scheduleStart);
                    const end = Math.min(toMinutes(horario.hora_fin), scheduleEnd);
                    const materia = materiasById.get(horario.id_materia);
                    const color = horario.color || getMateriaColor(horario.id_materia, materia?.color);

                    return (
                      <div
                        key={horario.id_horario}
                        className="schedule-block"
                        style={{
                          top: (start - scheduleStart) * minuteHeight,
                          height: Math.max((end - start) * minuteHeight, 32),
                          background: color
                        }}
                      >
                      <span>{materia?.nombre || horario.materia || t('Materia', 'Subject')}</span>
                      <small>
                        {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                      </small>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskDetail({ task, onCompleteTask }) {
  const t = useTranslation();
  const lang = useContext(LanguageContext);
  const status = buildTaskStatus(task);

  return (
    <div className="task-detail">
      <div className="task-header">
        <h4>{task.titulo}</h4>
        <span className={`chip ${status.tone}`}>{t(status.label, status.label === 'Completada' ? 'Completed' : status.label === 'Pendiente' ? 'Pending' : 'Overdue')}</span>
      </div>
      <p className="muted">
        {t('Entrega:', 'Due:')} {formatDate(task.fecha_entrega, lang)}
        {task.hora_entrega ? ` · ${formatTime(task.hora_entrega)}` : ''}
      </p>
      <p>{task.descripcion || t('Sin descripción agregada.', 'No description added.')}</p>
      <div className="meta">
        <span
          className="chip"
          style={{ background: task.materia_color || '#7c3aed', color: 'white' }}
        >
          {task.materia || t('Materia', 'Subject')}
        </span>
      </div>
      {!task.completada ? (
        <button type="button" className="button primary" onClick={() => onCompleteTask(task.id_tarea)}>
          {t('Marcar como completada', 'Mark as completed')}
        </button>
      ) : null}
    </div>
  );
}

function SummaryCard({ title, value, tone }) {
  return (
    <div className={`summary-card ${tone || ''}`}>
      <p className="muted">{title}</p>
      <h3>{value}</h3>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
    </div>
  );
}
