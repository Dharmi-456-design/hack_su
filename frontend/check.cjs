const fs = require('fs');
const babel = require('@babel/parser');

try {
  const code = fs.readFileSync(process.argv[2], 'utf8');
  babel.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log('✅ Parsed successfully');
} catch (e) {
  console.log(`❌ Syntax Error at line ${e.loc?.line}, col ${e.loc?.column}`);
  console.log(e.message);
}
