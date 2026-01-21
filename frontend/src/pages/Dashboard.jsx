import React, { useEffect, useState } from 'react';
import {
    Paper, Typography, Grid, Card, CardContent, Box, Button, TextField, CircularProgress, Divider
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import api from '../api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // LLM State
    const [llmUrl, setLlmUrl] = useState('http://host.docker.internal:11434/api/generate');
    const [llmModel, setLlmModel] = useState('llama3');
    const [summary, setSummary] = useState('');
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard-stats');
                const basicRes = await api.get('/stats');
                setStats({ ...res.data, ...basicRes.data });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

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

    if (loading) return <Typography sx={{ p: 4 }}>Yükleniyor...</Typography>;
    if (!stats) return <Typography sx={{ p: 4 }}>Veri alınamadı.</Typography>;

    return (
        <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
                <Typography variant="h4" gutterBottom>Dashboard</Typography>
            </Grid>

            {/* Summary Cards */}
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary">Toplam Personel</Typography>
                        <Typography variant="h4">{stats.team_size}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary">Toplam Aktivite</Typography>
                        <Typography variant="h4">{stats.total_activities}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary">Toplam Efor (Saat)</Typography>
                        <Typography variant="h4">{stats.total_effort}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary">Sistem Durumu</Typography>
                        <Typography variant="h6" color="success.main">{stats.system_metrics}</Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* Charts */}
            <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2, height: 400 }}>
                    <Typography variant="h6" gutterBottom>Kişi Bazlı Toplam Efor</Typography>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={stats.effort_by_person}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="full_name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="effort" fill="#8884d8" name="Efor (Saat)" />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, height: 400 }}>
                    <Typography variant="h6" gutterBottom>Statü Dağılımı</Typography>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie
                                data={stats.status_distribution}
                                cx="50%" cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="status"
                                label
                            >
                                {stats.status_distribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>

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
