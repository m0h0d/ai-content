import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';

// Převést exec na promise-based funkci
const execPromise = promisify(exec);

// Definice dnů v týdnu
const DAYS_OF_WEEK = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
];

export async function GET() {
  try {
    // Získat aktuální den a čas v české časové zóně
    const now = new Date();
    const czechTime = new Intl.DateTimeFormat('cs-CZ', {
      timeZone: 'Europe/Prague',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);
    
    // Získat den v týdnu (0 = neděle, 1 = pondělí, ..., 6 = sobota)
    const dayOfWeek = now.getDay();
    const dayName = DAYS_OF_WEEK[dayOfWeek];

    // Načíst nastavení
    const settingsPath = path.join(process.cwd(), 'settings.json');
    const settingsContent = await fs.readFile(settingsPath, 'utf-8');
    const settings = JSON.parse(settingsContent);

    // Zkontrolovat, zda má být dnes publikován článek
    if (!settings.schedule || !settings.schedule[dayName]) {
      return NextResponse.json({
        success: false,
        message: `Žádný naplánovaný článek pro dnešní den (${dayName}).`
      });
    }

    // Získat naplánovaný čas pro dnešní den
    const scheduledTime = settings.schedule[dayName].time;
    const topicIndex = settings.schedule[dayName].topic_index;
    
    // Formátovat aktuální čas pro porovnání (odstranit sekundy)
    const formattedCurrentTime = czechTime.substring(0, 5);
    
    // Pokud je čas spuštění, generovat článek
    if (formattedCurrentTime === scheduledTime) {
      // Připravit aktualizovaná nastavení pro generování konkrétního tématu
      const tempSettings = { ...settings };
      
      // Nastavit generování pouze jednoho článku
      tempSettings.numArticles = 1;
      
      // Vybrat konkrétní téma podle indexu
      if (settings.topics && settings.topics.length > topicIndex) {
        tempSettings.topics = [settings.topics[topicIndex]];
      }
      
      // Uložit dočasná nastavení
      const tempSettingsPath = path.join(process.cwd(), 'temp-settings.json');
      await fs.writeFile(tempSettingsPath, JSON.stringify(tempSettings, null, 2));
      
      // Spustit generování článku
      const { stdout, stderr } = await execPromise('cd .. && node scripts/generate.js --settings=temp-settings.json');
      
      // Odstranit dočasný soubor nastavení
      await fs.unlink(tempSettingsPath).catch(() => {});
      
      return NextResponse.json({
        success: true,
        message: `Úspěšně vygenerován článek pro den ${dayName} v čase ${scheduledTime}`,
        topic: tempSettings.topics[0],
        stdout,
        stderr
      });
    }
    
    return NextResponse.json({
      success: false,
      message: `Není čas pro publikování (aktuální: ${formattedCurrentTime}, naplánovaný: ${scheduledTime}).`
    });
    
  } catch (error: any) {
    console.error('Chyba při zpracování cron jobu:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Neznámá chyba při zpracování cron jobu',
    }, { status: 500 });
  }
}

// Značka pro Vercel Cron
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minut 