import React, { useState } from 'react';
import LoginModal from '../components/LoginModal';
import '../assets/style.css';

const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <section className="hero full-center">
      <h2 className="fade-in">Изучи</h2>
      <h1 className="fade-in" style={{ animationDelay: '0.2s' }}>Новую специальность</h1>
      <h3 className="fade-in" style={{ animationDelay: '0.4s' }}>Дистанционно с нами</h3>
      <button className="fade-in hero-btn" style={{ animationDelay: '0.6s'}} onClick={openModal}>
        Войти
      </button>

      {isModalOpen && <LoginModal onClose={closeModal} />}
    </section>
  );
};

export default Hero;
