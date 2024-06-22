import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../../firebase/firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { Container, Typography, List, ListItem, ListItemText, ListItemButton, Box, Divider, Paper, TextField, Pagination } from '@mui/material';
import TextWithColor from '../../../components/TextWithColors.jsx';

const SubjectsList = () => {
  const { subjectId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const subjectsPerPage = 7;
  const navigate = useNavigate();

  // Mapeamento de subjectId para nome e cor
  const subjectDetails = {
    portuguese: { name: 'Língua Portuguesa', color: '#FF6347' },
    mathematics: { name: 'Matemática', color: '#FFD700' },
    science: { name: 'Ciências', color: '#00FA9A' },
    geography: { name: 'Geografia', color: '#00BFFF' },
    history: { name: 'História', color: '#DEB887' },
    art: { name: 'Arte', color: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' },
    english: { name: 'Língua Inglesa', color: 'linear-gradient(to right, blue, red, white)' },
    physicalEducation: { name: 'Educação Física', color: 'orange' }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      const querySnapshot = await getDocs(collection(db, `${subjectId}Questions`));
      let fetchedSubjects = new Set();
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        fetchedSubjects.add(data.subject);
      });

      const subjectsArray = Array.from(fetchedSubjects).map(subject => ({
        subject,
        ...subjectDetails[subject]
      }));

      // Ordenar os subjects em ordem alfabética
      subjectsArray.sort((a, b) => a.subject.localeCompare(b.subject));
      setSubjects(subjectsArray);
    };

    fetchSubjects();
  }, [subjectId]);

  const handleNavigation = (subject) => {
    navigate(`/student/subjects/${subjectId}/${subject}`);
  };

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset page to 1 when search term changes
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedSubjects = filteredSubjects.slice((page - 1) * subjectsPerPage, page * subjectsPerPage);

  const getSubjectDisplayName = (subjectId) => {
    const details = subjectDetails[subjectId];
    return details ? details.name : subjectId.charAt(0).toUpperCase() + subjectId.slice(1);
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2, marginBottom: '5%', marginTop: '6%' }}>
        <Typography variant="h3" gutterBottom className="text-shadow">
          <TextWithColor subject={subjectId} text={getSubjectDisplayName(subjectId)} color={subjectDetails[subjectId]?.color} />
        </Typography>
      </Box>
      <Box sx={{ marginTop: '5%', marginLeft: 'auto', marginRight: 'auto', width: '70%' }}>
        <Paper elevation={2} sx={{ padding: '20px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '20px' }}>
            <Typography variant="h5" gutterBottom>
              Conteúdos
            </Typography>
            <TextField
              label="Pesquisar"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
            />
          </Box>
          <List>
            {paginatedSubjects.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleNavigation(item.subject)}>
                    <ListItemText primary={<TextWithColor subject={item.subject} text={item.subject} color={item.color} />} />
                  </ListItemButton>
                </ListItem>
                {index < paginatedSubjects.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(filteredSubjects.length / subjectsPerPage)}
            page={page}
            onChange={handleChangePage}
            color="primary"
          />
        </Box>
      </Box>
    </Container>
  );
};

export default SubjectsList;
