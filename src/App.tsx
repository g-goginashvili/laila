import SnackBarContextProvider from "./components/snack-bar/snack-bar-context-provider";
import { AuthorizationPage } from "./pages/login-page/login-page";

function App() {
  return (
    <SnackBarContextProvider>
      <AuthorizationPage />
    </SnackBarContextProvider>
  );
}

export default App;
