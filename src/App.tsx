import SnackBarContextProvider from "./components/snack-bar/snack-bar-context-provider";
import { LoginPage } from "./pages/login-page/login-page";

function App() {
  return (
    <SnackBarContextProvider>
      <LoginPage />
    </SnackBarContextProvider>
  );
}

export default App;
