import React, { useState, useEffect } from 'react';
import { Divider, List, ListItem, ListItemText, Typography, IconButton, Dialog, DialogContent, DialogActions, DialogTitle, Button, Menu, MenuItem, TextField } from '@mui/material';
import { Edit, Delete, ArrowUpward, ArrowDownward, Sort } from '@mui/icons-material';
import { db } from '../../firebase/firebase';
import { collection, query, onSnapshot, doc, getDoc, deleteDoc } from 'firebase/firestore';
import CreateUsers from './CreateUsers.jsx';
import Pagination from '@mui/material/Pagination';

const roleDisplayNames = {
    admin: 'Administrador',
    student: 'Estudante',
    professor: 'Professor'
};

const subjectsDisplayNames = {
    portuguese: 'Língua Portuguesa',
    math: 'Matemática',
    science: 'Ciências',
    geography: 'Geografia',
    history: 'História',
    art: 'Arte',
    english: 'Língua Inglesa'
};

const yearDisplayNames = {
    6: '6º ano',
    7: '7º ano',
    8: '8º ano',
    9: '9º ano'
};

function ListUsers() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [sortCriteria, setSortCriteria] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const usersPerPage = 5;

    useEffect(() => {
        const q = query(collection(db, 'users'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const usersArray = [];
            querySnapshot.forEach((doc) => {
                const userData = {
                    id: doc.id,
                    ...doc.data(),
                    role: roleDisplayNames[doc.data().role] || doc.data().role
                };
                usersArray.push(userData);
            });
            setUsers(usersArray);
        }, (error) => {
            console.error('Erro ao buscar usuários:', error);
        });

        return () => unsubscribe();
    }, []);

    const handleEditClick = async (userId) => {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            setSelectedUser({ id: userDoc.id, ...userDoc.data() });
            setEditDialogOpen(true);
        }
    };

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setSelectedUser(null);
    };

    const handleDeleteClick = (userId) => {
        setUserToDelete(userId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
    };

    const handleDeleteUser = async () => {
        if (userToDelete) {
            try {
                await deleteDoc(doc(db, 'users', userToDelete));
                handleDeleteDialogClose();
            } catch (error) {
                console.error('Erro ao deletar usuário:', error);
            }
        }
    };

    const getUserSecondaryText = (user) => {
        if (user.role === 'Professor') {
            return `Papel: ${user.role} - Matéria: ${subjectsDisplayNames[user.subject] || user.subject}`;
        }
        if (user.role === 'Estudante') {
            return `Papel: ${user.role} - Ano: ${yearDisplayNames[user.schoolYear] || user.schoolYear}`;
        }
        return `Papel: ${user.role}`;
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

    const sortedUsers = [...users].sort((a, b) => {
        if (!sortCriteria) return 0;
        if (sortCriteria === 'name') {
            return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortCriteria === 'role') {
            return sortOrder === 'asc' ? a.role.localeCompare(b.role) : b.role.localeCompare(a.role);
        }
        return 0;
    });

    const filteredUsers = sortedUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getSortDescription = () => {
        if (!sortCriteria) return 'Sem ordenação';
        const criteriaMap = {
            name: 'Alfabética',
            role: 'Papel'
        };
        const orderMap = {
            asc: 'crescente',
            desc: 'decrescente'
        };
        return `${criteriaMap[sortCriteria]}`;
    };

    const handleChangePage = (event, value) => {
        setPage(value);
    };

    const paginatedUsers = filteredUsers.slice((page - 1) * usersPerPage, page * usersPerPage);

    return (
        <div>
            <div style={{ display: 'flex', paddingTop: '5%', paddingLeft: '12%', width: '80%', alignItems: 'center' }}>
                <Typography variant="h3" sx={{ mb: 2 }}>
                    Lista de Usuários
                </Typography>
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', paddingRight: '4%' }}>
                    <Typography sx={{fontSize: '15px'}}>
                        {getSortDescription()}
                    </Typography>
                    <IconButton color="primary" onClick={handleSortClick} sx={{}}>
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
                    <MenuItem onClick={() => handleSortChange('role')}>
                        {sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />} Ordem: Papel
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
                        {paginatedUsers.map((user) => (
                            <ListItem
                                key={user.id}
                                secondaryAction={
                                    <>
                                        <IconButton
                                            style={{ color: '#8c8c8c' }}
                                            onClick={() => handleEditClick(user.id)}
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            style={{ color: '#e8533e' }}
                                            onClick={() => handleDeleteClick(user.id)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </>
                                }
                            >
                                <ListItemText
                                    primary={user.name}
                                    secondary={getUserSecondaryText(user)}
                                />
                            </ListItem>
                        ))}
                    </List>
                </div>
                <Pagination
                    count={Math.ceil(filteredUsers.length / usersPerPage)}
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                    sx={{ mt: 2 }}
                />
                <Dialog open={editDialogOpen} onClose={handleEditDialogClose} fullWidth maxWidth="md">
                    <DialogContent>
                        {selectedUser && <CreateUsers user={selectedUser} onClose={handleEditDialogClose} />}
                    </DialogContent>
                </Dialog>
                <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
                    <DialogTitle>Confirmação de Exclusão</DialogTitle>
                    <DialogContent>Tem certeza que deseja excluir este usuário?</DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteDialogClose} color="primary">
                            Cancelar
                        </Button>
                        <Button onClick={handleDeleteUser} color="secondary">
                            Excluir
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}

export default ListUsers;
