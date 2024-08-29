const fs = require('fs');
function readPosition() {
    try {
      const data = fs.readFileSync(WINDOW_POSITION_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }
  function writePosition(position) {
    fs.writeFileSync(WINDOW_POSITION_FILE, JSON.stringify(position));
  }