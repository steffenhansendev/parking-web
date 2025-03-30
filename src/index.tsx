import ReactDOM, {Root} from "react-dom/client";
import React from "react";
import App from "./App";
import "bootstrap/dist/css/bootstrap.css";

import {DiProvider} from "./dependency-injection/DiProvider";

const root: Root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <DiProvider>
        <App/>
    </DiProvider>
);