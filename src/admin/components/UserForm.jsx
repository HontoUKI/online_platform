import { useState } from "react";
import { apiRequest } from "../../utils/apiRequest";
import { handleError } from "../../utils/handleError";
import { getToken } from "../../utils/session";
import "../assets/style.css";

function UserForm({ setToast }) {
  const [formData, setFormData] = useState({
    iin: "",
    full_name: "",
    role: "",
    phone: "",
    password: "",
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const token = getToken();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setToast({ message: "Ошибка: вы не авторизованы", type: "error" });
      return;
    }

    try {
      await apiRequest(`${API_URL}/admin/users/`, {
        method: "POST",
        data: formData,
        token,
      });

      setToast({ message: "Пользователь успешно добавлен", type: "success" });

      setFormData({
        iin: "",
        full_name: "",
        role: "",
        phone: "",
        password: "",
      });
    } catch (error) {
      handleError(error, setToast);
    }
  };

  return (
    <div className="groups-manager-container fade-in">
      <h2>Добавление пользователя</h2>

      <form onSubmit={handleSubmit} className="u-col">
        <input
          className="input"
          name="iin"
          placeholder="ИИН"
          maxLength="12"
          value={formData.iin}
          onChange={handleChange}
          required
        />
        <input
          className="input"
          name="full_name"
          placeholder="ФИО"
          value={formData.full_name}
          onChange={handleChange}
          required
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="input"
          required
        >
          <option value="">Выберите роль</option>
          <option value="student">Студент</option>
          <option value="teacher">Преподаватель</option>
          <option value="admin">Администратор</option>
        </select>
        <input
          className="input"
          name="phone"
          placeholder="Телефон"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          className="input"
          type="password"
          name="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="hero-btn">
          Зарегистрировать
        </button>
      </form>
    </div>
  );
}

export default UserForm;
