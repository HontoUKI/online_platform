import React, { useState, useEffect, useRef } from "react";
import { apiRequest } from "../../utils/apiRequest";
import { handleError } from "../../utils/handleError";
import "../../assets/style.css";
import "../assets/group_style.css";

const GroupsManager = () => {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupUsers, setGroupUsers] = useState([]);
  const [userIinToAdd, setUserIinToAdd] = useState("");
  const [excelFile, setExcelFile] = useState(null);

  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const session = JSON.parse(localStorage.getItem("session"));
  const token = session?.access_token;

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await apiRequest(`${API_URL}/admin/groups`, { token });
      setGroups(data);
    } catch (err) {
      handleError(err, alert);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return alert("Введите название группы");
    try {
      const data = await apiRequest(`${API_URL}/admin/groups`, {
        method: "POST",
        data: { name: newGroupName, description: newGroupDescription },
        token,
      });
      setGroups((prev) => [...prev, data]);
      setNewGroupName("");
      setNewGroupDescription("");
      alert("Группа успешно создана");
    } catch (err) {
      handleError(err, alert);
    }
  };

  const fetchGroupUsers = async (groupId) => {
    try {
      const data = await apiRequest(`${API_URL}/admin/groups/${groupId}/users`, { token });
      setGroupUsers(data);
      setSelectedGroupId(groupId);
    } catch (err) {
      handleError(err, alert);
    }
  };

  const addUserToGroup = async () => {
    if (!userIinToAdd.trim()) return alert("Введите ИИН пользователя");
    try {
      const user = await apiRequest(`${API_URL}/user/by-iin/${userIinToAdd}`, { token });

      if (groupUsers.some((u) => u.id === user.id)) {
        alert("Пользователь уже в группе");
        return;
      }

      await apiRequest(`${API_URL}/admin/groups/${selectedGroupId}/users`, {
        method: "POST",
        data: [user.id],
        token,
      });

      setGroupUsers((prev) => [...prev, user]);
      setUserIinToAdd("");
      alert("Пользователь добавлен в группу");
    } catch (err) {
      handleError(err, alert);
    }
  };

  const removeUserFromGroup = async (userId) => {
    try {
      await apiRequest(`${API_URL}/admin/groups/${selectedGroupId}/users/${userId}`, {
        method: "DELETE",
        token,
        silent: true,
      });
      setGroupUsers((prev) => prev.filter((u) => u.id !== userId));
      alert("Пользователь удалён из группы");
    } catch (err) {
      handleError(err, alert);
    }
  };

  const deleteGroupOnly = async (groupId) => {
    if (!window.confirm("Удалить только группу без удаления пользователей?")) return;
    try {
      await apiRequest(`${API_URL}/admin/groups/${groupId}`, {
        method: "DELETE",
        token,
      });
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (selectedGroupId === groupId) {
        setSelectedGroupId(null);
        setGroupUsers([]);
      }
      alert("Группа удалена");
    } catch (err) {
      handleError(err, alert);
    }
  };

  const deleteGroupWithUsers = async (groupId) => {
    if (!window.confirm("Удалить группу вместе с пользователями? Это необратимо.")) return;
    try {
      await apiRequest(`${API_URL}/admin/groups/${groupId}/with-users`, {
        method: "DELETE",
        token,
      });
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (selectedGroupId === groupId) {
        setSelectedGroupId(null);
        setGroupUsers([]);
      }
      alert("Группа и пользователи удалены");
    } catch (err) {
      handleError(err, alert);
    }
  };

  const handleExcelUpload = async () => {
    if (!excelFile) return alert("Выберите Excel-файл");
    const formData = new FormData();
    formData.append("file", excelFile);

    try {
      const res = await fetch(`${API_URL}/admin/groups/upload-excel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      alert("Группа и пользователи успешно загружены");
      fileInputRef.current.value = null;
      setExcelFile(null);
      fetchGroups();
    } catch (err) {
      handleError(err, alert);
    }
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="groups-manager-container fade-in">
      <h2>Управление группами</h2>

      <div className="group-actions">
        <input
          className="input"
          type="text"
          placeholder="Поиск по названию..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="file"
          accept=".xlsx"
          ref={fileInputRef}
          onChange={(e) => setExcelFile(e.target.files[0])}
        />
        <button className="hero-btn" onClick={handleExcelUpload}>
          Загрузить из Excel
        </button>
      </div>

      <div className="groups-manager-create-group">
        <input
          className="input"
          placeholder="Название группы"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
        <input
          className="input"
          placeholder="Описание (необязательно)"
          value={newGroupDescription}
          onChange={(e) => setNewGroupDescription(e.target.value)}
        />
        <button className="hero-btn" onClick={createGroup}>
          Создать группу
        </button>
      </div>

      <div className="group-cards fade-in">
        {filteredGroups.map((group) => (
          <div key={group.id} className="group-card">
            <div className="group-card-header">
              <h4>{group.name}</h4>
              <p className="group-description">
                {group.description || "Без описания"}
              </p>
              <div className="group-card-buttons">
                <button
                  className="hero-btn"
                  onClick={() =>
                    selectedGroupId === group.id
                      ? setSelectedGroupId(null)
                      : fetchGroupUsers(group.id)
                  }
                >
                  {selectedGroupId === group.id ? "Закрыть" : "Открыть"}
                </button>
                <button className="hero-btn danger" onClick={() => deleteGroupOnly(group.id)}>
                  Удалить группу
                </button>
                <button className="hero-btn danger" onClick={() => deleteGroupWithUsers(group.id)}>
                  Удалить с пользователями
                </button>
              </div>
            </div>

            {selectedGroupId === group.id && (
              <>
                <div className="user-add-container" style={{ marginTop: "1rem" }}>
                  <input
                    className="input"
                    placeholder="ИИН пользователя"
                    value={userIinToAdd}
                    onChange={(e) => setUserIinToAdd(e.target.value)}
                    maxLength={12}
                  />
                  <button className="hero-btn" onClick={addUserToGroup}>
                    Добавить пользователя
                  </button>
                </div>

                {groupUsers.length === 0 ? (
                  <p className="no-users-text" style={{ marginTop: "1rem" }}>
                    Нет пользователей в группе
                  </p>
                ) : (
                  <div className="table-wrapper">
                    <table className="table" style={{ marginTop: "1rem" }}>
                      <thead>
                        <tr>
                          <th>ФИО</th>
                          <th>ИИН</th>
                          <th>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupUsers.map((user) => (
                          <tr key={user.id}>
                            <td>{user.full_name}</td>
                            <td>{user.iin}</td>
                            <td>
                              <button
                                onClick={() => removeUserFromGroup(user.id)}
                                className="hero-btn danger"
                              >
                                Удалить
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupsManager;