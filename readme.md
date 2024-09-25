I use supabase and I also use cursor. I wanted to give cursor access to my supabase table schemas, so my solution was to dump the tables and RPCs from a `db dump` and split them into files, so they can be @table referenced by cursor. 

Setup: 

1. Copy one of these scripts into your repo
2. Update the supabase folder path in the script and output directory
3. Add a run command to your package.json, `"dump-tables": "node ./scripts/extractTables.js"`
4. Run the script `npm run dump-tables`