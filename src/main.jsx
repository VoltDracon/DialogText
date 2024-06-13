import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import QuestText from './QuestText.jsx'
import './index.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter basename='DialogText'>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/quest/:id" element={<QuestText />} />
    </Routes>
  </BrowserRouter>
)
