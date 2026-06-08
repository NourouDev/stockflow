import { createStore } from "solid-js/store";
import { User } from "firebase/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
}

const [authStore, setAuthStore] = createStore<AuthState>({
  user: null,
  loading: true,
});

export { authStore, setAuthStore };
