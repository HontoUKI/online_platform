import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/apiRequest';
import { handleError } from '../../utils/handleError';
import '../../assets/style.css';
import '../assets/modules.css';

const ModulesManager = () => {
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');
  const [newModuleCourse, setNewModuleCourse] = useState('');
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [message, setMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;
  const session = JSON.parse(localStorage.getItem('session'));
  const token = session?.access_token;

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const data = await apiRequest(`${API_URL}/admin/modules`, { token });
      setModules(data);
    } catch (err) {
      handleError(err);
      setMessage('Ошибка загрузки модулей');
    }
  };

  const createModule = async () => {
    if (!newModuleTitle.trim() || !newModuleCourse.trim()) return alert('Введите все поля');

    try {
      await apiRequest(`${API_URL}/admin/modules`, {
        method: 'POST',
        data: {
          title: newModuleTitle,
          description: newModuleDescription,
          course: newModuleCourse,
        },
        token,
      });
      setNewModuleTitle('');
      setNewModuleDescription('');
      setNewModuleCourse('');
      setSelectedModuleId(null);
      setSelectedSubjects([]);
      fetchModules();
    } catch (err) {
      handleError(err);
    }
  };

  const deleteModule = async (id) => {
    const confirmed = window.confirm('Удалить модуль?');
    if (!confirmed) return;

    try {
      await apiRequest(`${API_URL}/admin/modules/${id}`, {
        method: 'DELETE',
        token,
        silent: true,
      });
      if (selectedModuleId === id) {
        setSelectedModuleId(null);
        setSelectedSubjects([]);
      }
      fetchModules();
    } catch (err) {
      handleError(err);
    }
  };

  const toggleModule = (mod) => {
    if (selectedModuleId === mod.id) {
      setSelectedModuleId(null);
      setSelectedSubjects([]);
    } else {
      setSelectedModuleId(mod.id);
      setSelectedSubjects(mod.subjects || []);
    }
  };

  const addSubject = async () => {
    if (!newSubjectTitle.trim()) return;

    try {
      await apiRequest(`${API_URL}/admin/modules/${selectedModuleId}/subjects`, {
        method: 'POST',
        data: { title: newSubjectTitle },
        token,
      });
      setNewSubjectTitle('');
      await reloadSubjects();
    } catch (err) {
      handleError(err);
    }
  };

  const deleteSubject = async (subjectId) => {
    const confirmed = window.confirm('Удалить предмет?');
    if (!confirmed) return;

    try {
      await apiRequest(`${API_URL}/admin/modules/subjects/${subjectId}`, {
        method: 'DELETE',
        token,
      });
      await reloadSubjects();
    } catch (err) {
      handleError(err);
    }
  };

  const reloadSubjects = async () => {
    try {
      const updated = await apiRequest(`${API_URL}/admin/modules/${selectedModuleId}`, { token });
      setSelectedSubjects(updated.subjects || []);
    } catch (err) {
      handleError(err);
    }
  };

  const filteredModules = modules.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="groups-manager-container fade-in">
      <h2>Управление модулями</h2>

      <div className="group-actions">
        <input
          className="input"
          placeholder="Название модуля"
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
        />
        <input
          className="input"
          placeholder="Описание (необязательно)"
          value={newModuleDescription}
          onChange={(e) => setNewModuleDescription(e.target.value)}
        />
        <input
          className="input"
          placeholder="Курс"
          value={newModuleCourse}
          maxLength={1}
          onChange={(e) => setNewModuleCourse(e.target.value)}
        />
        <button className="hero-btn" onClick={createModule}>
          Создать модуль
        </button>
      </div>

      <div className="group-cards fade-in">
        {filteredModules.map((mod) => (
          <div key={mod.id} className="group-card">
            <div className="group-card-header">
              <h4 style={{ marginBottom: '0.4rem' }}>{mod.title}</h4>
              <p className="group-description">{mod.description || 'Без описания'}</p>
              <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.4rem' }}>
                Курс: {mod.course}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                <button className="hero-btn" onClick={() => toggleModule(mod)}>
                  {selectedModuleId === mod.id ? 'Закрыть' : 'Открыть'}
                </button>
                <button className="hero-btn danger" onClick={() => deleteModule(mod.id)}>
                  Удалить
                </button>
              </div>
            </div>

            {selectedModuleId === mod.id && (
              <>
                <div className="user-add-container" style={{ marginTop: '1rem' }}>
                  <input
                    className="input"
                    placeholder="Новый предмет"
                    value={newSubjectTitle}
                    onChange={(e) => setNewSubjectTitle(e.target.value)}
                  />
                  <button className="hero-btn" onClick={addSubject}>
                    Добавить предмет
                  </button>
                </div>

                {selectedSubjects.length === 0 ? (
                  <p className="no-users-text" style={{ marginTop: '1rem' }}>
                    В модуле пока нет предметов
                  </p>
                ) : (
                  <div className="table-wrapper">
                    <table className="table" style={{ marginTop: '1rem' }}>
                      <thead>
                        <tr>
                          <th>Название</th>
                          <th>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSubjects.map((subject) => (
                          <tr key={subject.id}>
                            <td>{subject.title}</td>
                            <td>
                              <button
                                className="hero-btn danger"
                                onClick={() => deleteSubject(subject.id)}
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

      {message && <p className="message" style={{ marginTop: '1.5rem' }}>{message}</p>}
    </div>
  );
};

export default ModulesManager;
