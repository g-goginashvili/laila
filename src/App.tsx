import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SnackBarContextProvider from "./components/snack-bar/snack-bar-context-provider";
import { customRouter } from "./router/router";
import AuthListener from "./utility/auth-listener";
import { RouterProvider } from "react-router";

const queryClient = new QueryClient()

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthListener>
				<SnackBarContextProvider>
					<RouterProvider router={customRouter} />
				</SnackBarContextProvider>
			</AuthListener>
		</QueryClientProvider>
	);
}

export default App;
