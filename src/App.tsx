import React from 'react'
import { Link, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import './index.css'
import CustomerList from './pages/CustomerList'
import TrainingList from './pages/TrainingList'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <div id="app-root">
      <header>
        <h1>Personal Trainer - Admin</h1>
        <nav style={{ marginBottom: 16 }}>
          <Link to="/customers" style={{ marginRight: 12 }}>Customers</Link>
          <Link to="/trainings">Trainings</Link>
        </nav>
      </header>

      <main>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/customers" replace />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/trainings" element={<TrainingList />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  )
}

export default App
