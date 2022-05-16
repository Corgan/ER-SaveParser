import lookup from './lookup.js'

let flagToLoot = {};

lookup.mapDrops.forEach(drop => {
    let flag = drop.getItemFlagId;
    if(flag == 0)
        return;
    let items = [];

    for(let i=1; i<=8; i++) {
        let id = drop[`lotItemId0${i}`];
        let type = drop[`lotItemCategory0${i}`];
        let qty = drop[`lotItemNum0${i}`];
        if(id > 0 && qty > 0) {
            let item;
            switch(type) {
                case 1:
                    item = lookup.goods.find(item => item.RowID == id);
                    break;
                case 2:
                    let base = Math.trunc(id / 10000) * 10000;
                    let level = id % 100;
        
                    let weaponId = Math.trunc(id / 100) * 100;
                    item = lookup.weapons.find(item => item.RowID == weaponId);
                    break;
                case 3: 
                    item = lookup.armor.find(item => item.RowID == id);
                    break;
                case 4: 
                    item = lookup.talismans.find(item => item.RowID == id);
                    break;
                case 5: 
                    item = lookup.ashofwar.find(item => item.RowID == id);
                    break;
                case 6: 
                    item = lookup.customweapon.find(item => item.RowID == id);
                    break;
                default:
                    item = null;
                    break;
            }
            if(item != null && item.RowName != null) {
                name = item.RowName;
                items.push({
                    id: id,
                    name: name,
                    type: type,
                    qty: qty,
                })
            }
        }
    }

    if(items.length == 0)
        return;

    if(!flagToLoot[flag])
        flagToLoot[flag] = [];

    items.forEach(item => {
        if(flagToLoot[flag].find(i => i.id == item.id && i.type == item.type) == null)
            flagToLoot[flag].push(item);
    })
});

export { flagToLoot as default }