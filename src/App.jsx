import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import Toast from './components/Toast';

const App = () => {
  const [toast, setToast] = useState(null);

  return (
    <Router>
      <AppRoutes setToast={setToast} />
      <Toast
        message={toast?.message}
        type={toast?.type}
        actionText={toast?.actionText}
        onAction={toast?.onAction}
        onClose={() => setToast(null)}
      />
    </Router>
  );
};

export default App;
