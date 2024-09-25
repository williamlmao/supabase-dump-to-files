const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function dumpAndExtractRPCFunctions() {
  const supabasePath = path.join(process.cwd(), 'packages', 'app', 'supabase');
  const sqlFilePath = path.join(supabasePath, 'schema.sql');
  const outputDirectory = path.join(supabasePath, 'rpc');

  // Run Supabase db dump
  console.log('Running Supabase db dump...');
  execSync('supabase db dump --local -f supabase/schema.sql', {
    cwd: supabasePath,
    stdio: 'inherit',
  });
  console.log('Supabase db dump completed.');

  // Read the SQL file
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

  // Regular expression to match CREATE FUNCTION statements
  const functionPattern =
    /CREATE OR REPLACE FUNCTION (?:"public"|public)\.?"?(\w+)"?\s*\(([\s\S]*?)\)\s*RETURNS ([\s\S]*?)(?:LANGUAGE|AS)/g;

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  let match;
  while (true) {
    match = functionPattern.exec(sqlContent);
    if (match === null) break;

    const functionName = match[1];
    const functionParams = match[2];
    const functionReturns = match[3];

    // Find the end of the function definition
    const functionStart = match.index;
    const functionEnd = sqlContent.indexOf('$$;', functionStart) + 3;
    const fullFunctionSql = sqlContent.slice(functionStart, functionEnd);

    // Write to a file, overwriting if it exists
    const outputFilePath = path.join(outputDirectory, `${functionName}.sql`);
    fs.writeFileSync(outputFilePath, fullFunctionSql);

    console.log(`RPC function '${functionName}' saved to ${outputFilePath}`);
  }
}

dumpAndExtractRPCFunctions();
