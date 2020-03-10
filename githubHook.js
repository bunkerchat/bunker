var hookshot = require('hookshot');
hookshot('refs/heads/master', 'git pull && nvm use && yarn deploy').listen(3333)
