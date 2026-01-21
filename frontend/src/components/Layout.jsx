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

            <Box sx={{ bgcolor: '#f5f5f5', py: 2, mb: 2 }}>
                <Container maxWidth="lg" sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {/* Global Context Controls */}
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Hafta</InputLabel>
                        <Select
                            value={currentWeek}
                            label="Hafta"
                            onChange={(e) => setCurrentWeek(e.target.value)}
                        >
                            {/* Simplified: allow manual entry or generate list */}
                            <MenuItem value="2026-W01">2026-W01</MenuItem>
                            <MenuItem value="2026-W02">2026-W02</MenuItem>
                            <MenuItem value="2026-W03">2026-W03</MenuItem>
                            <MenuItem value="2026-W04">2026-W04</MenuItem>
                            <MenuItem value="2026-W05">2026-W05</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Personel (Giriş Yapan)</InputLabel>
                        <Select
                            value={currentUser ? currentUser.id : ''}
                            label="Personel (Giriş Yapan)"
                            onChange={(e) => {
                                const user = userList.find(u => u.id === e.target.value);
                                setCurrentUser(user);
                            }}
                        >
                            <MenuItem value=""><em>Seçiniz</em></MenuItem>
                            {userList.map(u => (
                                <MenuItem key={u.id} value={u.id}>{u.full_name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {children}
            </Container>
        </>
    );
};

export default Layout;
