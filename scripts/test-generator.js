// Testovací skript pro ověření generování článků
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Načtení nastavení
const settingsPath = path.join(__dirname, '..', 'settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

console.log('=== TESTOVÁNÍ GENERÁTORU ČLÁNKŮ ===');
console.log('Nastavení:');
console.log(`- Doména: ${settings.domain}`);
console.log(`- Jazyk: ${settings.lang}`);
console.log(`- Tón: ${settings.tone}`);
console.log(`- Počet témat: ${settings.topics.length}`);
console.log('\nTémata článků:');
settings.topics.forEach((topic, index) => {
  console.log(`${index + 1}. ${topic}`);
});

// Dotaz na výběr tématu
console.log('\nPro test generování zadejte číslo tématu (1-5), nebo stiskněte Enter pro test prvního tématu:');
process.stdin.once('data', (data) => {
  let topicIndex = parseInt(data.toString().trim(), 10) - 1 || 0;
  
  if (topicIndex < 0 || topicIndex >= settings.topics.length) {
    console.log('Neplatné číslo, používám první téma.');
    topicIndex = 0;
  }
  
  console.log(`\nGeneruji testovací článek pro téma: ${settings.topics[topicIndex]}`);
  
  // Vytvořit dočasné nastavení pro test
  const testSettings = { ...settings };
  testSettings.numArticles = 1;
  testSettings.topics = [settings.topics[topicIndex]];
  
  // Uložit dočasná nastavení
  const testSettingsPath = path.join(__dirname, '..', 'test-settings.json');
  fs.writeFileSync(testSettingsPath, JSON.stringify(testSettings, null, 2));
  
  // Spustit generování
  console.log('\nSpouštím generátor...\n');
  const generateProcess = exec(`node ${path.join(__dirname, 'generate.js')} --settings=test-settings.json`, 
    { cwd: path.join(__dirname, '..') },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Chyba při generování: ${error.message}`);
        return;
      }
      
      console.log(stdout);
      if (stderr) {
        console.error(`Chyby: ${stderr}`);
      }
      
      // Odstranit dočasný soubor
      fs.unlinkSync(testSettingsPath);
      
      console.log('\n=== TESTOVÁNÍ DOKONČENO ===');
      console.log('Vygenerovaný článek byl uložen do složky content/posts/');
    }
  );
  
  // Zobrazit průběžný výstup
  generateProcess.stdout.on('data', (data) => {
    process.stdout.write(data);
  });
  
  generateProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
  });
}); 