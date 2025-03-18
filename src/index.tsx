import ReactDOM, {Root} from "react-dom/client";
import React from "react";
import App from "./components/App";
import "bootstrap/dist/css/bootstrap.css";

const root: Root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <App/>
);