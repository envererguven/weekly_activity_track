import React, { useEffect, useState } from 'react';
import {
    Paper, Typography, Grid, Card, CardContent, Box, Button, TextField, CircularProgress, Divider,
    FormControlLabel, Switch
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import api from '../api';
import { useApp } from '../context/AppContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
    // const { currentUser } = useApp(); // Removed dependency on auth layout
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scope, setScope] = useState('global'); // 'global' or 'personal'

    // User Selection for "Personal" View (Simulated Auth)
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');

    // LLM State
    const [llmUrl, setLlmUrl] = useState('http://host.docker.internal:11434/api/generate');
    const [llmModel, setLlmModel] = useState('llama3');
    const [summary, setSummary] = useState('');
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        // Load users for the dropdown
        api.get('/users').then(res => setUsers(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const params = {
                    scope,
                    userId: selectedUser // Pass selected user explicitly
                };
                const res = await api.get('/dashboard-stats', { params });
                setStats(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if global, or if personal AND user is selected
        if (scope === 'global' || (scope === 'personal' && selectedUser)) {
            fetchStats();
        } else if (scope === 'personal' && !selectedUser) {
            setLoading(false); // Stop loading if waiting for user selection
        }
    }, [scope, selectedUser]);

    const handleGenerateSummary = async () => {
        setGenerating(true);
        setSummary('');
        try {
            const res = await api.post('/stats/summary', { llmUrl, model: llmModel });
            setSummary(res.data.summary);
        } catch (error) {
            setSummary('Hata: Özet oluşturulamadı. Lütfen LLM bağlantısını kontrol edin.\n' + (error.response?.data?.details || error.message));
        } finally {
            setGenerating(false);
        }
    };

    if (loading && !stats) return <Typography sx={{ p: 4 }}>Yükleniyor...</Typography>;

    return (
        <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4">Dashboard</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FormControlLabel
                            control={<Switch checked={scope === 'personal'} onChange={(e) => setScope(e.target.checked ? 'personal' : 'global')} />}
                            label={scope === 'personal' ? "Kişi Bazlı" : "Takım Geneli"}
                        />
                        {scope === 'personal' && (
                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                style={{ padding: '8px', borderRadius: '4px', minWidth: '150px' }}
                            >
                                <option value="">Kullanıcı Seçiniz...</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                            </select>
                        )}
                    </Box>
                </Box>
                {scope === 'personal' && !selectedUser && (
                    <Typography color="error">Lütfen verilerini görmek istediğiniz kullanıcıyı seçiniz.</Typography>
                )}
            </Grid>

            {stats && (
                <>
                    {/* Row 1: KPI Cards */}
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary">Toplam Efor (Saat)</Typography>
                                <Typography variant="h4">{stats.total_effort}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    {/* Add more KPI cards here if needed */}

                    {/* Row 2: Distributions (Pies) */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" gutterBottom>Kategori Dağılımı</Typography>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.category_distribution}
                                            cx="50%" cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                            nameKey="category"
                                            label
                                        >
                                            {stats.category_distribution?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" gutterBottom>Statü Dağılımı</Typography>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.status_distribution}
                                            cx="50%" cy="50%"
                                            outerRadius={80}
                                            fill="#82ca9d"
                                            dataKey="count"
                                            nameKey="status"
                                            label
                                        >
                                            {stats.status_distribution?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Row 3: Effort Analysis (Bars) */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: 400 }}>
                            <Typography variant="h6" gutterBottom>En Çok Efor (Sistemler)</Typography>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={stats.top_products} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="effort" fill="#8884d8" name="Efor" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: 400 }}>
                            <Typography variant="h6" gutterBottom>En Çok Efor (Kişiler)</Typography>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={stats.effort_by_person} margin={{ bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="full_name" interval={0} angle={-30} textAnchor="end" height={60} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="effort" fill="#82ca9d" name="Efor" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Row 4: Timeline */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, height: 300 }}>
                            <Typography variant="h6" gutterBottom>Yoğunluk Haritası</Typography>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={stats.heatmap_data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#ff7300" name="Aktivite" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </>
            )}

            {/* Executive Summary Section */}
            <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>Executive Summary (Yapay Zeka)</Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        Aşağıdaki ayarları kullanarak yerel veya uzak bir LLM modelinden yönetici özeti alabilirsiniz.
                    </Typography>

                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={5}>
                            <TextField
                                fullWidth label="LLM API URL"
                                value={llmUrl} onChange={(e) => setLlmUrl(e.target.value)}
                                helperText="Örn: http://host.docker.internal:11434/api/generate"
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth label="Model Adı / Keyword"
                                value={llmModel} onChange={(e) => setLlmModel(e.target.value)}
                                helperText="Örn: llama3, mistral"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Button
                                variant="contained"
                                color="secondary"
                                size="large"
                                fullWidth
                                onClick={handleGenerateSummary}
                                disabled={generating}
                                startIcon={generating && <CircularProgress size={20} color="inherit" />}
                            >
                                {generating ? 'Oluşturuluyor...' : 'Özet Oluştur'}
                            </Button>
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 3 }} />
                    {summary && (
                        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, whiteSpace: 'pre-wrap' }}>
                            <Typography variant="h6" gutterBottom>Oluşturulan Özet:</Typography>
                            <Typography variant="body1">{summary}</Typography>
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

export default Dashboard;
