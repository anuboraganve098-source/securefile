import { useEffect, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Encrypt from './pages/Encrypt.jsx';
import Decrypt from './pages/Decrypt.jsx';
import Security from './pages/Security.jsx';

const ROUTES = { '/': Home, '/encrypt': Encrypt, '/decrypt': Decrypt, '/security': Security };
const current = () => { const p = window.location.hash.replace(/^#/, '') || '/'; return ROUTES[p] ? p : '/'; };

export default function App() {
  const [route, setRoute] = useState(current);
  useEffect(() => {
    const onHash = () => { setRoute(current()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const Page = ROUTES[route];
  return (<><a className="skip" href="#main">Skip to content</a><Navbar route={route} /><div id="main"><Page /></div></>);
}
