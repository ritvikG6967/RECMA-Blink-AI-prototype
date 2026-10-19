import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import FaceUnlock from "./Components/FaceUnlock";

function App() {
  const [count, setCount] = useState(0)

  return (
  
  <div>
      <h1>RECMA-AI Face Unlock Prototype</h1>
      <FaceUnlock />
      <WebCam
    </div>
  );
  
  };
    


export default App;
