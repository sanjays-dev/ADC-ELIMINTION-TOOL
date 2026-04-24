#!/usr/bin/env node
/**
 * Test multi-language parsing
 */


console.log('\n🧪 Multi-Language Parsing Test\n');

  './demo-unused-python/app.py',
  './demo-unused-java/App.java',
];

  console.log(`\nTesting: ${filePath}`);
  console.log('─'.repeat(50));
  
  
  if (result.error) {
    console.log(`❌ Parse Error: ${result.error}`);
    continue;
  }
  
  if (!result.ast) {
    console.log('❌ No AST generated');
    continue;
  }
  
  console.log(`✅ Language: ${result.language}`);
  console.log(`✅ Items found: ${result.ast.body?.length || 0}`);
  
  if (result.ast.body) {
      console.log(`  • ${item.type}: ${item.name || item.names?.join(', ')} (line ${item.lineno})`);
    }
  }
}

console.log('\n✅ Multi-language parsing test complete!\n');
