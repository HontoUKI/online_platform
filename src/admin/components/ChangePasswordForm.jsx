import { useState } from "react";
import { apiRequest } from "../../utils/apiRequest";
import { handleError } from "../../utils/handleError";
import "../assets/style.css";

function ChangePasswordForm() {
  const [userIin, setUserIin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const session = JSON.parse(localStorage.getItem("session"));
  const token = session?.access_token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Ошибка: вы не авторизованы");
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

      setMessage("Пароль успешно обновлён");
      setUserIin("");
      setNewPassword("");
    } catch (err) {
      handleError(err, setMessage);
    }
  };

  return (
    <div className="groups-manager-container fade-in">
      <h2>Сброс пароля пользователя</h2>

      <form
        onSubmit={handleSubmit}
        className="user-add-container"
        style={{ flexDirection: "column", gap: "1rem" }}
      >
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
        <button type="submit" className="hero-btn">Сбросить пароль</button>
        {message && (
          <p className="status-message" style={{ marginTop: "0.5rem" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default ChangePasswordForm;
