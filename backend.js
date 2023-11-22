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

async function readFromFile(filename) {
  const filePath = `./${filename}`;
  const content = await fs.readFile(filePath, 'utf-8');
  return content;
}

async function writeToFile(filename, content) {
  const filePath = `./${filename}`;
  await fs.appendFile(filePath, content, 'utf-8');
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
