const fs = require('fs');
const path = require('path');

function formatSqlInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Format SQL queries in template literals
  content = content.replace(/const query = `([^`]+)`;/g, (match, sql) => {
    const formatted = formatSql(sql.trim());
    return `const query = \`\n${formatted}\n    \`;`;
  });
  
  // Format SQL queries in regular strings
  content = content.replace(/const query =\s*"([^"]+)";/g, (match, sql) => {
    const formatted = formatSql(sql.trim());
    return `const query = \`\n${formatted}\n    \`;`;
  });
  
  fs.writeFileSync(filePath, content);
}

function formatSql(sql) {
  return sql
    .replace(/SELECT\s+/gi, 'SELECT \n        ')
    .replace(/,\s*([a-zA-Z_][a-zA-Z0-9_.]*)/g, ', \n        $1')
    .replace(/\s+FROM\s+/gi, ' \n      FROM ')
    .replace(/\s+INNER\s+JOIN\s+/gi, ' \n      INNER JOIN ')
    .replace(/\s+LEFT\s+JOIN\s+/gi, ' \n      LEFT JOIN ')
    .replace(/\s+WHERE\s+/gi, ' \n      WHERE ')
    .replace(/\s+ORDER\s+BY\s+/gi, ' \n      ORDER BY ')
    .replace(/\s+GROUP\s+BY\s+/gi, ' \n      GROUP BY ')
    .split('\n')
    .map(line => '      ' + line.trim())
    .join('\n');
}

// Format the userController file
const filePath = path.join(__dirname, '../src/controllers/userController.js');
formatSqlInFile(filePath);
console.log('SQL queries formatted in userController.js');