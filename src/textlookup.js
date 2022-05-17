import xml2json from './xml2json.js'

let getEntries = async(name) => {
    let resp = await fetch(`xml/${name}.fmg.xml`)
    let xmlString = await resp.text();
    let XmlNode = new DOMParser().parseFromString(xmlString, 'text/xml');
    let parsed = xml2json(XmlNode);
    if(parsed.fmg)
        return parsed.fmg.entries.text;
    return [];
}

let generateTextLookup = async (name, subtypes=['']) => {
    let ret = {};
    for(let i=0; i<subtypes.length; i++) {
        let subtype = subtypes[i];
        let entries = await getEntries(`${name}${subtype}`);
        entries.forEach(entry => {
            if(entry.text == '%null%' || entry.text.trim() == '')
                return;
            if(!ret[entry.id])
                ret[entry.id] = {};
            if(subtype != '') {
                ret[entry.id][subtype.toLowerCase()] = entry.text;
            } else {
                ret[entry.id] = entry.text;
            }
        })
    }
    return ret;
}

let talisman = await generateTextLookup('Accessory', ['Name', 'Caption', 'Info']);
let weaponart = await generateTextLookup('Arts', ['Name', 'Caption']);
let ashofwar = await generateTextLookup('Gem', ['Name', 'Caption', 'Info']);
let good = await generateTextLookup('Goods', ['Name', 'Caption', 'Info', 'Info2', 'Dialog']);
let npc = await generateTextLookup('Npc', ['Name']);
let place = await generateTextLookup('Place', ['Name']);
let armor = await generateTextLookup('Protector', ['Name', 'Caption', 'Info']);
//let talk = await generateTextLookup('TalkMsg');
let menu = await generateTextLookup('GR_MenuText');
let weapon = await generateTextLookup('Weapon', ['Name', 'Caption', 'Effect', 'Info']);

let all = { talisman, weaponart, ashofwar, good, npc, place, armor, menu, weapon };
export { all as default, talisman, weaponart, ashofwar, good, npc, place, armor, menu, weapon };