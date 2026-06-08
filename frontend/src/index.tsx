/* @refresh reload */
import { render } from "solid-js/web";
import { onCleanup } from "solid-js";
import "./index.css";
import App from "./App";
import { auth } from "./lib/firebase";
import { setAuthStore } from "./lib/auth-store";
import { onAuthStateChanged } from "firebase/auth";

const root = document.getElementById("root");

const unsubscribe = onAuthStateChanged(auth, (user) => {
  setAuthStore({ user, loading: false });
});

onCleanup(() => unsubscribe());

render(() => <App />, root!);
