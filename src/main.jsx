import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import QuestText from './QuestText.jsx'
import ReadableViewer from './ReadableViewer.jsx'
import './index.css'
import { HashRouter, Route, Routes } from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter basename="/DialogText">
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/quest/:id" element={<QuestText />} />
      <Route path="/readable/:lang/:filename" element={<ReadableViewer />} />
    </Routes>
  </HashRouter>
)
