const fs = require('fs');
const path = require('path');

const oldFilePath = path.join(__dirname, 'src', 'data', 'harpa.json');
const newFilePath = path.join(__dirname, 'src', 'data', 'harpa_corrigido.json');

console.log('Iniciando a conversão do arquivo da Harpa...');

try {
  const oldFileContent = fs.readFileSync(oldFilePath, 'utf-8');
  const oldDataObject = JSON.parse(oldFileContent);

  if (typeof oldDataObject !== 'object' || Array.isArray(oldDataObject)) {
    throw new Error('O arquivo original não é um objeto.');
  }

  // Itera sobre as chaves do objeto (ex: "1", "2", "3"...)
  const newDataArray = Object.keys(oldDataObject).map(hymnId => {
    const hymnData = oldDataObject[hymnId];
    
    // Pega o título e remove o número do início (ex: "1 - Chuvas de Graça" -> "Chuvas de Graça")
    const title = (hymnData.hino || '').replace(/^\d+\s*-\s*/, '').trim();

    // Monta as estrofes
    const stanzas = [];
    if (hymnData.verses) {
      // Adiciona as estrofes numeradas
      Object.keys(hymnData.verses).sort().forEach(verseKey => {
        if (verseKey !== 'coro') {
          stanzas.push(hymnData.verses[verseKey].split('<br>').map(line => line.trim()));
        }
      });
    }
    // Adiciona o coro no final, se existir
    if (hymnData.coro) {
        stanzas.push(hymnData.coro.split('<br>').map(line => line.trim()));
    }

    return {
      id: Number(hymnId),
      title: title,
      estrofes: stanzas
    };
  });

  fs.writeFileSync(newFilePath, JSON.stringify(newDataArray, null, 2));

  console.log(`\nConversão concluída com sucesso!`);
  console.log(`Um novo arquivo foi criado em: ${newFilePath}`);
  console.log(`\nPróximos passos:`);
  console.log(`1. Renomeie o arquivo original 'harpa.json' para 'harpa_antigo.json' (como backup).`);
  console.log(`2. Renomeie o novo arquivo 'harpa_corrigido.json' para 'harpa.json'.`);

} catch (error) {
  console.error('\nOcorreu um erro durante a conversão:', error.message);
}