
import axios from 'axios';
import { UserContextProvider } from './UserContext';
import Routes from './Routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  axios.defaults.baseURL='http://localhost:4040';
  axios.defaults.withCredentials=true;

  return (
    <div className=''>
    <UserContextProvider>
      <Routes/>
      <ToastContainer />
    </UserContextProvider>
    </div>
    
  );
}

export default App;