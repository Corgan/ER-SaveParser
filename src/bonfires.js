import { bonfire } from './lookup.js'
import textlookup from './textlookup.js'

let bonfires = {};
let subcategories = {};
let tabs = {};

bonfire.tabs.forEach(tab => {
    let entry = {
        id: tab.RowID,
        name: textlookup.menu[tab.textId],
        sortId: parseInt(tab.sortId),
        iconId: parseInt(tab.iconId),
        subcategories: []
    };
    tabs[tab.RowID] = entry;
})

bonfire.subcategories.forEach(subcat => {
    let entry = {
        id: subcat.RowID,
        name: textlookup.menu[subcat.textId],
        sortId: parseInt(subcat.sortId),
        tab: tabs[subcat.tabId],
        bonfires: []
    };
    subcategories[subcat.RowID] = entry;
    tabs[subcat.tabId].subcategories.push(entry);
})

bonfire.bonfires.forEach(warp => {
    let entry = {
        id: warp.RowID,
        name: textlookup.place[warp.textId1] && textlookup.place[warp.textId1].name,
        sortId: parseInt(warp.bonfireSubCategorySortId),
        subcategory: subcategories[warp.bonfireSubCategoryId],
        eventFlag: warp.eventflagId
    };
    if(subcategories[warp.bonfireSubCategoryId]) {
        bonfires[warp.RowID] = entry;
        subcategories[warp.bonfireSubCategoryId].bonfires.push(entry);
    }
})

export { bonfires as default, bonfires, subcategories, tabs }