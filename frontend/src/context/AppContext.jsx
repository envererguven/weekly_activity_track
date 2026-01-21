import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // Current Week logic: "2026-W04"
    // Helper to get current ISO week
    const getCurrentWeek = () => {
        const now = new Date();
        // Simplified MVP logic (production needs robust library like date-fns)
        // format: YYYY-Www
        const year = now.getFullYear();
        // quick hack for week number
        const oneJan = new Date(year, 0, 1);
        const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
        const result = Math.ceil((now.getDay() + 1 + numberOfDays) / 7);
        return `${year}-W${result.toString().padStart(2, '0')}`;
    };

    const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());

    // User Selection
    const [currentUser, setCurrentUser] = useState(null); // { id, full_name }
    const [userList, setUserList] = useState([]);

    // Load Users on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/users');
                setUserList(res.data);
            } catch (err) {
                console.error("Failed to load users", err);
            }
        };
        fetchUsers();
    }, []);

    const value = {
        currentWeek,
        setCurrentWeek,
        currentUser,
        setCurrentUser,
        userList,
        refreshUsers: async () => {
            const res = await api.get('/users');
            setUserList(res.data);
        }
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
