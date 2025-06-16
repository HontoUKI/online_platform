import { useState } from "react";
import { apiRequest } from "../../utils/apiRequest";
import { handleError } from "../../utils/handleError";
import "../assets/style.css";

function UserForm() {
  const [formData, setFormData] = useState({
    iin: "",
    full_name: "",
    role: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const session = JSON.parse(localStorage.getItem("session"));
  const token = session?.access_token;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Ошибка: вы не авторизованы");
      return;
    }

    try {
      const data = await apiRequest(`${API_URL}/admin/users/`, {
        method: "POST",
        data: formData,
        token,
      });

      setMessage("Пользователь успешно добавлен");
      setFormData({
        iin: "",
        full_name: "",
        role: "",
        phone: "",
        password: "",
      });
    } catch (error) {
      handleError(error, setMessage);
    }
  };

  return (
    <div className="groups-manager-container fade-in">
      <h2>Добавление пользователя</h2>

      <form
        onSubmit={handleSubmit}
        className="user-add-container"
        style={{ flexDirection: "column", gap: "1rem" }}
      >
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
        {message && (
          <p className="status-message" style={{ marginTop: "0.5rem" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default UserForm;
