import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {geoNaturalEarth1,geoPath,geoGraticule10} from 'd3-geo';
const source='https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_admin_0_countries.geojson';
const expected='6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f';
const raw=process.argv[2]?await readFile(process.argv[2]):Buffer.from(await (await fetch(source)).arrayBuffer());
if(createHash('sha256').update(raw).digest('hex')!==expected)throw Error('Map source checksum mismatch');
const data=JSON.parse(raw);
data.features=data.features.filter(f=>f.properties.ISO_A2_EH!=='AQ');
const projection=geoNaturalEarth1().fitExtent([[20,18],[940,455]],data);
const path=geoPath(projection).digits(1);
const countries=data.features.map(f=>({
 code:/^[A-Z]{2}$/.test(f.properties.ISO_A2_EH)?f.properties.ISO_A2_EH:'',
 name:f.properties.NAME_EN,
 path:path(f)
}));
const map={width:960,height:480,countries,graticule:path(geoGraticule10())};
await writeFile(new URL('../src/world-map.mjs',import.meta.url),'// Generated with scripts/build-map.mjs. Natural Earth v5.1.2; public domain.\nexport const worldMap = '+JSON.stringify(map)+';\n');
console.log('Generated '+countries.length+' geographic shapes ('+JSON.stringify(map).length+' bytes), no runtime map dependencies.');
