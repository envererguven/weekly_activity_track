import React, { useEffect, useState } from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, Pagination, Box, Chip
} from '@mui/material';
import api from '../api';
import { useApp } from '../context/AppContext';

const ActivityList = () => {
    const { currentWeek } = useApp();
    const [activities, setActivities] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchActivities = async () => {
        try {
            const res = await api.get(`/activities?page=${page}&limit=10&week=${currentWeek}`);
            setActivities(res.data.data);
            setTotalPages(Math.ceil(res.data.meta.total / 10));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [page, currentWeek]);

    return (
        <React.Fragment>
            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Aktivite Listesi ({currentWeek})</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#eee' }}>
                            <TableCell>ID</TableCell>
                            <TableCell>Kategori</TableCell>
                            <TableCell>Konu</TableCell>
                            <TableCell>Ürün</TableCell>
                            <TableCell>Sorumlu</TableCell>
                            <TableCell>Statü</TableCell>
                            <TableCell>Kritiklik</TableCell>
                            <TableCell>Haftalık Durum</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {activities.map((row) => {
                            // Helper to extract weekly progress from JSONB
                            // Structure: { '2026-W04': { progress: '...', effort: 2 } }
                            const weekly = row.weekly_data && row.weekly_data[currentWeek];
                            const progressText = weekly ? weekly.progress : '-';

                            return (
                                <TableRow key={row.id}>
                                    <TableCell>{row.ref_id || row.id}</TableCell>
                                    <TableCell>{row.category}</TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2">{row.subject}</Typography>
                                        <Typography variant="caption" color="textSecondary">{row.description}</Typography>
                                    </TableCell>
                                    <TableCell>{row.product_name}</TableCell>
                                    <TableCell>{row.user_name}</TableCell>
                                    <TableCell><Chip label={row.status} size="small" /></TableCell>
                                    <TableCell>{row.criticality?.split('-')[0]}</TableCell>
                                    <TableCell>{progressText}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} />
            </Box>
        </React.Fragment>
    );
};

export default ActivityList;
