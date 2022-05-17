import { CSV } from './csv.js'

let fixColumnName = (field) => field.replace(/ /, '');

let parseParams = async (name) => await CSV.fetch({
    url: `csv/${name}.csv`,
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
let customweapon = await parseParams('EquipParamCustomWeapon');
let armor = await parseParams('EquipParamProtector');
let goods = await parseParams('EquipParamGoods');
let talismans = await parseParams('EquipParamAccessory');
let ashofwar = await parseParams('EquipParamGem');
let mapDrops = await parseParams('ItemLotParam_map');
let playRegion = await parseParams('PlayRegionParam');
let shopInventory = await parseParams('ShopLineupParam');
let bonfireWarp = await parseParams('BonfireWarpParam');
let bonfireSubcategory = await parseParams('BonfireWarpSubcategoryParam');
let bonfireTabs = await parseParams('BonfireWarpTabParam');

let bonfire = { bonfires: bonfireWarp, subcategories: bonfireSubcategory, tabs: bonfireTabs };

let all = { weapons, customweapon, armor, goods, talismans, ashofwar, mapDrops, shopInventory, playRegion, bonfire };
export { all as default, weapons, customweapon, armor, goods, talismans, ashofwar, mapDrops, shopInventory, playRegion, bonfire };