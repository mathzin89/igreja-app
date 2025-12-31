import React from 'react';
import { Typography, Box, Grid, Divider } from '@mui/material';

const backgroundImageUrl = 'https://i.imgur.com/kHw2bU7.png';

interface Membro {
  [key: string]: any;
}

interface FichaProps {
  membro: Membro;
}

export const FichaParaImpressao: React.FC<FichaProps> = ({ membro }) => {
  const CampoPosicionado = ({ top, left, value, fontSize = '12px', fontWeight = 'normal', width = 'auto' }: any) => (
    <Box 
      sx={{ 
        position: 'absolute', 
        top: `${top}%`, 
        left: `${left}%`,
        fontSize: fontSize,
        fontWeight: fontWeight,
        width: width,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {value}
    </Box>
  );

  return (
    <>
      <style type="text/css" media="print">
        {`
          @page {
            size: A4;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        `}
      </style>

      <Box 
        sx={{
          width: '210mm',
          height: '297mm',
          position: 'relative',
          color: '#333',
        }}
      >
        <img 
          src={backgroundImageUrl} 
          alt="Papel Timbrado da Ficha de Membro"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
          }}
        />
        
        <Box sx={{position: 'relative', width: '100%', height: '100%'}}>
          <CampoPosicionado top={31.2} left={15} value={membro.nome} fontWeight="bold" />
          <CampoPosicionado top={31.2} left={65} value={membro.dataNascimento} />
          <CampoPosicionado top={35.2} left={18} value={`${membro.endereco || ''}, ${membro.numero || ''}`} />
          <CampoPosicionado top={35.2} left={70} value={membro.bairro} />
          <CampoPosicionado top={39.4} left={16} value={membro.cidade} />
          <CampoPosicionado top={39.4} left={46} value={membro.estado} />
          <CampoPosicionado top={39.4} left={65} value={membro.cep} />
          <CampoPosicionado top={43.5} left={12} value={membro.rg} />
          <CampoPosicionado top={43.5} left={40} value={membro.cpf} />
          <CampoPosicionado top={47.5} left={21} value={membro.estadoCivil} />
          <CampoPosicionado top={47.5} left={50} value={membro.celular} />
          <CampoPosicionado top={47.5} left={77} value={membro.tel} />
          <CampoPosicionado top={53.5} left={20} value={membro.filiacaoMae} />
          <CampoPosicionado top={57.5} left={18} value={membro.filiacaoPai} />
          <CampoPosicionado top={63.5} left={38} value={membro.batizadoEspiritoSanto} />
          <CampoPosicionado top={63.5} left={77} value={membro.batismoAguasData} />
          <CampoPosicionado top={67.8} left={16} value={membro.cargo} />
          <CampoPosicionado top={72} left={35} value={membro.recebidoMinisterioData} />
        </Box>
      </Box>
    </>
  );
};