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
      if(item.nodeValue == '\n') {
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

export { xml2json as default };