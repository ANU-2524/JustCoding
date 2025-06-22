const axios = require('axios');

axios.get('https://emkc.org/api/v2/piston/runtimes')
  .then(res => {
    res.data.forEach(rt => {
      console.log(`${rt.language} → ${rt.version}`);
    });
  })
  .catch(err => {
    console.error('Failed to fetch runtimes:', err.message);
  });
