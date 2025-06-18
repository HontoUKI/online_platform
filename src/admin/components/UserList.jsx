import { useEffect, useState } from "react";
import { apiRequest } from "../../utils/apiRequest";
import { handleError } from "../../utils/handleError";
import "../assets/userlist.css";

function UserList({ setToast }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const API_URL = import.meta.env.VITE_API_URL;
  const session = JSON.parse(localStorage.getItem("session"));
  const token = session?.access_token;

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const data = await apiRequest(`${API_URL}/admin/users`, { token });
        setUsers(data);
      } catch (err) {
        handleError(err, setToast);
      }
    })();
  }, []);

  const requestUserDelete = (iin) => {
    setToast({
      message: `Удалить пользователя ${iin} со всеми данными?`,
      type: "error",
      actionText: "Удалить",
      onAction: () => handleDeleteUser(iin),
    });
  };

  const handleDeleteUser = async (iin) => {
    try {
      await apiRequest(`${API_URL}/admin/users/${iin}`, {
        method: "DELETE",
        token,
      });
      setUsers((prev) => prev.filter((u) => u.iin !== iin));
      setToast({
        message: `Пользователь ${iin} удалён`,
        type: "success",
      });
    } catch (err) {
      handleError(err, setToast);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = `${u.full_name} ${u.iin}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="userlist-wrapper fade-in">
      <h2 className="userlist-title">Список пользователей</h2>
      <div className="userlist-filters">
        <input
          type="text"
          placeholder="Поиск по ФИО или ИИН..."
          className="userlist-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="userlist-input"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Все роли</option>
          <option value="admin">Администраторы</option>
          <option value="teacher">Преподаватели</option>
          <option value="student">Студенты</option>
        </select>
      </div>

      <div className="userlist-table-wrapper">
        <table className="userlist-table">
          <thead>
            <tr>
              <th>ИИН</th>
              <th>ФИО</th>
              <th>Роль</th>
              <th>Телефон</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.iin}>
                <td>{u.iin}</td>
                <td>{u.full_name}</td>
                <td>{u.role}</td>
                <td>{u.phone || "—"}</td>
                <td>
                  {u.role !== "admin" ? (
                    <button
                      onClick={() => requestUserDelete(u.iin)}
                      className="userlist-delete-btn"
                    >
                      Удалить
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserList;
