import React, { useState, useEffect } from 'react';
import {
    Paper, Typography, Grid, TextField, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Chip, Tabs, Tab, Box, Tooltip
} from '@mui/material';
import { Edit, Delete, RestoreFromTrash, Block } from '@mui/icons-material';
import api from '../api';
import { useApp } from '../context/AppContext';

const Admin = () => {
    const { refreshUsers } = useApp();
    const [tabValue, setTabValue] = useState(0);

    // Users State
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState('');
    const [editingUser, setEditingUser] = useState(null); // { id, full_name, is_active }

    // Products State
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', description: '' });
    const [editingProduct, setEditingProduct] = useState(null); // { id, name, description, is_active }

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchProducts = async () => {
        try {
            // Get all products including inactive
            const res = await api.get('/products?all=true');
            setProducts(res.data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        if (tabValue === 0) fetchUsers();
        if (tabValue === 1) fetchProducts();
    }, [tabValue]);

    // --- User Handlers ---
    const handleAddUser = async () => {
        if (!newUser) return;
        try {
            await api.post('/users', { full_name: newUser });
            setNewUser('');
            fetchUsers();
            refreshUsers();
        } catch (error) { alert('Hata oluştu'); }
    };

    const handleUpdateUserStatus = async (id, isActive) => {
        try {
            await api.put(`/users/${id}`, { is_active: isActive });
            fetchUsers();
            refreshUsers();
        } catch (error) { alert('Guncellenemedi'); }
    };

    const handleEditUser = async (user) => {
        // Simple prompt for MVP
        const newName = prompt("Yeni isim:", user.full_name);
        if (newName && newName !== user.full_name) {
            try {
                await api.put(`/users/${user.id}`, { full_name: newName });
                fetchUsers();
                refreshUsers();
            } catch (error) { alert('Guncellenemedi'); }
        }
    };

    // --- Product Handlers ---
    const handleAddProduct = async () => {
        if (!newProduct.name) return;
        try {
            await api.post('/products', newProduct);
            setNewProduct({ name: '', description: '' });
            fetchProducts();
        } catch (error) { alert('Hata oluştu. İsim benzersiz olmalı.'); }
    };

    const handleUpdateProductStatus = async (id, isActive) => {
        try {
            await api.put(`/products/${id}`, { is_active: isActive });
            fetchProducts();
        } catch (error) { alert('Guncellenemedi'); }
    };

    const handleEditProduct = async (product) => {
        const newName = prompt("Yeni ürün adı:", product.name);
        if (newName && newName !== product.name) {
            try {
                await api.put(`/products/${product.id}`, { name: newName });
                fetchProducts();
            } catch (error) { alert('Guncellenemedi'); }
        }
    };

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);

    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            setUploadResult(null);
            const res = await api.post('/admin/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadResult(res.data);
            if (res.data.successCount > 0) {
                // Refresh other data if needed
            }
        } catch (error) {
            console.error(error);
            setUploadResult({ message: 'Yükleme başarısız', errors: [error.message] });
        }
    };

    return (
        <Paper sx={{ p: 4, mt: 4 }}>
            <Typography variant="h5" gutterBottom>Yönetim Paneli</Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab label="Personel Yönetimi" />
                    <Tab label="Ürün/Servis Yönetimi" />
                    <Tab label="Toplu Yükleme" />
                </Tabs>
            </Box>

            {/* USERS TAB */}
            {tabValue === 0 && (
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>Yeni Personel Ekle</Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={8}>
                                <TextField
                                    fullWidth size="small"
                                    label="Ad Soyad"
                                    value={newUser}
                                    onChange={(e) => setNewUser(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <Button variant="contained" fullWidth onClick={handleAddUser}>Ekle</Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Ad Soyad</TableCell>
                                        <TableCell>Durum</TableCell>
                                        <TableCell align="right">İşlemler</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((u) => (
                                        <TableRow key={u.id} sx={{ opacity: u.is_active ? 1 : 0.5 }}>
                                            <TableCell>{u.id}</TableCell>
                                            <TableCell>{u.full_name}</TableCell>
                                            <TableCell>
                                                {u.is_active ? <Chip label="Aktif" color="success" size="small" /> : <Chip label="Pasif" color="default" size="small" />}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Düzenle">
                                                    <IconButton size="small" onClick={() => handleEditUser(u)}><Edit /></IconButton>
                                                </Tooltip>
                                                {u.is_active ? (
                                                    <Tooltip title="Pasife Al (Ayrıldı)">
                                                        <IconButton size="small" color="error" onClick={() => handleUpdateUserStatus(u.id, false)}><Block /></IconButton>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip title="Aktif Et">
                                                        <IconButton size="small" color="primary" onClick={() => handleUpdateUserStatus(u.id, true)}><RestoreFromTrash /></IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            )}

            {/* PRODUCTS TAB */}
            {tabValue === 1 && (
                <Grid container spacing={4}>
                    <Grid item xs={12} md={5}>
                        <Typography variant="h6" gutterBottom>Yeni Ürün/Servis Ekle</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth size="small"
                                    label="Tanım (Ad)"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth size="small"
                                    label="Açıklama"
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" onClick={handleAddProduct}>Ekle</Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Ad</TableCell>
                                        <TableCell>Durum</TableCell>
                                        <TableCell align="right">İşlemler</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {products.map((p) => (
                                        <TableRow key={p.id} sx={{ opacity: p.is_active ? 1 : 0.5 }}>
                                            <TableCell>{p.id}</TableCell>
                                            <TableCell>{p.name}</TableCell>
                                            <TableCell>
                                                {p.is_active ? <Chip label="Aktif" color="success" size="small" /> : <Chip label="Pasif" color="default" size="small" />}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Düzenle">
                                                    <IconButton size="small" onClick={() => handleEditProduct(p)}><Edit /></IconButton>
                                                </Tooltip>
                                                {p.is_active ? (
                                                    <Tooltip title="Deaktive Et">
                                                        <IconButton size="small" color="error" onClick={() => handleUpdateProductStatus(p.id, false)}><Block /></IconButton>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip title="Aktif Et">
                                                        <IconButton size="small" color="primary" onClick={() => handleUpdateProductStatus(p.id, true)}><RestoreFromTrash /></IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            )}

            {/* BULK UPLOAD TAB */}
            {tabValue === 2 && (
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Toplu Veri Yükleme (Excel)</Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                            Aşağıdaki formatta bir Excel dosyası yükleyiniz. İlk satır başlık olmalıdır.
                            Sütunlar: Kategori, Konu, Ürün, Sorumlu, Statü, Kritiklik, Efor, Haftalık Durum, Hafta(Opsiyonel)
                        </Typography>

                        <Box sx={{ border: '1px dashed #ccc', p: 3, textAlign: 'center', mb: 2 }}>
                            <input
                                accept=".xlsx, .xls"
                                style={{ display: 'none' }}
                                id="raised-button-file"
                                type="file"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                            />
                            <label htmlFor="raised-button-file">
                                <Button variant="outlined" component="span">
                                    Dosya Seç
                                </Button>
                            </label>
                            {selectedFile && <Typography sx={{ mt: 1 }}>{selectedFile.name}</Typography>}
                        </Box>

                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={!selectedFile}
                            onClick={handleUpload}
                        >
                            Yükle
                        </Button>

                        {uploadResult && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                <Typography variant="subtitle2" color={uploadResult.successCount > 0 ? "success.main" : "error"}>
                                    {uploadResult.message}
                                </Typography>
                                {uploadResult.successCount !== undefined && (
                                    <Typography variant="body2">
                                        Başarılı: {uploadResult.successCount} / {uploadResult.totalProcessed}
                                    </Typography>
                                )}
                                {uploadResult.errors && (
                                    <Box sx={{ mt: 1, maxHeight: 100, overflow: 'auto' }}>
                                        {uploadResult.errors.map((e, i) => (
                                            <Typography key={i} variant="caption" display="block" color="error">
                                                {e}
                                            </Typography>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Grid>
                </Grid>
            )}
        </Paper>
    );
};

export default Admin;
