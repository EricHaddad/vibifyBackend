const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');

const app = express();
const port = process.env.PORT || 4000;

// Enable CORS for your React frontend
app.use(cors({ origin: 'http://localhost:3000' }));

// Route to read a file
app.get('/read-file/:filename', async (req, res) => {
  const { filename } = req.params;
  try {
    const content = await readFromFile(filename);
    res.send(content);
  } catch (error) {
    res.status(404).send('File not found');
  }
});

// Route to write a file
app.post('/write-file/:filename',express.text(), async (req, res) => {
  const { filename } = req.params;
  const content = req.body;
  try {
    await writeToFile(filename, content);
    res.send(JSON.stringify('Content written to file'));
  } catch (error) {
    res.status(500).send('Error writing to file');
  }
});

app.post('/edit-file/:filename', express.text(), async (req, res) => {
  const { filename } = req.params;
  const content = req.body;
  try {
    await editFile(filename, content);
    res.send(JSON.stringify('File Updated'));
  } catch (error) {
    res.status(500).send('Error writing to file');
  }
});

async function readFromFile(filename) {
  const filePath = `./${filename}`;
  const content = await fs.readFile(filePath, 'utf-8');
  return content;
}

async function writeToFile(filename, content) {
  const filePath = `./${filename}`;
  await fs.appendFile(filePath, content, 'utf-8');
}

async function editFile(filename, content) {
  const filePath = `./${filename}`;
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');

    const rows = fileContent.split('\n');
    const values = content.split(','); 
    const songArtist = values.slice(0, 2).join(','); 

    let rowIndex = -1;
    rows.some((row, index) => {
      if (row.startsWith(songArtist)) {
        rowIndex = index;
        return true;
      }
    });

    if (rowIndex !== -1) {
      rows[rowIndex] = replaceValuesInRow(rows[rowIndex], values);

      const updatedContent = rows.join('\n');

      await fs.writeFile(filePath, updatedContent, 'utf-8');
      
      console.log('File updated successfully!');
    } else {
      console.log('Row not found.');
    }
  } catch (error) {
    console.error('Error editing file:', error);
  }
}

function replaceValuesInRow(rowString, newValues) {
  // Splits current row into it's individual pieces
  const values = rowString.split(/,\s*(?![^\[]*])/g);
  
  for (let i = 2; i < values.length; i++) {
    // Gets rid of brackets for scores
    values[i] = values[i].substring(0, values[i].length - 1)
    // Adds user score to score list
    values[i] += ","+ newValues[i].replace(/[\[\]]/g, '');

    // Fixes error where last score list has an \n appended
    values[i] = values[i].split('\n');
    if (i === values.length - 1){
      values[i] = values[i][0]
    }
    // Adds ending bracket
    values[i] += ']';
  }

  const updatedRow = values.join(',');
  return updatedRow;
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
