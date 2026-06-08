import { Router, Route } from "@solidjs/router";
import { lazy } from "solid-js";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const InventoryList = lazy(() => import("./pages/InventoryList"));
const ProductCreate = lazy(() => import("./pages/ProductCreate"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Movements = lazy(() => import("./pages/Movements"));
const Settings = lazy(() => import("./pages/Settings"));

function App() {
  return (
    <Router>
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/inventory" component={InventoryList} />
      <Route path="/inventory/new" component={ProductCreate} />
      <Route path="/inventory/:id" component={ProductDetail} />
      <Route path="/movements" component={Movements} />
      <Route path="/settings" component={Settings} />
      <Route path="/" component={Dashboard} />
    </Router>
  );
}

export default App;
