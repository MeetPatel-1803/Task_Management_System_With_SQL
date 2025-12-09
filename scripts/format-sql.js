const fs = require("fs");
const path = require("path");

function formatSqlInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Format SQL queries in const query = ...
  content = content.replace(/const query = `([^`]+)`;/g, (match, sql) => {
    const formatted = formatSql(sql.trim());
    return `const query = \`\n${formatted}\n    \`;`;
  });

  content = content.replace(/const query =\s*"([^"]+)";/g, (match, sql) => {
    const formatted = formatSql(sql.trim());
    return `const query = \`\n${formatted}\n    \`;`;
  });

  // Format SQL in sequelize.query() calls with template literals
  content = content.replace(/sequelize\.query\(\s*`([^`]+)`/g, (match, sql) => {
    const formatted = formatSql(sql.trim());
    return `sequelize.query(\n      \`\n${formatted}\n      \``;
  });

  // Format SQL in sequelize.query() calls with strings
  content = content.replace(/sequelize\.query\(\s*"([^"]+)"/g, (match, sql) => {
    const formatted = formatSql(sql.trim());
    return `sequelize.query(\n      \`\n${formatted}\n      \``;
  });

  fs.writeFileSync(filePath, content);
}

function formatSql(sql) {
  let formatted = sql
    .replace(/SELECT\s+/gi, "SELECT \n          ")
    .replace(/,\s*(?![^(]*\))/g, ", \n          ")
    .replace(/\s+FROM\s+/gi, " \n        FROM ")
    .replace(/\s+INNER\s+JOIN\s+/gi, " \n        INNER JOIN ")
    .replace(/\s+LEFT\s+JOIN\s+/gi, " \n        LEFT JOIN ")
    .replace(/\s+WHERE\s+/gi, " \n        WHERE ")
    .replace(/\s+ORDER\s+BY\s+/gi, " \n        ORDER BY ")
    .replace(/\s+GROUP\s+BY\s+/gi, " \n        GROUP BY ");

  return formatted;
}

// Get the file path from command line argument or format all controller files
const targetFile = process.argv[2];

if (targetFile) {
  formatSqlInFile(targetFile);
  console.log(`SQL queries formatted in ${path.basename(targetFile)}`);
} else {
  // Format all controller files
  const controllersDir = path.join(__dirname, "../src/controllers");
  const files = fs.readdirSync(controllersDir);

  files.forEach((file) => {
    if (file.endsWith(".js")) {
      const filePath = path.join(controllersDir, file);
      formatSqlInFile(filePath);
    }
  });

  console.log("SQL queries formatted in all controller files");
}
