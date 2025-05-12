import { Provider } from "react-redux";
import store from "./store";
import ProfileCalendar from "./components/ProfileCalendar";
import "./App.css";

function App() {
  return (
    <Provider store={store()}>
      <div className="app-container">
        <header className="app-header">
          <h1>Smart Maple | Çalışan Takvimi</h1>
        </header>
        <main>
          <ProfileCalendar />
        </main>
        <footer className="app-footer">
          <p>© {new Date().getFullYear()} Smart Maple Calendar</p>
        </footer>
      </div>
    </Provider>
  );
}

export default App;
