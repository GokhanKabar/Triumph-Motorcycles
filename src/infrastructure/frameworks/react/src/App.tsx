import { ToastContainer } from 'react-toastify';
import AppRouter from './router/AppRouter';
import './App.css';

function App() {
  return (
    <>
      <AppRouter />
      <ToastContainer />
    </>
  );
}

export default App;
