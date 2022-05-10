import { CSV } from './csv.js'

let fixColumnName = (field) => field.replace(/ /, '');

let parseParams = async (name) => await CSV.fetch({
    url: `params/${name}.csv`,
    delimiter: ";",
    lineterminator: "\n"
  }
).then(function(dataset) {
    return dataset.records.map(record => {
        let obj = {};
        dataset.fields.forEach((field, i) => {
            obj[fixColumnName(field)] = record[i]
        });
        return obj;
    })
});

let weapons = await parseParams('EquipParamWeapon');
let armor = await parseParams('EquipParamProtector');
let goods = await parseParams('EquipParamGoods');
let talismans = await parseParams('EquipParamAccessory');
let ashofwar = await parseParams('EquipParamGem');

let all = { weapons, armor, goods, talismans, ashofwar };
export { all as default, weapons, armor, goods, talismans, ashofwar };