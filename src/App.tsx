import SnackBarContextProvider from "./components/snack-bar/snack-bar-context-provider";
import { customRouter } from "./router/router";
import AuthListener from "./utility/auth-listener";
import { RouterProvider } from "react-router";


function App() {
	return (
		<AuthListener>
			<SnackBarContextProvider>
				<RouterProvider router={customRouter} />
			</SnackBarContextProvider>
		</AuthListener>
	);
}

export default App;
