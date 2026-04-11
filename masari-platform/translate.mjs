import fs from 'fs';
import { translate } from '@vitalets/google-translate-api';

async function chunkList(lst, n) {
  const chunks = [];
  for (let i = 0; i < lst.length; i += n) {
    chunks.push(lst.slice(i, i + n));
  }
  return chunks;
}

async function main() {
  const filePath = 'src/data/jobs300.js';
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already translated
  if (content.includes('arTitle:')) {
    console.log('Already translated!');
    return;
  }

  const titleRegex = /title:\s*'(.*?)'/g;
  const descRegex = /description:\s*'(.*?)'/g;

  const titles = [];
  const descs = [];
  let match;

  while ((match = titleRegex.exec(content)) !== null) {
    titles.push(match[1]);
  }
  while ((match = descRegex.exec(content)) !== null) {
    descs.push(match[1]);
  }

  if (titles.length === 0) {
    console.log('No titles found.');
    return;
  }

  console.log(`Translating ${titles.length} titles and ${descs.length} descriptions...`);
  
  const arTitles = [];
  const arDescs = [];

  const titleChunks = await chunkList(titles, 30);
  for (const chunk of titleChunks) {
    const text = chunk.join('\n ||| \n');
    try {
      const res = await translate(text, { to: 'ar' });
      const parts = res.text.split('|||').map(t => t.trim());
      if (parts.length === chunk.length) {
        arTitles.push(...parts);
      } else { // fallback
        for (const item of chunk) {
          const single = await translate(item, { to: 'ar' });
          arTitles.push(single.text.trim());
        }
      }
    } catch (e) {
      console.log('Error translating titles block', e);
      for (const item of chunk) {
        const single = await translate(item, { to: 'ar' });
        arTitles.push(single.text.trim());
      }
    }
  }

  const descChunks = await chunkList(descs, 30);
  for (const chunk of descChunks) {
    const text = chunk.join('\n ||| \n');
    try {
      const res = await translate(text, { to: 'ar' });
      const parts = res.text.split('|||').map(t => t.trim());
      if (parts.length === chunk.length) {
        arDescs.push(...parts);
      } else {
        for (const item of chunk) {
          const single = await translate(item, { to: 'ar' });
          arDescs.push(single.text.trim());
        }
      }
    } catch (e) {
      console.log('Error translating descs block', e);
      for (const item of chunk) {
        const single = await translate(item, { to: 'ar' });
        arDescs.push(single.text.trim());
      }
    }
  }

  if (titles.length !== arTitles.length || descs.length !== arDescs.length) {
    console.log('Mismatch in lengths!', titles.length, arTitles.length, descs.length, arDescs.length);
    return;
  }

  let tCount = 0;
  content = content.replace(/title:\s*'(.*?)'/g, (match, p1) => {
    const t = arTitles[tCount].replace(/'/g, "\\'");
    tCount++;
    return `title: '${p1}', arTitle: '${t}'`;
  });

  let dCount = 0;
  content = content.replace(/description:\s*'(.*?)'/g, (match, p1) => {
    const d = arDescs[dCount].replace(/'/g, "\\'");
    dCount++;
    return `description: '${p1}', arDescription: '${d}'`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Success: translations added');
}

main().catch(console.error);
