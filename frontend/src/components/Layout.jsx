import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Layout = ({ children }) => {
    const { currentWeek, setCurrentWeek, currentUser, setCurrentUser, userList } = useApp();

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Haftalık Rapor
                    </Typography>

                    <Button color="inherit" component={Link} to="/">List</Button>
                    <Button color="inherit" component={Link} to="/new">New Activity</Button>
                    <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
                    <Button color="inherit" component={Link} to="/admin">Admin</Button>
                </Toolbar>
            </AppBar>

            {/* 
            <Box sx={{ bgcolor: '#f5f5f5', py: 2, mb: 2 }}>
                <Container maxWidth="lg" sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                     Global Context Controls Removed as per request (Moved to ActivityList) 
                </Container>
            </Box> 
            */}

            <Container maxWidth="lg">
                {children}
            </Container>
        </>
    );
};

export default Layout;
