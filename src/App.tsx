import { BrowserRouter } from 'react-router-dom';
import Router from './router/Router';

function App() {
  return (
    <BrowserRouter basename="/cinema">   
      <Router />
    </BrowserRouter>
  );
}

export default App;