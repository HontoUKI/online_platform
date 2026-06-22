import { useState } from "react";
import { apiRequest } from "../../utils/apiRequest";
import { handleError } from "../../utils/handleError";
import { getToken } from "../../utils/session";
import "../assets/style.css";

function ChangePasswordForm({ setToast }) {
  const [userIin, setUserIin] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const token = getToken();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setToast({ message: "Ошибка: вы не авторизованы", type: "error" });
      return;
    }

    try {
      await apiRequest(`${API_URL}/admin/users/reset_password`, {
        method: "PATCH",
        data: {
          user_iin: userIin,
          new_password: newPassword,
        },
        token,
      });

      setToast({ message: "Пароль успешно обновлён", type: "success" });
      setUserIin("");
      setNewPassword("");
    } catch (err) {
      handleError(err, setToast);
    }
  };

  return (
    <div className="groups-manager-container fade-in">
      <h2>Сброс пароля пользователя</h2>

      <form onSubmit={handleSubmit} className="u-col">
        <input
          className="input"
          type="text"
          placeholder="ИИН пользователя"
          value={userIin}
          maxLength="12"
          onChange={(e) => setUserIin(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Новый пароль"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit" className="hero-btn">
          Сбросить пароль
        </button>
      </form>
    </div>
  );
}

export default ChangePasswordForm;
