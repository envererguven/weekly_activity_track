import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AppProvider } from './context/AppContext';
import ActivityList from './pages/ActivityList';
import ActivityForm from './pages/ActivityForm';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<ActivityList />} />
                        <Route path="/new" element={<ActivityForm />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/admin" element={<Admin />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </AppProvider>
    );
}

export default App;
