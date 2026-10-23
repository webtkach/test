import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  PawPrint,
  Sparkles,
  Compass,
  Bookmark,
  Users,
  Settings2,
  Plus,
  Search,
  ChevronDown,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Play,
  X,
  Check,
  Globe2,
  SlidersHorizontal,
  Pencil,
  Copy,
  ExternalLink,
  Clapperboard,
  Lightbulb,
  Heart,
  Clock3,
  Link,
  Info,
  Trash2,
  Menu,
  CheckCheck,
} from "lucide-react";
import { initialReels } from "./data";
import { categories, selectReels, instagramUrl, accountName, referenceId, assetUrl } from "./domain";
import "./styles.css";
import "@fontsource-variable/manrope";

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(`lapki:${key}`)) ?? fallback;
  } catch {
    return fallback;
  }
}
function useStored(key, initial) {
  const [value, setValue] = useState(() => read(key, initial));
  useEffect(() => {
    try {
      localStorage.setItem(`lapki:${key}`, JSON.stringify(value));
    } catch {
      window.dispatchEvent(new Event("storage-failed"));
    }
  }, [key, value]);
  return [value, setValue];
}
const candidates = [
  {
    handle: "tikatheiggy",
    name: "Tika the Iggy",
    niche: "Мода · переодевашки",
    text: "Левретка как модный персонаж: смены образов, озвучка и характер. Изучать механику модных историй, адаптируя её под пуделя.",
    type: "world",
  },
  {
    handle: "boobie_billie",
    name: "Boobie Billie",
    niche: "Мода · lifestyle",
    text: "Аккаунт собаки как fashion-блог: аксессуары и визуальный стиль. Кандидат для анализа распаковок и образов.",
    type: "world",
  },
  {
    handle: "poochofnyc",
    name: "Agador · Pooch of NYC",
    niche: "Образы · юмор",
    text: "Кудрявый пёс с узнаваемыми образами. Близкий визуальный референс для персонажа маленького пуделя.",
    type: "world",
  },
  {
    handle: "tuckerbudzyn",
    name: "Tucker Budzyn",
    niche: "Юмор · характер",
    text: "Реакции собаки, семейные ситуации и озвучка. Изучать подачу и первые секунды, а не копировать поведение другой породы.",
    type: "world",
  },
  {
    handle: "dougthepug",
    name: "Doug the Pug",
    niche: "Юмор · поп-культура",
    text: "Собака в узнаваемых человеческих ситуациях. Кандидат для анализа юмора и адаптации культурных сюжетов.",
    type: "world",
  },
  {
    handle: "jiffpom",
    name: "Jiffpom",
    niche: "Образы · визуальная подача",
    text: "Маленькая собака как главный герой кадра. Изучать композицию, аксессуары и простые визуальные истории.",
    type: "world",
  },
];

function App() {
  const [page, setPage] = useState("discover");
  const [route, setRoute] = useState(location.hash.slice(1));
  const [saved, setSaved] = useStored("saved", []);
  const [custom, setCustom] = useStored("custom", []);
  const [edits, setEdits] = useStored("edits", {});
  const [sources, setSources] = useStored("sources", []);
  const [profile, setProfile] = useStored("profile", {
    name: "Наш пудель",
    focus: "Юмор, образы и полезности",
    frequency: "3 рилса в неделю",
  });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все идеи");
  const [region, setRegion] = useState("all");
  const [sort, setSort] = useState("score");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [mobile, setMobile] = useState(false);
  const reels = [...initialReels, ...custom].map((r) => ({
    ...r,
    ...edits[r.id],
  }));
  const active = route.startsWith("reel/")
    ? reels.find((r) => r.id === route.slice(5))
    : null;
  useEffect(() => {
    const changed = () => {
      setRoute(location.hash.slice(1));
      window.scrollTo({ top: 0 });
    };
    const storageFailed = () =>
      setToast(
        "Хранилище браузера недоступно. Правки сохраняются только до закрытия страницы.",
      );
    window.addEventListener("hashchange", changed);
    window.addEventListener("storage-failed", storageFailed);
    return () => {
      window.removeEventListener("hashchange", changed);
      window.removeEventListener("storage-failed", storageFailed);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement;
    const onKey = (e) => {
      if (e.key === "Escape") setModal(null);
      if (e.key === "Tab") {
        const nodes = [
          ...document.querySelectorAll(
            ".modal button, .modal input, .modal textarea, .modal select, .modal a",
          ),
        ].filter((x) => !x.disabled);
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.body.style.overflow = "hidden";
    const t = setTimeout(
      () =>
        document
          .querySelector(".modal input, .modal textarea, .modal button")
          ?.focus(),
      0,
    );
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [modal]);
  const toggleSave = (id) =>
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const navigate = (p) => {
    setPage(p);
    location.hash = "";
    setMobile(false);
    setQuery("");
  };
  const filtered = selectReels(reels, {
    query,
    category,
    region,
    sort,
    savedOnly: page === "saved",
    saved,
  });
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast("Текст скопирован");
    } catch {
      setToast("Не удалось скопировать. Выделите текст и скопируйте вручную.");
    }
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? "is-open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={() => navigate("discover")}
          aria-label="Лапки — главная"
        >
          <span className="brand-mark">
            <PawPrint size={24} fill="currentColor" />
          </span>
          лапки<span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          <span className="workspace-avatar">🐩</span>
          <div>
            <strong>{profile.name}</strong>
            <small>Студия контента</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-label">ВАША СТУДИЯ</div>
        <nav aria-label="Основное меню">
          <button
            className={page === "discover" ? "nav-item active" : "nav-item"}
            onClick={() => navigate("discover")}
          >
            <Compass size={19} />
            Поиск идей<span className="nav-new">NEW</span>
          </button>
          <button
            className={page === "saved" ? "nav-item active" : "nav-item"}
            onClick={() => navigate("saved")}
          >
            <Bookmark size={19} />
            Избранное<span className="nav-count">{saved.length}</span>
          </button>
          <button
            className={page === "sources" ? "nav-item active" : "nav-item"}
            onClick={() => navigate("sources")}
          >
            <Users size={19} />
            Авторы и источники
          </button>
        </nav>
        <div className="sidebar-tip">
          <span className="tip-icon">
            <Sparkles size={20} />
          </span>
          <strong>Вдохновение — рядом</strong>
          <p>
            Берём идею из тренда.
            <br />
            Добавляем характер вашего пса.
          </p>
          <button onClick={() => setModal("method")}>
            Как это работает <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="sidebar-bottom">
          <button
            className="nav-item"
            onClick={() => {
              navigate("settings");
            }}
          >
            <Settings2 size={19} />
            Настройки блога
          </button>
          <div className="user">
            <span className="user-avatar">М</span>
            <div>
              <strong>Моя студия</strong>
              <small>Для маленькой звезды</small>
            </div>
            <span className="status-dot" />
          </div>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Открыть меню"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={21} />
            </button>
            <span>Студия</span>
            <span className="slash">/</span>
            <strong>
              {active
                ? "Референс и сценарий"
                : page === "sources"
                  ? "Авторы и источники"
                  : page === "settings"
                    ? "Настройки блога"
                    : page === "saved"
                      ? "Избранное"
                      : "Поиск идей"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="demo-badge">
              <span />
              Демо-режим
            </span>
            <button
              className="primary-button small"
              onClick={() => setModal("add")}
            >
              <Plus size={16} />
              Добавить референс
            </button>
          </div>
        </header>
        <main>
          {active ? (
            <Detail
              reel={active}
              saved={saved.includes(active.id)}
              toggleSave={() => toggleSave(active.id)}
              edit={() => setModal({ type: "edit", reel: active })}
              copy={copy}
              back={() => {
                location.hash = "";
              }}
            />
          ) : route.startsWith("reel/") ? (
            <div className="empty-state">
              <h2>Референс не найден</h2>
              <p>Возможно, он был добавлен в другом браузере.</p>
              <button
                className="primary-button"
                onClick={() => {
                  location.hash = "";
                }}
              >
                Вернуться к идеям
              </button>
            </div>
          ) : page === "sources" ? (
            <Sources
              sources={sources}
              setSources={setSources}
              notify={setToast}
            />
          ) : page === "settings" ? (
            <Settings
              profile={profile}
              save={(p) => {
                setProfile(p);
                setToast("Настройки блога сохранены");
              }}
            />
          ) : (
            <>
              <div className="page-title-row">
                <div>
                  <div className="eyebrow">
                    <span className="mini-line" />
                    МАЛЕНЬКИЙ ГЕРОЙ. БОЛЬШИЕ ИДЕИ.
                  </div>
                  <h1>
                    {page === "saved"
                      ? "Сохранено на потом"
                      : "Вдохновение для ваших рилсов"}
                    <span className="title-star">✦</span>
                  </h1>
                  <p className="page-description">
                    {page === "saved"
                      ? "Идеи, которые ждут своего звёздного часа."
                      : "Находите идеи, примеряйте тренды и снимайте в своём стиле."}
                  </p>
                </div>
                <span className="page-stamp">
                  <PawPrint size={17} />С любовью к хвостикам
                </span>
              </div>
              {page === "discover" && (
                <section className="hero">
                  <div className="hero-content">
                    <span className="hero-label">
                      <Sparkles size={14} />
                      ВАШ СЛЕДУЮЩИЙ КЛАССНЫЙ РИЛС
                    </span>
                    <h2>
                      Большие идеи.
                      <br />
                      Для маленьких лап.
                    </h2>
                    <p>
                      От модных переодевашек до полезных советов —
                      <br className="desktop-break" /> всё, что хочется снять с
                      вашим пуделем.
                    </p>
                    <button
                      onClick={() =>
                        document
                          .getElementById("ideas")
                          .scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          })
                      }
                    >
                      Найти ту самую идею <ArrowRight size={17} />
                    </button>
                  </div>
                  <div className="hero-art">
                    <div className="orbit orbit-one" />
                    <div className="orbit orbit-two" />
                    <span className="hero-spark spark-one">✦</span>
                    <span className="hero-spark spark-two">✧</span>
                    <div className="hero-photo">
                      <img
                        src={assetUrl('images/hero.jpg')}
                        alt="Кудрявый пудель — главный герой блога"
                      />
                      <span className="hero-photo-caption">
                        main character energy
                      </span>
                    </div>
                    <div className="floating-note">
                      <span>🐾</span>
                      <div>
                        <strong>Он уже готов к съёмке</strong>
                        <small>Осталось выбрать идею</small>
                      </div>
                    </div>
                    <span className="sticker">
                      100%<small>хороший мальчик</small>
                    </span>
                  </div>
                </section>
              )}
              <section className="ideas-section" id="ideas">
                <div className="section-heading">
                  <div>
                    <h2>{page === "saved" ? "Ваша подборка" : "Есть идея!"}</h2>
                    <span className="number-badge">{filtered.length}</span>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setModal("method")}
                  >
                    <Info size={14} />
                    Как устроен рейтинг
                  </button>
                </div>
                <div
                  className="category-row"
                  role="group"
                  aria-label="Тематика"
                >
                  <div className="category-tabs">
                    {categories.map((c, i) => (
                      <button
                        key={c}
                        className={
                          category === c ? "category active" : "category"
                        }
                        onClick={() => setCategory(c)}
                      >
                        {i === 0 && <Sparkles size={15} />}
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="region-filter">
                    <Globe2 size={15} />
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      aria-label="Регион"
                    >
                      <option value="all">Весь мир</option>
                      <option value="world">Зарубежные</option>
                      <option value="local">Локальные</option>
                    </select>
                  </div>
                </div>
                <div className="search-row">
                  <label className="search-field">
                    <Search size={18} />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Найти идею, тему или автора…"
                      aria-label="Поиск референсов"
                    />
                    {query && (
                      <button
                        className="icon-button"
                        aria-label="Очистить поиск"
                        onClick={() => setQuery("")}
                      >
                        <X size={15} />
                      </button>
                    )}
                  </label>
                  <label className="sort-field">
                    <SlidersHorizontal size={15} />
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      aria-label="Сортировка"
                    >
                      <option value="score">По потенциалу</option>
                      <option value="recent">Сначала добавленные</option>
                    </select>
                  </label>
                </div>
                <div className="collection-note">
                  <span className="note-dot" />
                  <span>
                    Стартовая подборка по вашим примерам. Оценки редакционные,
                    статистика Instagram не подключена.
                  </span>
                </div>
                {filtered.length ? (
                  <div className="reel-grid">
                    {filtered.map((r, index) => (
                      <ReelCard
                        key={r.id}
                        reel={r}
                        rank={index + 1}
                        saved={saved.includes(r.id)}
                        toggleSave={() => toggleSave(r.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Bookmark size={32} />
                    <h3>
                      {page === "saved"
                        ? "Здесь поселятся ваши идеи"
                        : "Пока ничего не нашли"}
                    </h3>
                    <p>
                      {page === "saved"
                        ? "Нажмите на закладку у понравившегося рилса."
                        : "Попробуйте другую тему или уберите фильтры."}
                    </p>
                    <button
                      className="secondary-button"
                      onClick={() => {
                        setQuery("");
                        setCategory("Все идеи");
                        setRegion("all");
                        if (page === "saved") navigate("discover");
                      }}
                    >
                      {page === "saved"
                        ? "Посмотреть идеи"
                        : "Сбросить фильтры"}
                    </button>
                  </div>
                )}
              </section>
              <footer className="page-footer">
                <PawPrint size={15} />
                <span>В тренде можно быть. Собой — нужно.</span>
                <span className="footer-right">
                  Сделано для вашего маленького героя
                </span>
              </footer>
            </>
          )}
        </main>
      </div>
      {modal && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <section
            className={`modal ${modal.type === "edit" ? "wide" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              className="modal-close icon-button"
              aria-label="Закрыть"
              onClick={() => setModal(null)}
            >
              <X size={21} />
            </button>
            {modal === "add" ? (
              <AddReference
                onAdd={(r) => {
                  setCustom((prev) => [...prev, r]);
                  setModal(null);
                  location.hash = `reel/${r.id}`;
                  setToast(
                    "Референс добавлен. Дополните сценарий в редакторе.",
                  );
                }}
              />
            ) : modal === "method" ? (
              <>
                <span className="modal-emblem">
                  <Sparkles size={25} />
                </span>
                <h2 id="modal-title">Тренд — только начало</h2>
                <p>
                  Берём механику идеи, добавляем характер вашего пуделя и
                  превращаем в понятный план съёмки.
                </p>
                <div className="method-step">
                  <b>01</b>
                  <div>
                    <strong>Выбирайте референс</strong>
                    <p>
                      В стартовой подборке — примеры форматов, а не найденные
                      публикации. Фото иллюстративные.
                    </p>
                  </div>
                </div>
                <div className="method-step">
                  <b>02</b>
                  <div>
                    <strong>Смотрите на потенциал</strong>
                    <p>
                      Оценка из 100 — редакционный приоритет: соответствие
                      вашему блогу, простота съёмки и возможность адаптации. Это
                      не прогноз просмотров.
                    </p>
                  </div>
                </div>
                <div className="method-step">
                  <b>03</b>
                  <div>
                    <strong>Снимайте по-своему</strong>
                    <p>
                      Правьте сценарий, сохраняйте идеи. Лид-магнит —
                      предложение; его нужно подготовить перед публикацией.
                      Тексты стартовой подборки подготовлены заранее.
                    </p>
                  </div>
                </div>
                <div className="info-box">
                  Автоматический поиск, анализ видео и генерация ИИ пока не
                  подключены. Добавленные ссылки и правки хранятся только в этом
                  браузере.
                </div>
              </>
            ) : modal.type === "edit" ? (
              <Editor
                reel={modal.reel}
                onSave={(value) => {
                  setEdits((prev) => ({ ...prev, [modal.reel.id]: value }));
                  setModal(null);
                  setToast("Ваш сценарий сохранён");
                }}
              />
            ) : null}
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCheck size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}

function ReelCard({ reel, rank, saved, toggleSave }) {
  return (
    <article className="reel-card">
      <a
        className="card-visual"
        href={`#reel/${reel.id}`}
        style={{ "--photo-position": reel.position || "center" }}
      >
        <img src={reel.image} alt={reel.title} loading="lazy" />
        <div className="card-shade" />
        <span className={`rank-badge ${rank === 1 ? "top" : ""}`}>
          <span>#</span>
          {rank}
        </span>
        <span className="duration">
          <Play size={10} fill="currentColor" />
          {reel.duration}
        </span>
        <span className="card-image-text">
          {reel.id === "prada" ? (
            <>
              Сказала, что больше
              <br />
              не покупаю одежду…
            </>
          ) : reel.id === "groomer" ? (
            <>
              Сохраните это
              <br />
              для своего грумера 🐩
            </>
          ) : reel.id === "boss" ? (
            <>
              Он ведёт себя так,
              <br />
              будто платит за квартиру
            </>
          ) : (
            reel.title
          )}
        </span>
        <span className="play-circle">
          <Play size={19} fill="currentColor" />
        </span>
        <span className="preview-label">
          {reel.url ? "Ссылка · иллюстрация" : "Концепция · иллюстрация"}
        </span>
      </a>
      <button
        className={`save-card ${saved ? "is-saved" : ""}`}
        aria-label={saved ? "Убрать из избранного" : "Сохранить в избранное"}
        onClick={toggleSave}
      >
        <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
      </button>
      <div className="card-body">
        <div className="card-meta">
          <span className={`tag ${reel.color || "green"}`}>
            {reel.category}
          </span>
          <span className="score">
            <Sparkles size={12} />
            {reel.score}
            <span>/100</span>
          </span>
        </div>
        <a href={`#reel/${reel.id}`} className="card-title">
          {reel.title}
        </a>
        <div className="card-creator">
          <span className="creator-icon">
            {reel.region === "world" ? (
              <Globe2 size={11} />
            ) : (
              <PawPrint size={11} />
            )}
          </span>
          {reel.creator}
        </div>
        <div className="card-bottom">
          <span>
            <span className={`tiny-dot ${reel.color || "green"}`} />
            {reel.tag}
          </span>
          <a href={`#reel/${reel.id}`}>
            Сценарий <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}

function Detail({ reel, saved, toggleSave, edit, copy, back }) {
  const [video, setVideo] = useState(false);
  useEffect(() => {
    setVideo(false);
  }, [reel.id]);
  const fullText = `${reel.title}\n\n${reel.script.map((s) => `${s.time} · ${s.label}\n${s.text}`).join("\n\n")}\n\nПодпись\n${reel.caption}\n\nЛид-магнит\n${reel.magnet}`;
  return (
    <div className="detail-page">
      <button className="text-button back" onClick={back}>
        <ArrowLeft size={17} />
        Назад к идеям
      </button>
      <div className="detail-top">
        <div>
          <div className="eyebrow">ВАШ СЛЕДУЮЩИЙ СЮЖЕТ</div>
          <h1>{reel.title}</h1>
        </div>
        <button
          className={`secondary-button ${saved ? "saved-button" : ""}`}
          onClick={toggleSave}
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
          {saved ? "В избранном" : "Сохранить"}
        </button>
      </div>
      <div className="detail-layout">
        <aside className="reference-column">
          <div className="reference-preview">
            {video && reel.url ? (
              <iframe
                title="Оригинальный рилс в Instagram"
                src={`${reel.url}embed/`}
                allow="autoplay; encrypted-media; fullscreen"
                loading="lazy"
              />
            ) : (
              <>
                <img
                  src={reel.image}
                  alt={reel.title}
                  style={{ objectPosition: reel.position || "center" }}
                />
                <div className="reference-overlay">
                  <span className="tag green">
                    {reel.url ? "Ваш референс" : "Концепция рилса"}
                  </span>
                  <p>{reel.hook}</p>
                  {reel.url ? (
                    <>
                      <button
                        className="video-play"
                        onClick={() => setVideo(true)}
                        aria-label="Загрузить видео из Instagram"
                      >
                        <Play size={26} fill="currentColor" />
                      </button>
                      <span className="concept-note">Обложка иллюстративная · оригинал по кнопке</span>
                    </>
                  ) : (
                    <span className="concept-note">
                      Иллюстрация идеи · не исходное видео
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          {reel.url ? (
            <>
              <a
                className="primary-button instagram-link"
                href={reel.url}
                target="_blank"
                rel="noreferrer"
              >
                Открыть в Instagram <ExternalLink size={16} />
              </a>
              <p className="fine-print">
                Если Instagram не показывает видео здесь, откройте оригинал по
                кнопке.
              </p>
            </>
          ) : (
            <div className="info-box">
              <Info size={16} />
              <p>
                Это пример по вашему описанию. Ссылку на оригинал можно добавить
                через «Добавить референс».
              </p>
            </div>
          )}
          <div className="reference-meta">
            <span>
              <Clock3 size={15} />
              {reel.duration}
            </span>
            <span>
              <Globe2 size={15} />
              {reel.country}
            </span>
          </div>
        </aside>
        <div className="script-column">
          <section className="why-card">
            <span className="why-icon">
              <Lightbulb size={21} />
            </span>
            <div>
              <h3>Почему стоит попробовать</h3>
              <p>{reel.why}</p>
            </div>
          </section>
          <section className="content-panel">
            <div className="panel-heading">
              <h2>
                <Clapperboard size={20} />
                План съёмки
              </h2>
              <button className="secondary-button small" onClick={edit}>
                <Pencil size={14} />
                Под себя
              </button>
            </div>
            <p className="panel-subtitle">
              Сценарий для вашего маленького героя
            </p>
            <div className="timeline">
              {reel.script.map((s, i) => (
                <div className="timeline-step" key={i}>
                  <div className="time">
                    <span>{s.time}</span>
                    <small>секунд</small>
                  </div>
                  <div>
                    <h3>{s.label}</h3>
                    <p>{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="shoot-note">
              <Clapperboard size={16} />
              <p>{reel.notes}</p>
            </div>
          </section>
          <section className="content-panel">
            <div className="panel-heading">
              <h2>
                <Pencil size={19} />
                Подпись к рилсу
              </h2>
              <button
                className="icon-button"
                onClick={() => copy(reel.caption)}
                aria-label="Скопировать подпись"
              >
                <Copy size={17} />
              </button>
            </div>
            <p className="caption-text">{reel.caption}</p>
          </section>
          <section className="magnet-panel">
            <span className="magnet-icon">
              <Heart size={22} />
            </span>
            <div>
              <span className="eyebrow">ПОВОД ОСТАТЬСЯ С ВАМИ</span>
              <h2>Лид-магнит</h2>
              <p>{reel.magnet}</p>
            </div>
          </section>
          <div className="detail-actions">
            <button className="primary-button" onClick={edit}>
              <Pencil size={16} />
              Редактировать сценарий
            </button>
            <button className="secondary-button" onClick={() => copy(fullText)}>
              <Copy size={16} />
              Скопировать всё
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Editor({ reel, onSave }) {
  const [draft, setDraft] = useState({
    title: reel.title,
    hook: reel.hook,
    script: reel.script.map((s) => ({ ...s })),
    caption: reel.caption,
    magnet: reel.magnet,
    notes: reel.notes,
  });
  const field = (key, value) => setDraft((p) => ({ ...p, [key]: value }));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft);
      }}
    >
      <span className="modal-emblem">
        <Pencil size={24} />
      </span>
      <h2 id="modal-title">Добавьте ваш характер</h2>
      <p>Сохранённые правки останутся в этом браузере.</p>
      <label className="form-field">
        Название
        <input
          required
          value={draft.title}
          onChange={(e) => field("title", e.target.value)}
          maxLength={120}
        />
      </label>
      <label className="form-field">
        Зацепка
        <textarea
          required
          value={draft.hook}
          onChange={(e) => field("hook", e.target.value)}
          rows={2}
        />
      </label>
      {draft.script.map((s, i) => (
        <label className="form-field" key={i}>
          {s.time} сек. · {s.label}
          <textarea
            required
            value={s.text}
            rows={3}
            onChange={(e) =>
              field(
                "script",
                draft.script.map((item, j) =>
                  j === i ? { ...item, text: e.target.value } : item,
                ),
              )
            }
          />
        </label>
      ))}
      <label className="form-field">
        Подпись
        <textarea
          required
          value={draft.caption}
          onChange={(e) => field("caption", e.target.value)}
          rows={3}
        />
      </label>
      <label className="form-field">
        Лид-магнит
        <textarea
          required
          value={draft.magnet}
          onChange={(e) => field("magnet", e.target.value)}
          rows={3}
        />
      </label>
      <label className="form-field">
        Заметки к съёмке
        <textarea
          value={draft.notes}
          onChange={(e) => field("notes", e.target.value)}
          rows={2}
        />
      </label>
      <button className="primary-button full" type="submit">
        <Check size={17} />
        Сохранить мой сценарий
      </button>
    </form>
  );
}

function AddReference({ onAdd }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Юмор");
  const [region, setRegion] = useState("world");
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const normalized = instagramUrl(url);
        if (!normalized) {
          setError("Нужна ссылка вида https://www.instagram.com/reel/…");
          return;
        }
        onAdd({
          id: referenceId(),
          url: normalized,
          title: title.trim(),
          category,
          region,
          creator: "Добавлено вами",
          country:
            region === "world" ? "Зарубежный референс" : "Локальный референс",
          image: assetUrl('images/groomer.jpg'),
          score: 50,
          created: Date.now(),
          duration: "—",
          tag: "Новый референс",
          color: "green",
          hook: "Опишите, что цепляет в первые секунды оригинала.",
          why: "Вы выбрали этот референс. После просмотра оригинала запишите, что хотите адаптировать для вашего пуделя.",
          script: [
            {
              time: "00–03",
              label: "Зацепка",
              text: "Запишите первые слова и первый кадр.",
            },
            {
              time: "03–10",
              label: "Главный момент",
              text: "Опишите действие и смену планов под вашего пуделя.",
            },
            {
              time: "10–15",
              label: "Финал",
              text: "Добавьте развязку и призыв для зрителя.",
            },
          ],
          caption: "Добавьте вашу подпись к рилсу.",
          magnet:
            "Выберите полезный материал, который вы сможете подготовить для подписчиков.",
          notes:
            "Длительность и содержание исходного видео нужно проверить вручную. Автоматический разбор не подключён.",
        });
      }}
    >
      <span className="modal-emblem">
        <Link size={25} />
      </span>
      <h2 id="modal-title">Нашли что-то классное?</h2>
      <p>Сохраните рилс и создайте свою версию сценария.</p>
      <label className="form-field">
        Ссылка на Instagram
        <input
          aria-label="Ссылка на Instagram"
          aria-invalid={!!error}
          aria-describedby={error ? "url-error" : undefined}
          type="url"
          required
          placeholder="https://www.instagram.com/reel/…"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
        />
        {error && (
          <span id="url-error" className="form-error" role="alert">
            {error}
          </span>
        )}
      </label>
      <label className="form-field">
        Название идеи
        <input
          required
          maxLength={120}
          placeholder="Например: Пудель собирается на свидание"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          pattern=".*\S.*"
        />
      </label>
      <label className="form-field">
        Тематика
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.slice(1).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="form-field">
        Источник
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="world">Зарубежный</option>
          <option value="local">Локальный</option>
        </select>
      </label>
      <div className="info-box">
        Сохраняется ссылка и заготовка сценария. Видео не скачивается, просмотры
        и содержание автоматически не определяются.
      </div>
      <button className="primary-button full" type="submit">
        <Plus size={17} />
        Добавить в студию
      </button>
    </form>
  );
}

function Sources({ sources, setSources, notify }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const add = (handle) => {
    if (sources.some((s) => s.toLowerCase() === handle.toLowerCase())) {
      notify("Автор уже в вашем списке");
      return;
    }
    setSources((prev) => [...prev, handle]);
    notify("Автор добавлен в список для наблюдения");
  };
  return (
    <div className="sources-page">
      <div className="eyebrow">СМОТРИМ ШИРЕ</div>
      <h1>
        Авторы и источники<span className="title-star">✦</span>
      </h1>
      <p className="page-description">
        Ищем интересные механики за пределами своей ленты.
      </p>
      <section className="research-banner">
        <Globe2 size={25} />
        <div>
          <h3>Зарубежные ориентиры для вашего блога</h3>
          <p>
            Ниже — кандидаты для исследования по тематике и формату. Текущая
            активность, охваты и первенство в трендах не проверены: доступ к
            Instagram и поиску в этой среде заблокирован. Это не подтверждённый
            рейтинг конкурентов.
          </p>
        </div>
      </section>
      <section className="content-panel">
        <h2>
          Ваш список для наблюдения{" "}
          <span className="number-badge">{sources.length}</span>
        </h2>
        <form
          className="source-form"
          onSubmit={(e) => {
            e.preventDefault();
            const handle = accountName(value);
            if (!handle) {
              setError("Введите @имя или ссылку на профиль Instagram");
              return;
            }
            add(handle);
            setValue("");
            setError("");
          }}
        >
          <input
            aria-label="Instagram-аккаунт"
            placeholder="@автор или ссылка на профиль"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
          <button className="primary-button" type="submit">
            <Plus size={17} />
            Добавить автора
          </button>
        </form>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {sources.length ? (
          <div className="saved-sources">
            {sources.map((s) => (
              <div key={s}>
                <a
                  href={`https://www.instagram.com/${s}/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{s}
                  <ArrowUpRight size={14} />
                </a>
                <button
                  className="icon-button"
                  aria-label={`Удалить ${s}`}
                  onClick={() =>
                    setSources((prev) => prev.filter((x) => x !== s))
                  }
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="fine-print">
            Выберите авторов ниже или добавьте своего. Автоматический мониторинг
            пока не подключён.
          </p>
        )}
      </section>
      <div className="section-heading">
        <h2>Кандидаты для исследования</h2>
        <span className="demo-badge">Требуют проверки</span>
      </div>
      <div className="source-grid">
        {candidates.map((c) => (
          <article className="source-card" key={c.handle}>
            <div className="source-card-head">
              <span className="source-avatar">{c.name[0]}</span>
              <a
                href={`https://www.instagram.com/${c.handle}/`}
                target="_blank"
                rel="noreferrer"
              >
                <strong>{c.name}</strong>
                <span>
                  @{c.handle}
                  <ArrowUpRight size={12} />
                </span>
              </a>
            </div>
            <span className="tag green">{c.niche}</span>
            <p>{c.text}</p>
            <button
              className="secondary-button full"
              disabled={sources.includes(c.handle)}
              onClick={() => add(c.handle)}
            >
              {sources.includes(c.handle) ? (
                <>
                  <Check size={16} />В вашем списке
                </>
              ) : (
                <>
                  <Plus size={16} />В список наблюдения
                </>
              )}
            </button>
          </article>
        ))}
      </div>
      <section className="content-panel research-method">
        <h2>Как определять, кто задаёт тренды</h2>
        <p>
          Сравнивать дату первых публикаций, повторение формата у других авторов
          и результаты относительно обычных просмотров каждого аккаунта.
          Одиночный вирусный рилс или большая аудитория не доказывают
          первенство.
        </p>
        <div className="method-columns">
          <div>
            <b>Ранний сигнал</b>
            <p>
              Новая механика, звук или подача. Проверяем зарубежные публикации и
              время появления повторов.
            </p>
          </div>
          <div>
            <b>Реальный рост</b>
            <p>
              Сравниваем ролик с медианой последних 20 сопоставимых публикаций
              автора, учитывая давность.
            </p>
          </div>
          <div>
            <b>Подходит вашему псу</b>
            <p>
              Оцениваем характер, реквизит, сложность съёмки и пользу для вашей
              аудитории.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Settings({ profile, save }) {
  const [draft, setDraft] = useState(profile);
  return (
    <div className="settings-page">
      <div className="eyebrow">ГЛАВНЫЙ ГЕРОЙ В КАДРЕ</div>
      <h1>Настройки блога</h1>
      <p className="page-description">Немного о вашей маленькой звезде.</p>
      <form
        className="content-panel settings-form"
        onSubmit={(e) => {
          e.preventDefault();
          save(draft);
        }}
      >
        <label className="form-field">
          Название студии или имя питомца
          <input
            required
            maxLength={40}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </label>
        <label className="form-field">
          Основные темы
          <textarea
            required
            value={draft.focus}
            onChange={(e) => setDraft({ ...draft, focus: e.target.value })}
          />
        </label>
        <label className="form-field">
          Ваш ориентир по съёмкам
          <select
            value={draft.frequency}
            onChange={(e) => setDraft({ ...draft, frequency: e.target.value })}
          >
            <option>1 рилс в неделю</option>
            <option>3 рилса в неделю</option>
            <option>5 рилсов в неделю</option>
            <option>По вдохновению</option>
          </select>
        </label>
        <div className="info-box">
          Профиль сохраняется локально. Темы и частота служат вашими заметками;
          автоматическая персонализация пока не подключена.
        </div>
        <button className="primary-button" type="submit">
          <Check size={17} />
          Сохранить настройки
        </button>
      </form>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
