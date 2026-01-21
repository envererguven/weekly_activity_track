import React, { useState, useEffect } from 'react';
import {
    Box, TextField, Select, MenuItem, FormControl, InputLabel, Button,
    Typography, Grid, Paper, Autocomplete
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../api';

const CATEGORY_OPTIONS = [
    'Proje ID (Zorunlu)', 'Talep ID (Zorunlu)', 'Defect ID (Zorunlu)',
    'Güvenlik Açığı', 'Diğer'
];

const OTHER_CATEGORY_DETAILS = [
    'Destek ve Bakım Faaliyetleri', 'Rutin İşler', 'Fizibilite',
    'İyileştirme (Ürün Takibi)', 'Raporlama (Ürün Takibi)', 'Şartname (Talep)',
    'BTK Toplantı', 'Eğitim', 'Konferans', 'Seminer', 'Çalıştay',
    'Yenilikçi Servis Geliştirme Faaliyetleri (Ar-Ge)'
];

const STATUS_OPTIONS = ['Tamamlandı', 'Devam Eden', 'Yeni Konu'];
const CRITICALITY_OPTIONS = [
    'Çok Kritik - Hemen aksiyon alınmalı', 'Kritik - Mutlaka Aksiyon alınmalı',
    'Normal - İş planımızda olmalı', 'Standart-Rutin işlerimiz eforumuzu çok almamalı.',
    'Hiç Kritik Değil - İş planımızda bile yok'
];

const ActivityForm = () => {
    const navigate = useNavigate();
    const { currentWeek, currentUser } = useApp();
    const [formData, setFormData] = useState({
        category: '',
        ref_id: '',
        status: 'Yeni Konu',
        criticality: 'Normal - İş planımızda olmalı',
        subject: '',
        description: '',
        product_name: '',
        weekly_progress: '',
        effort: 0
    });

    const [products, setProducts] = useState([]);
    const [otherDetail, setOtherDetail] = useState('');

    useEffect(() => {
        // Load products for autocomplete
        api.get('/products').then(res => setProducts(res.data)).catch(console.error);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert("Lütfen yukarıdan bir kullanıcı seçiniz.");
            return;
        }

        const payload = {
            ...formData,
            user_id: currentUser.id,
            week: currentWeek,
            progress: formData.weekly_progress,
            // If category is Other, map detail to somewhere distinctive
            category: formData.category === 'Diğer' ? `Diğer - ${otherDetail}` : formData.category
        };

        try {
            await api.post('/activities', payload);
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Kaydedilemedi');
        }
    };

    const isIdRequired = ['Proje ID (Zorunlu)', 'Talep ID (Zorunlu)', 'Defect ID (Zorunlu)'].includes(formData.category);

    return (
        <Paper sx={{ p: 4, mt: 4 }}>
            <Typography variant="h5" gutterBottom>Yeni Aktivite Girişi ({currentWeek})</Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required>
                            <InputLabel>Kategori</InputLabel>
                            <Select name="category" value={formData.category} onChange={handleChange} label="Kategori">
                                {CATEGORY_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>

                    {formData.category === 'Diğer' && (
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Diğer Detayı</InputLabel>
                                <Select value={otherDetail} onChange={(e) => setOtherDetail(e.target.value)} label="Diğer Detayı">
                                    {OTHER_CATEGORY_DETAILS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                    )}

                    {isIdRequired && (
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required
                                label="Referans ID (Proje/Talep/Defect)"
                                name="ref_id" value={formData.ref_id} onChange={handleChange}
                            />
                        </Grid>
                    )}

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required>
                            <InputLabel>Statü</InputLabel>
                            <Select name="status" value={formData.status} onChange={handleChange} label="Statü">
                                {STATUS_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            freeSolo
                            options={products.map(p => p.name)}
                            renderInput={(params) => <TextField {...params} label="Hangi Ürün/Servis" required />}
                            value={formData.product_name}
                            onInputChange={(event, newInputValue) => {
                                setFormData({ ...formData, product_name: newInputValue });
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField fullWidth required label="Konu" name="subject" value={formData.subject} onChange={handleChange} />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField fullWidth multiline rows={3} label="Açıklama" name="description" value={formData.description} onChange={handleChange} />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>Haftalık Gelişmeler ({currentWeek})</Typography>
                    </Grid>
                    <Grid item xs={12} md={9}>
                        <TextField fullWidth multiline rows={2} label="Gelişme Durumu" name="weekly_progress" value={formData.weekly_progress} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth type="number" label="Harcanan Efor (Saat)" name="effort" value={formData.effort} onChange={handleChange} />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <InputLabel>Kritiklik</InputLabel>
                            <Select name="criticality" value={formData.criticality} onChange={handleChange} label="Kritiklik">
                                {CRITICALITY_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Button variant="contained" color="primary" type="submit" size="large">Kaydet</Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default ActivityForm;
