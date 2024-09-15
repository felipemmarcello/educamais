import React, { useState, useEffect, useContext } from 'react';
import { createUserWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase.js';
import { TextField, InputAdornment, Button, Select, MenuItem, FormControl, InputLabel, Box, Typography, Grid, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UserContext from '../../contexts/UserContext.jsx';

function CreateUsers({ user, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [gender, setGender] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [schoolYear, setSchoolYear] = useState('');
  const [schoolSubject, setSchoolSubject] = useState('');
  const [classRoom, setClassRoom] = useState(''); // Novo campo de texto para sala
  const [status, setStatus] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [errorFields, setErrorFields] = useState({});
  const [schoolId, setSchoolId] = useState('');
  const [emailDomain, setEmailDomain] = useState('');

  const { globalUid } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPassword('');
      setRole(user.role || '');
      setGender(user.gender || '');
      setBirthdate(user.birthdate || '');
      setSchoolYear(user.schoolYear || '');
      setSchoolSubject(user.schoolSubject || '');
      setClassRoom(user.classRoom || ''); // Setando sala
    }
  }, [user]);

  useEffect(() => {
    const fetchAdminMasterDetails = async () => {
      const userDoc = await getDoc(doc(db, 'users', globalUid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSchoolId(userData.schoolId);
        const emailParts = userData.email.split('@');
        setEmailDomain(emailParts[1]);
      }
    };

    fetchAdminMasterDetails();
  }, [globalUid]);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setName('');
    setEmail('');
    setPassword('');
    setGender('');
    setBirthdate('');
    setSchoolYear('');
    setSchoolSubject('');
    setClassRoom(''); // Resetando sala ao trocar o papel
    setErrorFields({});
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setStatus('');
    if (onClose) onClose();
  };

  const handleSaveUser = async () => {
    setErrorFields({});
    let validationErrors = {};

    if (!name) {
      validationErrors.name = true;
    }
    if (!email) {
      validationErrors.email = true;
    }
    if (user ? password && password.length < 6 : !password) {
      validationErrors.password = true;
    }
    if (role !== 'admin' && !gender) {
      validationErrors.gender = true;
    }
    if (role !== 'admin' && !birthdate) {
      validationErrors.birthdate = true;
    } else if (role !== 'admin') {
      const birthdateParts = birthdate.split('-');
      if (birthdateParts.length !== 3 || birthdateParts.some(part => !part)) {
        validationErrors.birthdate = true;
      }
    }
    if (role === 'student' && !schoolYear) {
      validationErrors.schoolYear = true;
    }
    if (role === 'student' && !classRoom) { // Validando sala
      validationErrors.classRoom = true;
    }
    if (role === 'professor' && !schoolSubject) {
      validationErrors.schoolSubject = true;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrorFields(validationErrors);
      return;
    }

    try {
      let uid;
      const fullEmail = `${email}@${emailDomain}`;
      if (user) {
        uid = user.id;
        const userData = {
          name,
          email: fullEmail,
          role,
          schoolId,
          ...(role !== 'admin' && { gender, birthdate }),
          ...(schoolYear && { schoolYear }),
          ...(schoolSubject && { schoolSubject }),
          ...(classRoom && { classRoom }), // Salvando sala
        };
        await updateDoc(doc(db, 'users', uid), userData);

        if (password) {
          await updatePassword(auth.currentUser, password);
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, fullEmail, password);
        uid = userCredential.user.uid;

        const userData = {
          name,
          email: fullEmail,
          role,
          schoolId,
          ...(role !== 'admin' && { gender, birthdate }),
          ...(schoolYear && { schoolYear }),
          ...(schoolSubject && { schoolSubject }),
          ...(classRoom && { classRoom }), // Salvando sala
          ...(role === 'student' && {
            exp: 0,
            correctAnswers: 0,
            level: 1,
            points: 0,
          }),
        };

        await setDoc(doc(db, 'users', uid), userData);
      }

      setOpenDialog(true);
    } catch (error) {
      console.error('Error creating/updating user:', error);
      const errorField = error.code.includes('email') ? 'email' : error.code.includes('password') ? 'password' : '';
      setErrorFields((prev) => ({ ...prev, [errorField]: true }));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', paddingTop: '5%', paddingLeft: '12%' }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          {user ? 'Editar Usuário' : 'Criar Usuário'}
        </Typography>
      </div>
      <Divider sx={{ width: '80%', margin: 'auto', height: '50%' }} />
      <Box sx={{ maxWidth: '70%', margin: 'auto', mt: 1, bgcolor: '#fff', paddingTop: '5%' }}>
        <div style={{ display: 'flex' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Selecione:
          </Typography>
        </div>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <FormControl sx={{ width: 150, 
                  '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#c5c5c5',
                  },
                }, }} margin="normal">
            <InputLabel id="role-select-label">Papel</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={role}
              label="Papel"
              onChange={handleRoleChange}
              disabled={!!user}
            >
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="student">Estudante</MenuItem>
              <MenuItem value="professor">Professor</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {role && (
          <>
            <Grid container spacing={1}>
              <Grid item xs={4} sm={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  margin="normal"
                  required
                  error={!!errorFields.name}
                  helperText={errorFields.name && "Campo obrigatório"}
                />
              </Grid>
              <Grid item xs={4} sm={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Senha"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  error={!!errorFields.password}
                  helperText={errorFields.password && (user ? "Campo obrigatório" : "Campo obrigatório")}
                  disabled={!!user}
                />
              </Grid>
              <Grid item xs={4} sm={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  error={!!errorFields.email}
                  helperText={errorFields.email && "E-mail já utilizado."}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end" sx={{fontSize: '12px'}}>
                        @{emailDomain}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {role !== 'admin' && (
                <>
                  <Grid item xs={4} sm={4}>
                    <FormControl fullWidth margin="normal" error={!!errorFields.gender}>
                      <InputLabel id="gender-select-label">Sexo</InputLabel>
                      <Select
                        labelId="gender-select-label"
                        id="gender-select"
                        value={gender}
                        label="Sexo"
                        onChange={(e) => setGender(e.target.value)}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: 'gray',
                            },
                          },
                        }}
                      >
                        <MenuItem value="male">Masculino</MenuItem>
                        <MenuItem value="female">Feminino</MenuItem>
                        <MenuItem value="other">Outro</MenuItem>
                      </Select>
                      {errorFields.gender && <Typography color="error">Campo obrigatório</Typography>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={4} sm={4}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Data de Nascimento"
                      type="date"
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                      required
                      error={!!errorFields.birthdate}
                      helperText={errorFields.birthdate && "Data de nascimento inválida"}
                    />
                  </Grid>
                  {role === 'student' && (
                    <>
                      <Grid item xs={4} sm={4}>
                        <FormControl fullWidth margin="normal" error={!!errorFields.schoolYear}>
                          <InputLabel id="school-year-select-label">Ano Escolar</InputLabel>
                          <Select
                            labelId="school-year-select-label"
                            id="school-year-select"
                            value={schoolYear}
                            label="Ano Escolar"
                            onChange={(e) => setSchoolYear(e.target.value)}
                            required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: 'gray',
                                },
                              },
                            }}
                          >
                            <MenuItem value="6">6º ano</MenuItem>
                            <MenuItem value="7">7º ano</MenuItem>
                            <MenuItem value="8">8º ano</MenuItem>
                            <MenuItem value="9">9º ano</MenuItem>
                          </Select>
                          {errorFields.schoolYear && <Typography color="error">Campo obrigatório</Typography>}
                        </FormControl>
                      </Grid>
                      <Grid item xs={4} sm={4}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          label="Turma (A, B, ...)"
                          value={classRoom}
                          onChange={(e) => setClassRoom(e.target.value)}
                          margin="normal"
                          required
                          error={!!errorFields.classRoom}
                          helperText={errorFields.classRoom && "Campo obrigatório"}
                        />
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                          Mantenha um padrão da escolha de turmas!
                        </Typography>
                      </Grid>
                    </>
                  )}
                  {role === 'professor' && (
                    <Grid item xs={4} sm={4}>
                      <FormControl fullWidth margin="normal" error={!!errorFields.schoolSubject}>
                        <InputLabel id="schoolSubject-select-label">Matéria</InputLabel>
                        <Select
                          labelId="schoolSubject-select-label"
                          id="schoolSubject-select"
                          value={schoolSubject}
                          label="Matéria"
                          onChange={(e) => setSchoolSubject(e.target.value)}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused fieldset': {
                                borderColor: 'gray',
                              },
                            },
                          }}
                        >
                          <MenuItem value="portuguese">Língua Portuguesa</MenuItem>
                          <MenuItem value="mathematics">Matemática</MenuItem>
                          <MenuItem value="science">Ciências</MenuItem>
                          <MenuItem value="geography">Geografia</MenuItem>
                          <MenuItem value="history">História</MenuItem>
                          <MenuItem value="art">Arte</MenuItem>
                          <MenuItem value="english">Língua Inglesa</MenuItem>
                          <MenuItem value="physicalEducation">Educação Física</MenuItem>
                          <MenuItem value="religion">Ensino Religioso</MenuItem>
                        </Select>
                        {errorFields.schoolSubject && <Typography color="error">Campo obrigatório</Typography>}
                      </FormControl>
                    </Grid>
                  )}
                </>
              )}
            </Grid>
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              {user && (
                <Button
                  variant="contained"
                  style={{ backgroundColor: '#5589c4', color: '#ffffff' }}
                  onClick={handleDialogClose}
                  sx={{ mt: 2, width: '100px', marginTop: '4%', ml: 2 }}
                >
                  Cancelar
                </Button>
              )}

              <Button
                variant="contained"
                style={{ backgroundColor: '#5589c4', color: '#ffffff' }}
                onClick={handleSaveUser}
                sx={{ mt: 2, width: '100px', marginTop: '4%', marginLeft: '2%' }}
              >
                {user ? 'Salvar' : 'Criar'}
              </Button>

            </div>
            {status && (
              <Typography color="error" sx={{ mt: 2 }}>
                {status}
              </Typography>
            )}
          </>
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{user ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!'}</DialogTitle>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <DialogContent style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <DialogContentText>
              {status}
            </DialogContentText>
            <CheckCircleIcon color="success" style={{ fontSize: 75 }} />
          </DialogContent>
        </div>
        <DialogActions>
          <Button onClick={handleDialogClose} style={{ color: '#5589c4' }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CreateUsers;
