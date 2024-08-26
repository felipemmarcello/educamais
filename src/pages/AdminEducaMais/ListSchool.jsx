import React, { useState, useEffect } from 'react';
import { Divider, List, ListItem, ListItemText, Typography, IconButton, Dialog, DialogContent, DialogActions, DialogTitle, Button, Menu, MenuItem, TextField } from '@mui/material';
import { Edit, Delete, ArrowUpward, ArrowDownward, Sort } from '@mui/icons-material';
import { db } from '../../firebase/firebase.js';
import { collection, query, onSnapshot, doc, getDoc, deleteDoc, updateDoc, where, getDocs } from 'firebase/firestore';
import Pagination from '@mui/material/Pagination';

function ListSchool() {
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [schoolToDelete, setSchoolToDelete] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [sortCriteria, setSortCriteria] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const schoolsPerPage = 5;

    useEffect(() => {
        const q = query(collection(db, 'schools'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const schoolsArray = [];
            querySnapshot.forEach((doc) => {
                const schoolData = {
                    id: doc.id,
                    ...doc.data()
                };
                schoolsArray.push(schoolData);
            });
            setSchools(schoolsArray);
        }, (error) => {
            console.error('Erro ao buscar escolas:', error);
        });

        return () => unsubscribe();
    }, []);

    const handleEditClick = async (schoolId) => {
        const schoolDoc = await getDoc(doc(db, 'schools', schoolId));
        if (schoolDoc.exists()) {
            setSelectedSchool({ id: schoolDoc.id, ...schoolDoc.data() });
            setEditDialogOpen(true);
        }
    };

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setSelectedSchool(null);
    };

    const handleDeleteClick = (schoolId) => {
        setSchoolToDelete(schoolId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
        setSchoolToDelete(null);
    };

    const handleDeleteSchool = async () => {
        if (schoolToDelete) {
            try {
                const collectionsToDeleteFrom = [
                    'artQuestions',
                    'englishQuestions',
                    'geographyQuestions',
                    'historyQuestions',
                    'mathematicsQuestions',
                    'physicalEducationQuestions',
                    'portugueseQuestions',
                    'scienceQuestions',
                    'userGeographyResponses',
                    'userMathematicsResponses',
                    'userPortugueseResponses',
                    'userScienceResponses',
                    'userArtResponses',
                    'userPhysicalEducationResponses',
                    'userEnglishResponses',
                    'userArtResponses',
                    'users'
                ];

                for (const collectionName of collectionsToDeleteFrom) {
                    const q = query(collection(db, collectionName), where('schoolId', '==', schoolToDelete));
                    const querySnapshot = await getDocs(q);
                    querySnapshot.forEach(async (doc) => {
                        await deleteDoc(doc.ref);
                    });
                }

                await deleteDoc(doc(db, 'schools', schoolToDelete));
                handleDeleteDialogClose();
            } catch (error) {
                console.error('Erro ao deletar escola:', error);
            }
        }
    };

    const handleEditSchool = async (school) => {
        try {
            await updateDoc(doc(db, 'schools', school.id), {
                schoolName: school.schoolName,
                address: school.address,
                city: school.city,
                state: school.state
            });
            handleEditDialogClose();
        } catch (error) {
            console.error('Erro ao atualizar escola:', error);
        }
    };

    const getSchoolSecondaryText = (school) => {
        return `Cidade: ${school.city} - Estado: ${school.state}`;
    };

    const handleSortClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSortClose = () => {
        setAnchorEl(null);
    };

    const handleSortChange = (criteria) => {
        setSortCriteria(criteria);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        handleSortClose();
    };

    const sortedSchools = [...schools].sort((a, b) => {
        if (!sortCriteria) return 0;
        if (sortCriteria === 'name') {
            return sortOrder === 'asc' ? a.schoolName.localeCompare(b.schoolName) : b.schoolName.localeCompare(a.schoolName);
        }
        return 0;
    });

    const filteredSchools = sortedSchools.filter(school =>
        school.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.state.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSortDescription = () => {
        if (!sortCriteria) return 'Sem ordenação';
        const orderMap = {
            asc: 'Crescente',
            desc: 'Decrescente'
        };
        return `${orderMap[sortOrder]}`;
    };

    const handleChangePage = (event, value) => {
        setPage(value);
    };

    const paginatedSchools = filteredSchools.slice((page - 1) * schoolsPerPage, page * schoolsPerPage);

    return (
        <div>
            <div style={{ display: 'flex', paddingTop: '5%', paddingLeft: '12%', width: '80%', alignItems: 'center' }}>
                <Typography variant="h3" sx={{ mb: 2 }}>
                    Lista de Escolas
                </Typography>
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', paddingRight: '4%' }}>
                    <Typography sx={{fontSize: '15px'}}>
                        {getSortDescription()}
                    </Typography>
                    <IconButton color="primary" onClick={handleSortClick}>
                        <Sort />
                    </IconButton>
                </div>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleSortClose}
                >
                    <MenuItem onClick={() => handleSortChange('name')}>
                        {sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />} Ordem: Alfabética
                    </MenuItem>
                </Menu>
            </div>
            <Divider sx={{ width: '80%', margin: 'auto' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '4%', width: '60%'}}>
                    <TextField
                        label="Pesquisar"
                        variant="outlined"
                        size="small"
                        sx={{ margin: 'auto'}}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ maxWidth: '55%', width: '100%', paddingTop: '1%', height: '100%', maxHeight: '70%' }}>
                    <List>
                        {paginatedSchools.map((school) => (
                            <ListItem
                                key={school.id}
                                secondaryAction={
                                    <>
                                        <IconButton
                                            style={{ color: '#8c8c8c' }}
                                            onClick={() => handleEditClick(school.id)}
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            style={{ color: '#e8533e' }}
                                            onClick={() => handleDeleteClick(school.id)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </>
                                }
                            >
                                <ListItemText
                                    primary={school.schoolName}
                                    secondary={getSchoolSecondaryText(school)}
                                />
                            </ListItem>
                        ))}
                    </List>
                </div>
                <Pagination
                    count={Math.ceil(filteredSchools.length / schoolsPerPage)}
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                    sx={{ mt: 2 }}
                />
                <Dialog open={editDialogOpen} onClose={handleEditDialogClose} fullWidth maxWidth="md">
                    <DialogTitle>Editar Escola</DialogTitle>
                    <DialogContent>
                        {selectedSchool && (
                            <form>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Nome da Escola"
                                    value={selectedSchool.schoolName}
                                    onChange={(e) => setSelectedSchool({ ...selectedSchool, schoolName: e.target.value })}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Endereço da Escola"
                                    value={selectedSchool.address}
                                    onChange={(e) => setSelectedSchool({ ...selectedSchool, address: e.target.value })}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Cidade"
                                    value={selectedSchool.city}
                                    onChange={(e) => setSelectedSchool({ ...selectedSchool, city: e.target.value })}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Estado"
                                    value={selectedSchool.state}
                                    onChange={(e) => setSelectedSchool({ ...selectedSchool, state: e.target.value })}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Domínio de E-mail da Escola"
                                    value={selectedSchool.SchoolEmailDomain}
                                    InputProps={{ readOnly: true }}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="E-mail do Admin Master da Escola"
                                    value={selectedSchool.adminEmail}
                                    InputProps={{ readOnly: true }}
                                />
                                <DialogActions>
                                    <Button onClick={handleEditDialogClose} color="primary">
                                        Cancelar
                                    </Button>
                                    <Button onClick={() => handleEditSchool(selectedSchool)} color="primary">
                                        Salvar
                                    </Button>
                                </DialogActions>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
                <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
                    <DialogTitle>Confirmação de Exclusão</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1">
                            Tem certeza que deseja excluir esta escola?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteDialogClose} color="primary">
                            Cancelar
                        </Button>
                        <Button onClick={handleDeleteSchool} color="secondary">
                            Excluir
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}

export default ListSchool;
