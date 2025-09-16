import React from "react"
import ReactDOM from "react-dom/client"
import { AIContentPlugin } from "./components/AIContentPlugin"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AIContentPlugin />
  </React.StrictMode>,
)
