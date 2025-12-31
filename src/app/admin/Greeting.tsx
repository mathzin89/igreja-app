"use client";

import { Typography } from '@mui/material';
import { useAuth } from '@/firebase/AuthContext';

export default function Greeting() {
  const { userProfile } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    if (hour < 24) return "Boa noite";
    return "Boa noite";
  };

  const userName = userProfile?.nome ? `, ${userProfile.nome.split(' ')[0]}` : '';

  return (
    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
      {getGreeting()}{userName}!
    </Typography>
  );
}

