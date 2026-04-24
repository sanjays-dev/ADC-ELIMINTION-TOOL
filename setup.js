
// Directory structure

// Create directories
dirs.forEach(dir => {
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created: ${dir}`);
  }
});

console.log('✓ All directories created successfully!');
