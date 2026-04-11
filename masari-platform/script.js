const fs = require('fs');
const file = 'src/pages/RoadMap.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /getAllCareers,/,
  'getAllCareers,\n  getMajorLabel,'
);

const quizRegex = /const quizQuestions = \[\s*\{[\s\S]*?\}\s*\]\s*\]/m;
content = content.replace(
  /const quizQuestions = \[\s*(?:\{\s*text:[\s\S]*?\},\s*)+\s*\]/,
  `const getQuizQuestions = (t) => Array.from({ length: 20 }, (_, i) => ({
  text: t(\`quiz.q${i + 1}\`),
  options: {
    A: t(\`quiz.q${i + 1}a\`),
    B: t(\`quiz.q${i + 1}b\`),
    C: t(\`quiz.q${i + 1}c\`),
    D: t(\`quiz.q${i + 1}d\`),
    E: t(\`quiz.q${i + 1}e\`),
  }
}))`
);

content = content.replace(
  'const isGuest = !authUser',
  'const isGuest = !authUser\n  const questions = useMemo(() => getQuizQuestions(t), [t])'
);

content = content.replace(/quizQuestions\.length/g, 'questions.length');
content = content.replace(/quizQuestions\[/g, 'questions[');

content = content.replace(
  /Hello \{userProfile\.fullName\}, \{userProfile\.major\} \| GPA: \{userProfile\.gpa\} \| Semester: \{userProfile\.semester\}/,
  "{t('roadmap.hello', { name: userProfile.fullName })}, {getMajorLabel(userProfile.major, isArabic)} | {t('roadmap.gpa')}: {userProfile.gpa} | {t('roadmap.semester')}: {userProfile.semester}"
);

content = content.replace(
  /Default Roadmap \(from settings\):/g,
  "{t('roadmap.defaultRoadmapSet')}"
);

content = content.replace(
  />\s*Yes\s*<\/button>/g,
  ">{t('roadmap.yes')}</button>"
);

content = content.replace(
  />\s*No\s*<\/button>/g,
  ">{t('roadmap.no')}</button>"
);

content = content.replace(
  />\s*Yes, start quiz\s*<\/button>/g,
  ">{t('roadmap.yesStartQuiz')}</button>"
);

content = content.replace(
  />\s*No, skip quiz\s*<\/button>/g,
  ">{t('roadmap.noSkipQuiz')}</button>"
);

content = content.replace(
  />\s*Pick from high-level technology fields\.\s*<\/p>/g,
  ">{t('roadmap.pickField')}</p>"
);

content = content.replace(
  />\s*Sort careers by\s*<\/h2>/g,
  ">{t('roadmap.sortCareersBy')}</h2>"
);

content = content.replace(
  />\s*Change field\s*<\/button>/g,
  ">{t('roadmap.changeField')}</button>"
);

content = content.replace(
  />\s*Retake quiz\s*<\/button>/g,
  ">{t('roadmap.retakeQuiz')}</button>"
);

content = content.replace(
  />\s*Sorting mode:\s*<\/p>/g,
  ">{t('roadmap.sortingMode')}</p>"
);

content = content.replace(
  /type === 'overall'\s*\?\s*'Index \(best fit\)'\s*:\s*type === 'major'\s*\?\s*'Nearest to your major'\s*:\s*type === 'preference'\s*\?\s*'Nearest to your preferences'\s*:\s*'Market demand'/g,
  "type === 'overall' ? t('roadmap.sortIndex') : type === 'major' ? t('roadmap.sortNearestMajor') : type === 'preference' ? t('roadmap.sortNearestPref') : t('roadmap.sortDemand')"
);

content = content.replace(
  />\s*Color scale explanation\s*<\/p>/g,
  ">{t('roadmap.colorScaleExpl')}</p>"
);

content = content.replace(
  />\s*Green = most suitable, Red = least suitable \(based on current sort\)\.\s*<\/p>/g,
  ">{t('roadmap.colorScaleDesc')}</p>"
);

content = content.replace(
  />\s*No careers matched yet\. Expand selection or choose a different field\/major\.\s*<\/p>/g,
  ">{t('roadmap.noCareersMatch')}</p>"
);

content = content.replace(
  /Major: \{career\.major\} • Category: \{career\.category\} • Demand: \{career\.marketDemand\}/g,
  "{t('roadmap.cardMajor')}: {getMajorLabel(career.major, isArabic)} • {t('roadmap.cardCategory')}: {career.category} • {t('roadmap.cardDemand')}: {career.marketDemand}"
);

content = content.replace(
  />Masari: The Tech & Engineering DNA Quiz<\/h2>/g,
  ">{t('roadmap.quizTitle')}</h2>"
);

content = content.replace(
  /Question \{quizStep \+ 1\} of \{questions\.length\}/g,
  "{t('roadmap.questionOf', { current: quizStep + 1, total: questions.length })}"
);

content = content.replace(
  />\s*Back\s*<\/button>/g,
  ">{t('roadmap.back')}</button>"
);

content = content.replace(
  />\s*\{quizStep === questions\.length - 1 \? 'Submit' : 'Next'\}\s*<\/button>/g,
  ">{quizStep === questions.length - 1 ? t('roadmap.submit') : t('roadmap.next')}</button>"
);

content = content.replace(
  />\s*✕ Close\s*<\/button>/g,
  ">{t('roadmap.closeBtn')}</button>"
);

content = content.replace(
  /\{showRoadmap \? 'Hide' : 'Show'\} roadmap for this job/g,
  "{showRoadmap ? t('roadmap.hide') : t('roadmap.show')} {t('roadmap.roadmapForJob')}"
);

content = content.replace(
  />\s*Roadmap Steps \(based on \{selectedMajor\} curriculum\)\s*<\/h3>/g,
  ">{t('roadmap.roadmapStepsBased', { major: selectedMajor })}</h3>"
);

content = content.replace(
  />\s*This is a simplified roadmap for the selected career with gap courses and suggested learning\.\s*<\/p>/g,
  ">{t('roadmap.roadmapStepsDesc')}</p>"
);

content = content.replace(
  /Skills: \{\(course\.skills \|\| \[\]\)\.join\(\', \'\)\}/g,
  "{t('roadmap.skillsLabel')} {(course.skills || []).join(', ')}"
);

content = content.replace(
  /\{hasRelevantSkill \? 'Targets job' : 'Foundation'\}/g,
  "{hasRelevantSkill ? t('roadmap.targetsJob') : t('roadmap.foundation')}"
);

content = content.replace(
  />\s*✔ Helps fill gap:/g,
  ">{t('roadmap.helpsFillGap')}"
);

content = content.replace(
  />\s*Career Goal\s*<\/p>/g,
  ">{t('roadmap.careerGoal')}</p>"
);

content = content.replace(
  />\s*Recommended learning to close gaps\s*<\/p>/g,
  ">{t('roadmap.recommendedLearning')}</p>"
);

content = content.replace(
  />\s*Restart Journey\s*<\/button>/g,
  ">{t('roadmap.restartJourney')}</button>"
);

fs.writeFileSync(file, content);
console.log('RoadMap.jsx updated successfully!');
