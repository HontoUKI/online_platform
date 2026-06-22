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
      <h1 className="fade-in u-delay-1">Новую специальность</h1>
      <h3 className="fade-in u-delay-2">Дистанционно с нами</h3>
      <button className="fade-in hero-btn u-delay-3" onClick={openModal}>
        Войти
      </button>

      {isModalOpen && <LoginModal onClose={closeModal} />}
    </section>
  );
};

export default Hero;
