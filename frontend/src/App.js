import './App.css';
import {Routes, Route} from 'react-router-dom'

// pages
import Home from './pages/home/Home';
import SignIn from './pages/signin/SignIn';
import Signup from './pages/signup/Signup';
import NotFound from './pages/not-found/NotFound';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path="/sign-in" element={<SignIn/>}/>
        <Route path="/sign-up" element={<Signup/>}/>
        <Route path='*' element={<NotFound/>}/>
      </Routes>
    </div>
  );
}

export default App;
