import { useState, useEffect, useCallback, useContext, createContext } from 'react';

export type Language = 'ru' | 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko';

export interface LocaleData {
  [key: string]: string | LocaleData;
}

export interface LocalizationConfig {
  defaultLanguage: Language;
  fallbackLanguage: Language;
  availableLanguages: Language[];
  dateFormat: string;
  numberFormat: string;
  currency: string;
}

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatDate: (date: Date) => string;
  formatNumber: (number: number) => string;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
  availableLanguages: Language[];
}

// Контекст локализации
const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// Словари переводов
const translations: Record<Language, LocaleData> = {
  ru: {
    common: {
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
      cancel: 'Отмена',
      ok: 'ОК',
      yes: 'Да',
      no: 'Нет',
      save: 'Сохранить',
      delete: 'Удалить',
      edit: 'Редактировать',
      back: 'Назад',
      next: 'Далее',
      previous: 'Предыдущий',
      search: 'Поиск',
      filter: 'Фильтр',
      settings: 'Настройки',
    },
    auth: {
      login: 'Войти',
      register: 'Регистрация',
      logout: 'Выйти',
      email: 'Email',
      password: 'Пароль',
      confirmPassword: 'Подтвердите пароль',
      forgotPassword: 'Забыли пароль?',
      rememberMe: 'Запомнить меня',
      loginSuccess: 'Вход выполнен успешно',
      registerSuccess: 'Регистрация прошла успешно',
      invalidCredentials: 'Неверные данные для входа',
    },
    app: {
      title: 'Болтай и Знакомься',
      subtitle: 'Голосовые знакомства за 5 минут',
      startCall: 'Начать звонок',
      endCall: 'Завершить звонок',
      searching: 'Поиск собеседника...',
      connected: 'Соединение установлено',
      callEnded: 'Звонок завершен',
      rateCall: 'Оценить звонок',
      like: 'Нравится',
      pass: 'Пропустить',
    },
    profile: {
      profile: 'Профиль',
      name: 'Имя',
      age: 'Возраст',
      location: 'Местоположение',
      interests: 'Интересы',
      aboutMe: 'О себе',
      editProfile: 'Редактировать профиль',
      saveProfile: 'Сохранить профиль',
    },
    notifications: {
      newMatch: 'Новое совпадение!',
      incomingCall: 'Входящий звонок',
      callMissed: 'Пропущенный звонок',
      messageReceived: 'Новое сообщение',
      settings: 'Настройки уведомлений',
      enable: 'Включить уведомления',
      disable: 'Отключить уведомления',
    },
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      ok: 'OK',
      yes: 'Yes',
      no: 'No',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      settings: 'Settings',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
      loginSuccess: 'Login successful',
      registerSuccess: 'Registration successful',
      invalidCredentials: 'Invalid credentials',
    },
    app: {
      title: 'Chat & Meet',
      subtitle: 'Voice dating in 5 minutes',
      startCall: 'Start Call',
      endCall: 'End Call',
      searching: 'Searching for partner...',
      connected: 'Connected',
      callEnded: 'Call ended',
      rateCall: 'Rate call',
      like: 'Like',
      pass: 'Pass',
    },
    profile: {
      profile: 'Profile',
      name: 'Name',
      age: 'Age',
      location: 'Location',
      interests: 'Interests',
      aboutMe: 'About Me',
      editProfile: 'Edit Profile',
      saveProfile: 'Save Profile',
    },
    notifications: {
      newMatch: 'New match!',
      incomingCall: 'Incoming call',
      callMissed: 'Missed call',
      messageReceived: 'New message',
      settings: 'Notification settings',
      enable: 'Enable notifications',
      disable: 'Disable notifications',
    },
  },
  es: {
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      ok: 'OK',
      yes: 'Sí',
      no: 'No',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      search: 'Buscar',
      filter: 'Filtro',
      settings: 'Configuración',
    },
    auth: {
      login: 'Iniciar sesión',
      register: 'Registrarse',
      logout: 'Cerrar sesión',
      email: 'Correo electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      rememberMe: 'Recordarme',
      loginSuccess: 'Inicio de sesión exitoso',
      registerSuccess: 'Registro exitoso',
      invalidCredentials: 'Credenciales inválidas',
    },
    app: {
      title: 'Habla y Conoce',
      subtitle: 'Citas por voz en 5 minutos',
      startCall: 'Iniciar llamada',
      endCall: 'Terminar llamada',
      searching: 'Buscando compañero...',
      connected: 'Conectado',
      callEnded: 'Llamada terminada',
      rateCall: 'Calificar llamada',
      like: 'Me gusta',
      pass: 'Pasar',
    },
    profile: {
      profile: 'Perfil',
      name: 'Nombre',
      age: 'Edad',
      location: 'Ubicación',
      interests: 'Intereses',
      aboutMe: 'Sobre mí',
      editProfile: 'Editar perfil',
      saveProfile: 'Guardar perfil',
    },
    notifications: {
      newMatch: '¡Nueva coincidencia!',
      incomingCall: 'Llamada entrante',
      callMissed: 'Llamada perdida',
      messageReceived: 'Nuevo mensaje',
      settings: 'Configuración de notificaciones',
      enable: 'Activar notificaciones',
      disable: 'Desactivar notificaciones',
    },
  },
  fr: {
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      ok: 'OK',
      yes: 'Oui',
      no: 'Non',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      search: 'Rechercher',
      filter: 'Filtre',
      settings: 'Paramètres',
    },
    auth: {
      login: 'Se connecter',
      register: "S'inscrire",
      logout: 'Se déconnecter',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      forgotPassword: 'Mot de passe oublié?',
      rememberMe: 'Se souvenir de moi',
      loginSuccess: 'Connexion réussie',
      registerSuccess: 'Inscription réussie',
      invalidCredentials: 'Identifiants invalides',
    },
    app: {
      title: 'Parle et Rencontre',
      subtitle: 'Rencontres vocales en 5 minutes',
      startCall: 'Commencer un appel',
      endCall: 'Terminer un appel',
      searching: 'Recherche de partenaire...',
      connected: 'Connecté',
      callEnded: 'Appel terminé',
      rateCall: "Évaluer l'appel",
      like: "J'aime",
      pass: 'Passer',
    },
    profile: {
      profile: 'Profil',
      name: 'Nom',
      age: 'Âge',
      location: 'Emplacement',
      interests: 'Intérêts',
      aboutMe: 'À propos de moi',
      editProfile: 'Modifier le profil',
      saveProfile: 'Enregistrer le profil',
    },
    notifications: {
      newMatch: 'Nouvelle correspondance!',
      incomingCall: 'Appel entrant',
      callMissed: 'Appel manqué',
      messageReceived: 'Nouveau message',
      settings: 'Paramètres de notification',
      enable: 'Activer les notifications',
      disable: 'Désactiver les notifications',
    },
  },
  de: {
    common: {
      loading: 'Wird geladen...',
      error: 'Fehler',
      success: 'Erfolg',
      cancel: 'Abbrechen',
      ok: 'OK',
      yes: 'Ja',
      no: 'Nein',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      back: 'Zurück',
      next: 'Weiter',
      previous: 'Vorherige',
      search: 'Suchen',
      filter: 'Filter',
      settings: 'Einstellungen',
    },
    auth: {
      login: 'Anmelden',
      register: 'Registrieren',
      logout: 'Abmelden',
      email: 'E-Mail',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      forgotPassword: 'Passwort vergessen?',
      rememberMe: 'Angemeldet bleiben',
      loginSuccess: 'Anmeldung erfolgreich',
      registerSuccess: 'Registrierung erfolgreich',
      invalidCredentials: 'Ungültige Anmeldedaten',
    },
    app: {
      title: 'Sprechen und Kennenlernen',
      subtitle: 'Sprach-Dating in 5 Minuten',
      startCall: 'Anruf starten',
      endCall: 'Anruf beenden',
      searching: 'Partner wird gesucht...',
      connected: 'Verbunden',
      callEnded: 'Anruf beendet',
      rateCall: 'Anruf bewerten',
      like: 'Gefällt mir',
      pass: 'Weiter',
    },
    profile: {
      profile: 'Profil',
      name: 'Name',
      age: 'Alter',
      location: 'Standort',
      interests: 'Interessen',
      aboutMe: 'Über mich',
      editProfile: 'Profil bearbeiten',
      saveProfile: 'Profil speichern',
    },
    notifications: {
      newMatch: 'Neues Match!',
      incomingCall: 'Eingehender Anruf',
      callMissed: 'Verpasster Anruf',
      messageReceived: 'Neue Nachricht',
      settings: 'Benachrichtigungseinstellungen',
      enable: 'Benachrichtigungen aktivieren',
      disable: 'Benachrichtigungen deaktivieren',
    },
  },
  zh: {
    common: {
      loading: '加载中...',
      error: '错误',
      success: '成功',
      cancel: '取消',
      ok: '确定',
      yes: '是',
      no: '否',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      search: '搜索',
      filter: '筛选',
      settings: '设置',
    },
    auth: {
      login: '登录',
      register: '注册',
      logout: '登出',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      forgotPassword: '忘记密码？',
      rememberMe: '记住我',
      loginSuccess: '登录成功',
      registerSuccess: '注册成功',
      invalidCredentials: '登录信息无效',
    },
    app: {
      title: '语聊交友',
      subtitle: '5分钟语音约会',
      startCall: '开始通话',
      endCall: '结束通话',
      searching: '正在寻找聊天对象...',
      connected: '已连接',
      callEnded: '通话结束',
      rateCall: '评价通话',
      like: '喜欢',
      pass: '跳过',
    },
    profile: {
      profile: '个人资料',
      name: '姓名',
      age: '年龄',
      location: '位置',
      interests: '兴趣',
      aboutMe: '关于我',
      editProfile: '编辑资料',
      saveProfile: '保存资料',
    },
    notifications: {
      newMatch: '新匹配！',
      incomingCall: '来电',
      callMissed: '错过的通话',
      messageReceived: '新消息',
      settings: '通知设置',
      enable: '启用通知',
      disable: '禁用通知',
    },
  },
  ja: {
    common: {
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
      cancel: 'キャンセル',
      ok: 'OK',
      yes: 'はい',
      no: 'いいえ',
      save: '保存',
      delete: '削除',
      edit: '編集',
      back: '戻る',
      next: '次へ',
      previous: '前へ',
      search: '検索',
      filter: 'フィルター',
      settings: '設定',
    },
    auth: {
      login: 'ログイン',
      register: '登録',
      logout: 'ログアウト',
      email: 'メール',
      password: 'パスワード',
      confirmPassword: 'パスワード確認',
      forgotPassword: 'パスワードを忘れた？',
      rememberMe: 'ログイン状態を保持',
      loginSuccess: 'ログイン成功',
      registerSuccess: '登録成功',
      invalidCredentials: '認証情報が無効',
    },
    app: {
      title: 'トーク＆ミート',
      subtitle: '5分間の音声デート',
      startCall: '通話開始',
      endCall: '通話終了',
      searching: 'パートナーを検索中...',
      connected: '接続済み',
      callEnded: '通話終了',
      rateCall: '通話を評価',
      like: 'いいね',
      pass: 'パス',
    },
    profile: {
      profile: 'プロフィール',
      name: '名前',
      age: '年齢',
      location: '場所',
      interests: '興味',
      aboutMe: '自己紹介',
      editProfile: 'プロフィール編集',
      saveProfile: 'プロフィール保存',
    },
    notifications: {
      newMatch: '新しいマッチ！',
      incomingCall: '着信',
      callMissed: '不在着信',
      messageReceived: '新しいメッセージ',
      settings: '通知設定',
      enable: '通知を有効にする',
      disable: '通知を無効にする',
    },
  },
  ko: {
    common: {
      loading: '로딩 중...',
      error: '오류',
      success: '성공',
      cancel: '취소',
      ok: '확인',
      yes: '예',
      no: '아니오',
      save: '저장',
      delete: '삭제',
      edit: '편집',
      back: '뒤로',
      next: '다음',
      previous: '이전',
      search: '검색',
      filter: '필터',
      settings: '설정',
    },
    auth: {
      login: '로그인',
      register: '회원가입',
      logout: '로그아웃',
      email: '이메일',
      password: '비밀번호',
      confirmPassword: '비밀번호 확인',
      forgotPassword: '비밀번호를 잊으셨나요?',
      rememberMe: '로그인 상태 유지',
      loginSuccess: '로그인 성공',
      registerSuccess: '회원가입 성공',
      invalidCredentials: '잘못된 인증 정보',
    },
    app: {
      title: '톡앤미트',
      subtitle: '5분 음성 데이팅',
      startCall: '통화 시작',
      endCall: '통화 종료',
      searching: '상대방 검색 중...',
      connected: '연결됨',
      callEnded: '통화 종료',
      rateCall: '통화 평가',
      like: '좋아요',
      pass: '패스',
    },
    profile: {
      profile: '프로필',
      name: '이름',
      age: '나이',
      location: '위치',
      interests: '관심사',
      aboutMe: '자기소개',
      editProfile: '프로필 편집',
      saveProfile: '프로필 저장',
    },
    notifications: {
      newMatch: '새로운 매치!',
      incomingCall: '수신 전화',
      callMissed: '부재중 전화',
      messageReceived: '새 메시지',
      settings: '알림 설정',
      enable: '알림 활성화',
      disable: '알림 비활성화',
    },
  },
};

export const useLocalization = (): LocalizationContextType => {
  const [language, setLanguageState] = useState<Language>('ru');
  const [isLoading, setIsLoading] = useState(false);

  const availableLanguages: Language[] = ['ru', 'en', 'es', 'fr', 'de', 'zh', 'ja', 'ko'];

  // Определение языка браузера
  useEffect(() => {
    const detectBrowserLanguage = (): Language => {
      const browserLang = navigator.language.toLowerCase();
      
      if (browserLang.startsWith('en')) return 'en';
      if (browserLang.startsWith('es')) return 'es';
      if (browserLang.startsWith('fr')) return 'fr';
      if (browserLang.startsWith('de')) return 'de';
      if (browserLang.startsWith('zh')) return 'zh';
      if (browserLang.startsWith('ja')) return 'ja';
      if (browserLang.startsWith('ko')) return 'ko';
      
      return 'ru'; // Fallback
    };

    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && availableLanguages.includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      const detectedLanguage = detectBrowserLanguage();
      setLanguageState(detectedLanguage);
    }
  }, []);

  // Установка языка
  const setLanguage = useCallback((newLanguage: Language) => {
    setIsLoading(true);
    
    setTimeout(() => {
      setLanguageState(newLanguage);
      localStorage.setItem('language', newLanguage);
      
      // Обновление HTML lang атрибута
      document.documentElement.lang = newLanguage;
      
      setIsLoading(false);
    }, 100);
  }, []);

  // Функция перевода
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback на английский
        value = translations['en'];
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Возвращаем ключ если перевод не найден
          }
        }
        break;
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    // Подстановка параметров
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  }, [language]);

  // Форматирование даты
  const formatDate = useCallback((date: Date): string => {
    const locales: Record<Language, string> = {
      ru: 'ru-RU',
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      zh: 'zh-CN',
      ja: 'ja-JP',
      ko: 'ko-KR',
    };

    return new Intl.DateTimeFormat(locales[language]).format(date);
  }, [language]);

  // Форматирование чисел
  const formatNumber = useCallback((number: number): string => {
    const locales: Record<Language, string> = {
      ru: 'ru-RU',
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      zh: 'zh-CN',
      ja: 'ja-JP',
      ko: 'ko-KR',
    };

    return new Intl.NumberFormat(locales[language]).format(number);
  }, [language]);

  // Форматирование валюты
  const formatCurrency = useCallback((amount: number): string => {
    const currencies: Record<Language, { currency: string; locale: string }> = {
      ru: { currency: 'RUB', locale: 'ru-RU' },
      en: { currency: 'USD', locale: 'en-US' },
      es: { currency: 'EUR', locale: 'es-ES' },
      fr: { currency: 'EUR', locale: 'fr-FR' },
      de: { currency: 'EUR', locale: 'de-DE' },
      zh: { currency: 'CNY', locale: 'zh-CN' },
      ja: { currency: 'JPY', locale: 'ja-JP' },
      ko: { currency: 'KRW', locale: 'ko-KR' },
    };

    const { currency, locale } = currencies[language];
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  }, [language]);

  return {
    language,
    setLanguage,
    t,
    formatDate,
    formatNumber,
    formatCurrency,
    isLoading,
    availableLanguages,
  };
};

// Провайдер локализации
export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const localization = useLocalization();

  return (
    <LocalizationContext.Provider value={localization}>
      {children}
    </LocalizationContext.Provider>
  );
};

// Хук для использования локализации
export const useTranslation = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useTranslation must be used within LocalizationProvider');
  }
  return context;
}; 