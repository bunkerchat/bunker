var hookshot = require('hookshot');
hookshot('refs/heads/master', 'git pull && npm run build && stop bunkerchat && start bunkerchat').listen(3333)