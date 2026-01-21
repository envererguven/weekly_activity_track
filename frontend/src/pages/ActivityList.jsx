import React, { useEffect, useState } from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, Pagination, Box, Chip, Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../api';
import { useApp } from '../context/AppContext';

const ActivityList = () => {
    const { currentWeek } = useApp();
    const [activities, setActivities] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({
        user: '',
        product: '',
        week: ''
    });

    // Helper to get current week YYYY-WXX
    const getCurrentWeek = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
        const week1 = new Date(d.getFullYear(), 0, 4);
        const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
        return `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        // Load filter options and set default week
        const initialize = async () => {
            try {
                const [userRes, prodRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/products')
                ]);
                setUsers(userRes.data);
                setProducts(prodRes.data);

                // Smart Week Logic
                const currentWeek = getCurrentWeek();

                // Check if current week has data
                const checkRes = await api.get('/activities', { params: { week: currentWeek, limit: 1 } });

                if (checkRes.data.data.length > 0) {
                    setFilters(prev => ({ ...prev, week: currentWeek }));
                } else {
                    // Fallback to latest week
                    const latestRes = await api.get('/activities/latest-week');
                    if (latestRes.data.week) {
                        setFilters(prev => ({ ...prev, week: latestRes.data.week }));
                    } else {
                        setFilters(prev => ({ ...prev, week: currentWeek })); // Default if DB empty
                    }
                }

            } catch (err) { console.error(err); }
        };
        initialize();
    }, []);

    // Debounce Hook (Inner helper)
    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            return () => clearTimeout(handler);
        }, [value, delay]);
        return debouncedValue;
    };

    const debouncedWeek = useDebounce(filters.week, 500); // 500ms debounce

    const [sortConfig, setSortConfig] = useState({ key: 'updated_at', direction: 'desc' });

    const fetchActivities = async () => {
        try {
            const params = {
                page,
                limit: 10,
                ...(debouncedWeek && { week: debouncedWeek }), // Use debounced value
                ...(filters.user && { userId: filters.user }),
                ...(filters.product && { productId: filters.product }),
                sort: sortConfig.key,
                order: sortConfig.direction
            };
            const res = await api.get('/activities', { params });
            setActivities(res.data.data);
            setTotalPages(Math.ceil(res.data.meta.total / 10));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [page, debouncedWeek, filters.user, filters.product, sortConfig]); // Depend on debouncedWeek

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        if (e.target.name !== 'week') {
            setPage(1);
        } else {
            setPage(1);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <React.Fragment>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, mb: 2 }}>
                <Typography variant="h5">Aktivite Listesi</Typography>
                <Button
                    variant="contained"
                    component={Link}
                    to="/new"
                    state={{ user: filters.user }} // Pass selected user filter
                >
                    Yeni Aktivite
                </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <select
                    name="user"
                    value={filters.user}
                    onChange={handleFilterChange}
                    style={{ padding: '8px', borderRadius: '4px' }}
                >
                    <option value="">Tüm Kişiler</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                </select>

                <select
                    name="product"
                    value={filters.product}
                    onChange={handleFilterChange}
                    style={{ padding: '8px', borderRadius: '4px' }}
                >
                    <option value="">Tüm Ürünler</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>

                <input
                    type="text"
                    name="week"
                    placeholder="Hafta (Örn: 2026-W04)"
                    value={filters.week}
                    onChange={handleFilterChange}
                    style={{ padding: '8px', borderRadius: '4px' }}
                />
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#eee' }}>
                            <TableCell onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>ID</TableCell>
                            <TableCell onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>Kategori</TableCell>
                            <TableCell onClick={() => handleSort('subject')} style={{ cursor: 'pointer' }}>Konu</TableCell>
                            <TableCell onClick={() => handleSort('product')} style={{ cursor: 'pointer' }}>Ürün</TableCell>
                            <TableCell onClick={() => handleSort('user')} style={{ cursor: 'pointer' }}>Sorumlu</TableCell>
                            <TableCell onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Statü</TableCell>
                            <TableCell onClick={() => handleSort('criticality')} style={{ cursor: 'pointer' }}>Kritiklik</TableCell>
                            <TableCell onClick={() => handleSort('effort')} style={{ cursor: 'pointer' }}>Efor</TableCell>
                            <TableCell>Haftalık Durum</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {activities.map((row) => {
                            const weekly = row.weekly_data && row.weekly_data[filters.week];
                            const progressText = weekly ? weekly.progress : '-';
                            const effortText = weekly ? weekly.effort : '0';

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
                                    <TableCell>{effortText}</TableCell>
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
