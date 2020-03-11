var hookshot = require('hookshot');
hookshot('refs/heads/master', 'git pull && yarn deploy').listen(3333)
