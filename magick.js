const gm = require('gm');
const fs = require('fs');
const { DOMParser } = require('xmldom')


const layouts = fs.readdirSync('images2').filter(file => file.endsWith('.layout'));


layouts.forEach(layout => {
  let xmlString = fs.readFileSync(`images2/${layout}`, {encoding: 'utf8'});
  let XmlNode = new DOMParser().parseFromString(xmlString, 'text/xml');
  let parsed = xml2json(XmlNode);
  if(parsed.TextureAtlas) {
    let src = `images2\\${parsed.TextureAtlas.imagePath}`;
    console.log(src);

    if(!Array.isArray(parsed.TextureAtlas.SubTexture))
      parsed.TextureAtlas.SubTexture = [parsed.TextureAtlas.SubTexture]

    parsed.TextureAtlas.SubTexture.forEach(sub => {
      let { name, x, y, width, height } = sub;
      gm(src).crop(width, height, x, y).write(`images\\${name}`, (err) => {
        if(err)
          console.log(name, sub, err);
      });
    })
  }
})



function xml2json(xml) {
  let obj = {};

  if (xml.nodeType === 1) {
    if (xml.attributes.length > 0) {
      for (let j = 0; j < xml.attributes.length; j += 1) {
        const attribute = xml.attributes.item(j);
        obj[attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3) {
    obj = xml.nodeValue;
  }

  if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3 && xml.attributes.length == 0) {
    obj = xml.childNodes[0].nodeValue;
  } else if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i += 1) {
      const item = xml.childNodes.item(i);
      let nodeName = item.nodeName;
      if(nodeName == '#text')
        nodeName = 'text';
      if(item.nodeValue && item.nodeValue.trim() == '') {
      } else if (typeof (obj[nodeName]) === 'undefined') {
        obj[nodeName] = xml2json(item);
      } else {
        if (typeof (obj[nodeName].push) === 'undefined') {
          const old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xml2json(item));
      }
    }
  }
  return obj;
}