const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function dumpAndExtractTableDefinitions() {
  const supabasePath = path.join(process.cwd(), 'packages', 'app', 'supabase');
  const sqlFilePath = path.join(supabasePath, 'schema.sql');
  const outputDirectory = path.join(supabasePath, 'tables');

  // Run Supabase db dump
  console.log('Running Supabase db dump...');
  execSync('supabase db dump --local -f supabase/schema.sql', {
    cwd: supabasePath,
    stdio: 'inherit',
  });
  console.log('Supabase db dump completed.');

  // Read the SQL file
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

  // Regular expression to match CREATE TABLE statements
  const tablePattern =
    /CREATE TABLE IF NOT EXISTS "public"."(\w+)"\s*\(([\s\S]*?)\);/g;

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  let match;
  while (true) {
    match = tablePattern.exec(sqlContent);
    if (match === null) break;

    const tableName = match[1];
    const tableContent = match[2];

    // Format the table content
    const formattedContent = tableContent
      .split(',')
      .map((column) => column.trim())
      .join(',\n  ');

    // Create the full CREATE TABLE statement with better formatting
    const createTableSql = `CREATE TABLE IF NOT EXISTS "public"."${tableName}" (\n  ${formattedContent}\n);`;

    // Write to a file, overwriting if it exists
    const outputFilePath = path.join(outputDirectory, `${tableName}.sql`);
    fs.writeFileSync(outputFilePath, createTableSql);

    console.log(`Table '${tableName}' definition saved to ${outputFilePath}`);
  }
}

dumpAndExtractTableDefinitions();
