const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const SIZE = 81;

function makeSvg(pathContent, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${pathContent}</svg>`;
}

const icons = {
  todo: makeSvg('<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>', '$COLOR'),
  target: makeSvg('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>', '$COLOR'),
  calendar: makeSvg('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', '$COLOR'),
  statistics: makeSvg('<line x1="3" y1="3" x2="3" y2="21"/><path d="M18 13V9"/><path d="M13 21v-6"/><path d="M8 21V7"/>', '$COLOR'),
  me: makeSvg('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', '$COLOR'),
};

const outDir = path.resolve(__dirname, '../src/assets/tab-icons');

for (const [key, svgTemplate] of Object.entries(icons)) {
  // Inactive (gray)
  const inactiveSvg = svgTemplate.replace(/\$COLOR/g, '#8b8680');
  const inactivePng = new Resvg(inactiveSvg, { fitTo: { mode: 'width', value: SIZE } }).render().asPng();
  fs.writeFileSync(path.join(outDir, `${key}.png`), inactivePng);
  console.log(`Created ${key}.png (${inactivePng.length} bytes)`);

  // Active (red)
  const activeSvg = svgTemplate.replace(/\$COLOR/g, '#d4726f');
  const activePng = new Resvg(activeSvg, { fitTo: { mode: 'width', value: SIZE } }).render().asPng();
  fs.writeFileSync(path.join(outDir, `${key}-active.png`), activePng);
  console.log(`Created ${key}-active.png (${activePng.length} bytes)`);
}

console.log('Done!');
