import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ForwardMessageProvider } from "./context/ForwardingMessage/ForwardingMessageContext";

import App from "./App";

ReactDOM.render(
	<ForwardMessageProvider>
        <CssBaseline>
            <App />
	    </CssBaseline>,
    </ForwardMessageProvider>,
	document.getElementById("root")
);

// ReactDOM.render(
// 	<React.StrictMode>
// 		<CssBaseline>
// 			<App />
// 		</CssBaseline>,
//   </React.StrictMode>

// 	document.getElementById("root")
// );
