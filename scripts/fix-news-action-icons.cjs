const fs = require('fs');
const files = [
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/www/news.html',
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/android/app/src/main/assets/public/news.html',
];
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const constantsMarker = `  const contentItems = Array.from(document.querySelectorAll(contentSelectors));\n  const POPULAR_STORY_LIMIT = 3;`;
  const constantsReplacement = `  const contentItems = Array.from(document.querySelectorAll(contentSelectors));\n  const articleActionsTemplate = document.querySelector('.article-card .article-actions')?.outerHTML || '';\n  const listActionsTemplate = document.querySelector('.list-item .list-actions')?.outerHTML || '';\n  const POPULAR_STORY_LIMIT = 3;`;
  if (!text.includes(constantsReplacement)) {
    if (!text.includes(constantsMarker)) throw new Error('Missing constants marker in ' + file);
    text = text.replace(constantsMarker, constantsReplacement);
  }
  const oldArticle = `    const sample = document.querySelector('.article-card .article-actions');\n    const actions = sample ? sample.outerHTML : '<div class="article-actions"><button class="action-btn like-btn" type="button" aria-label="Read later">+</button><button class="action-btn save-btn" type="button" aria-label="Save">+</button></div>';`;
  const newArticle = `    const actions = articleActionsTemplate || '<div class="article-actions"></div>';`;
  if (text.includes(oldArticle)) {
    text = text.replace(oldArticle, newArticle);
  } else if (!text.includes(newArticle)) {
    throw new Error('Missing article actions block in ' + file);
  }
  const oldList = `    const sample = document.querySelector('.list-item .list-actions');\n    const actions = sample ? sample.outerHTML : '<div class="list-actions"><button class="action-btn like-btn" type="button" aria-label="Read later">+</button><button class="action-btn save-btn" type="button" aria-label="Save">+</button></div>';`;
  const newList = `    const actions = listActionsTemplate || '<div class="list-actions"></div>';`;
  if (text.includes(oldList)) {
    text = text.replace(oldList, newList);
  } else if (!text.includes(newList)) {
    throw new Error('Missing list actions block in ' + file);
  }
  fs.writeFileSync(file, text, 'utf8');
  console.log('fixed action templates', file);
}
