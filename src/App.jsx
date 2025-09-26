import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import ConsumerPage from './pages/ConsumerPage'
import OwnerPage from './pages/OwnerPage'
import DefectiveItemsPage from './pages/DefectiveItemsPage';

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<HomePage/>} />
      <Route path="/auth" element={<AuthPage/>} />
      <Route path="/consumer" element={<ConsumerPage/>} />
      <Route path="/owner" element={<OwnerPage/>} />
      <Route path="/defective-items" element={<DefectiveItemsPage/>} />
    </Routes>
  )
}
