import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import UserForm from "../components/UserForm";
import ModuleManager from "../components/ModuleManager";
import ChangePasswordForm from "../components/ChangePasswordForm";
import GroupManager from "../components/GroupManager";
import AccessManager from "../components/AccessManager";
import UserList from "../components/UserList";
import Toast from "../../components/Toast";
import { getSession, clearSession } from "../../utils/session";
import "../assets/style.css";


const sections = [
  { id: "users", label: "Добавить пользователя" },
  { id: "reset", label: "Сброс пароля" },
  { id: "userlist", label: "Список пользователей" },
  { id: "modules", label: "Управление модулями" },
  { id: "groups", label: "Управление группами" },
  { id: "access", label: "Назначить доступы" },

];

function AdminPanel() {
  const [activeSection, setActiveSection] = useState("users");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const logout = () => {
    clearSession();
    navigate("/");
  };

  const renderSection = () => {
  switch (activeSection) {
    case "users":
      return <UserForm setToast={setToast} />;
    case "modules":
      return <ModuleManager setToast={setToast} />;
    case "reset":
      return <ChangePasswordForm setToast={setToast} />;
    case "groups":
      return <GroupManager setToast={setToast} />;
    case "access":
      return <AccessManager setToast={setToast} />;
    case "userlist":
      return <UserList setToast={setToast} />;
    default:
      return null;
  }
};

  useEffect(() => {
    const session = getSession();
    if (!session?.user || session.user.role !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="admin-panel">
      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <svg width="30" height="30" viewBox="0 0 24 25" fill="none">
          <path d="M3 6.76855H21M3 12.0186H21M3 17.2686H21" stroke="#0046a0" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <div className={`menu-container ${menuOpen ? "open" : ""}`}>
        <div className="menu-close" onClick={() => setMenuOpen(false)}></div>
        <div className="menu-title">Админ-панель</div>

        {sections.map((s) => (
          <button
            key={s.id}
            className={`menu-item ${activeSection === s.id ? "selected" : ""}`}
            onClick={() => {
              setActiveSection(s.id);
              setMenuOpen(false);
            }}
          >
            {s.label}
          </button>
        ))}

        <div className="bottom-buttons u-mt-auto">
          <Link to="/user" className="logout-button">Вернуться</Link>
          <button onClick={logout} className="logout-button">Выход</button>
        </div>
      </div>

      <div className="admin-content-area">
        {renderSection()}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          actionText={toast.actionText}
          onAction={toast.onAction}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default AdminPanel;
