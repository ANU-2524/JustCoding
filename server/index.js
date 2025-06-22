const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

const languageMap = {
  python:     { ext: 'py',    version: '3.10.0' },
  cpp:        { ext: 'cpp',   version: '10.2.0' },
  java:       { ext: 'java',  version: '15.0.2' },
  javascript: { ext: 'js',    version: '18.15.0' },
  typescript: { ext: 'ts',    version: '5.0.3' },
  c:          { ext: 'c',     version: '10.2.0' },
  go:         { ext: 'go',    version: '1.16.2' },
  ruby:       { ext: 'rb',    version: '3.0.1' },
  php:        { ext: 'php',   version: '8.2.3' },
  swift:      { ext: 'swift', version: '5.3.3' },
  rust:       { ext: 'rs',    version: '1.68.2' },
};

app.post('/compile', async (req, res) => {
  const { language, code, stdin } = req.body;

  const langInfo = languageMap[language];
  if (!langInfo) return res.status(400).json({ error: 'Unsupported language' });

  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language,
      version: langInfo.version,
      stdin,  
      files: [
        {
          name: `main.${langInfo.ext}`,
          content: code,
        },
      ],
    });

    const result = response.data;

    res.json({
      output: result.run.stdout || result.run.stderr || "No output",
    });
  } catch (error) {
    console.error("Piston Error:", error.response?.data || error.message);
    res.status(500).json({
      error: 'Execution failed',
      details: error.response?.data || error.message,
    });
  }
});


app.get('/', (req, res) => {
  res.send('🔥 JustCode backend running with Piston');
});

const PORT = 4334;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
