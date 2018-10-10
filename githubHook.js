var hookshot = require('hookshot');
hookshot('refs/heads/master', 'git checkout . && git pull && npm run deploy').listen(3333)
