const fs = require('fs');
const path = require('path');

const ICONS = {
  listening: `<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>`,
  speaking: `<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>`,
  reading: `<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>`,
  writing: `<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>`
};

const FILES = [
  { name: 'ListeningAssessmentSelector.js', color: 'cyan', icon: ICONS.listening },
  { name: 'SpeakingAssessmentSelector.js', color: 'violet', icon: ICONS.speaking },
  { name: 'ReadingAssessmentSelector.js', color: 'emerald', icon: ICONS.reading },
  { name: 'WritingAssessmentSelector.js', color: 'pink', icon: ICONS.writing }
];

const BUTTON_JSX_TEMPLATE = (color) => `
            <button
              key={o.id || o.route}
              onClick={() => handleStartAssessment(o.route)}
              className="group text-left bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col focus:outline-none focus:ring-4 focus:ring-${color}-100"
            >
              <div className={"h-2 " + o.color + " opacity-80 w-full rounded-t-3xl"} />

              <div className="p-5 xl:p-6 w-full flex flex-col h-full flex-grow">
                <div className="flex items-start justify-between mb-6">
                  <div className={"w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm " + o.lightColor}>
                    {o.icon}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full uppercase tracking-widest text-right">
                    {o.tag || (o.title.includes('/') ? o.title.replace(' / ', ' · ') : o.title)}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-[10px] font-black text-${color}-500 uppercase tracking-[0.2em] block w-full">
                    {o.subtitle}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-${color}-500 transition-colors leading-tight mt-1">
                    {o.title.includes('/') ? (o.subtitle.includes('Form') || o.subtitle.includes('Sheet') ? o.subtitle : o.title.split('/')[0]) : o.title}
                  </h3>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed mb-5 opacity-80 flex-grow">{o.desc}</p>

                <div className="flex items-center justify-between border-t border-slate-50 pt-6 mt-auto w-full">
                  <div className="flex items-center gap-2 text-xs font-black text-${color}-500 uppercase tracking-widest">
                    Start {selectedTerm}
                    <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-${color}-50 flex items-center justify-center group-hover:bg-${color}-500 group-hover:text-white transition-all duration-300">
                    <span className="text-[10px] font-black">{selectedTerm}</span>
                  </div>
                </div>
              </div>
            </button>
`.trim();

FILES.forEach(fileInfo => {
  const filePath = path.join('/Users/shakir/Desktop/StudentAssessment/frontend/src/pages', fileInfo.name);
  let content = fs.readFileSync(filePath, 'utf8');


  if (fileInfo.name !== 'ListeningAssessmentSelector.js') {
    const optionsMatch = content.match(/const (?:OPTIONS|options)\s*=\s*\[([\s\S]*?)\];/);
    if (optionsMatch) {
      let optionsStr = optionsMatch[1];
      let newOptionsStr = optionsStr.split('},').map(block => {
        if (!block.trim()) return block;
        let modified = block;
        if (!modified.includes('lightColor:')) {
          modified = modified.replace(/color:\s*['"](.*?)['"]/, "color: 'bg-" + fileInfo.color + "-500',\n      lightColor: 'bg-" + fileInfo.color + "-50 text-" + fileInfo.color + "-500 border-" + fileInfo.color + "-200',\n      icon: (" + fileInfo.icon + ")");
        }
        return modified;
      }).join('},');

      content = content.replace(optionsMatch[1], newOptionsStr);
    }
  }

  const renderMatch = content.match(/<button[\s\S]*?<\/button>/g);
  if (renderMatch && renderMatch.length > 0) {
    for (const match of renderMatch) {
      if (match.includes('key={o.id}') || match.includes('onClick={() => handleStartAssessment(o.route)}')) {
        content = content.replace(match, BUTTON_JSX_TEMPLATE(fileInfo.color));
        break;
      }
    }
  }

  fs.writeFileSync(filePath, content);
});

console.log('Successfully updated rendering template for all selector files');
