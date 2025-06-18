import React, { useState, useEffect } from 'react';
import { apiRequest } from "../../utils/apiRequest";
import { handleError } from "../../utils/handleError";
import '../assets/access.css';

const AccessManager = ({ setToast }) => {
  const [groups, setGroups] = useState([]);
  const [modules, setModules] = useState([]);
  const [accessTo, setAccessTo] = useState('group');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [iin, setIin] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [role, setRole] = useState('student');
  const [canAddLessons, setCanAddLessons] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [moduleSearch, setModuleSearch] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;
  const session = JSON.parse(localStorage.getItem('session'));
  const token = session?.access_token;

  useEffect(() => {
    if (!token) {
      setToast({ message: "Ошибка: вы не авторизованы", type: "error" });
      return;
    }

    (async () => {
      try {
        const [groupData, moduleData] = await Promise.all([
          apiRequest(`${API_URL}/admin/groups`, { token }),
          apiRequest(`${API_URL}/admin/modules/with-teachers`, { token }),
        ]);
        setGroups(groupData);
        setModules(moduleData);
      } catch (err) {
        handleError(err, setToast);
      }
    })();
  }, [API_URL, token, setToast]);

  const handleToggleSubject = (subjectId) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const refreshModules = async () => {
    try {
      const moduleData = await apiRequest(`${API_URL}/admin/modules/with-teachers`, { token });
      setModules(moduleData);
    } catch (err) {
      handleError(err, setToast);
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedModule || (accessTo === 'teacher' && !iin.trim())) {
      setToast({
        message: 'Пожалуйста, выберите модуль и введите ИИН преподавателя',
        type: 'error',
      });
      return;
    }

    const endpoint =
      accessTo === 'group'
        ? `${API_URL}/access/admin/group-to-module`
        : `${API_URL}/access/admin/teacher-to-subject`;

    const body = {
      module_id: selectedModule?.id,
      subject_id: selectedSubjects[0] || null,
      role,
      can_add_lessons: role === 'teacher' ? canAddLessons : false,
    };

    if (accessTo === 'group') body.group_id = selectedGroup?.id;
    else body.teacher_iin = iin.trim();

    try {
      await apiRequest(endpoint, {
        method: 'POST',
        data: body,
        token,
      });

      setToast({ message: 'Доступ успешно предоставлен', type: 'success' });

      await refreshModules();
      setSelectedSubjects([]);
      setCanAddLessons(false);
      setIin('');
      setSelectedGroup(null);
      setSelectedModule(null);
      setAccessTo('group');
      setRole('student');
    } catch (err) {
      handleError(err, setToast);
    }
  };

  return (
    <div className="access-manager groups-manager-container fade-in">
      <h2 className="title">Управление доступом</h2>

      <section className="access-type">
        <label>
          <input
            type="radio"
            name="accessTo"
            value="group"
            checked={accessTo === 'group'}
            onChange={() => setAccessTo('group')}
          />
          <span className="radio-label-text">Выдать доступ группе</span>
        </label>
        <label>
          <input
            type="radio"
            name="accessTo"
            value="teacher"
            checked={accessTo === 'teacher'}
            onChange={() => setAccessTo('teacher')}
          />
          <span className="radio-label-text">Выдать доступ преподавателю</span>
        </label>
      </section>

      {accessTo === 'group' && (
        <section className="groups-section">
          <h3>Группы</h3>
          <input
            className="input-text"
            placeholder="Поиск по группам..."
            value={groupSearch}
            onChange={(e) => setGroupSearch(e.target.value)}
          />
          <div className="scrollable-list">
            <ul className="list selectable-list">
              {groups
                .filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase()))
                .map(group => (
                  <li
                    key={group.id}
                    className={`list-item ${selectedGroup?.id === group.id ? 'selected' : ''}`}
                    onClick={() => setSelectedGroup(group)}
                  >
                    {group.name}
                  </li>
                ))}
            </ul>
          </div>
        </section>
      )}

      {accessTo === 'teacher' && (
        <section className="iin-section">
          <label>
            ИИН преподавателя:
            <input
              type="text"
              value={iin}
              onChange={(e) => setIin(e.target.value)}
              maxLength={12}
              placeholder="Введите ИИН"
              className="input-text"
            />
          </label>
        </section>
      )}

      <section className="modules-section">
        <h3>Модули</h3>
        <input
          className="input-text"
          placeholder="Поиск по модулям..."
          value={moduleSearch}
          onChange={(e) => setModuleSearch(e.target.value)}
        />
        <div className="scrollable-list">
          <ul className="list selectable-list">
            {modules
              .filter(mod =>
                `${mod.title} ${mod.course}`.toLowerCase().includes(moduleSearch.toLowerCase())
              )
              .map((mod) => (
                <li
                  key={mod.id}
                  className={`list-item ${selectedModule?.id === mod.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedModule(mod);
                    setSelectedSubjects([]);
                  }}
                >
                  {mod.title} — {mod.course} курс
                </li>
              ))}
          </ul>
        </div>
      </section>

      {selectedModule && (
        <section className="subjects-section">
          <h3>Предметы модуля: {selectedModule.title}</h3>
          <p className="info-text">
            Выберите предметы для доступа (оставьте пустым для доступа ко всему модулю)
          </p>
          <ul className="list checkbox-list">
            {selectedModule.subjects?.map((subj) => (
              <li key={subj.id} className="checkbox-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subj.id)}
                    onChange={() => handleToggleSubject(subj.id)}
                  />
                  {subj.title}
                  {subj.teacher && (
                    <span className="assigned-label">
                      — Назначен: {subj.teacher.full_name || subj.teacher.iin}
                    </span>
                  )}
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="role-section">
        <h3>Роль доступа</h3>
        <label>
          <input
            type="radio"
            name="role"
            value="student"
            checked={role === 'student'}
            onChange={() => setRole('student')}
          />
          <span className="radio-label-text">Студент</span>
        </label>
        <label>
          <input
            type="radio"
            name="role"
            value="teacher"
            checked={role === 'teacher'}
            onChange={() => setRole('teacher')}
          />
          <span className="radio-label-text">Преподаватель</span>
        </label>

        {role === 'teacher' && (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={canAddLessons}
              onChange={() => setCanAddLessons(!canAddLessons)}
            />
            <span className="radio-label-text">Может добавлять уроки</span>
          </label>
        )}
      </section>

      <button className="btn-submit" onClick={handleGrantAccess}>
        Выдать доступ
      </button>
    </div>
  );
};

export default AccessManager;
