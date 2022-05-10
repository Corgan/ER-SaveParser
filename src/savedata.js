import { DataReader } from './datareader.js'
import { buf2hex } from './util.js'
import { roundtable } from './roundtable.js'
import { roundtable_names } from './roundtable_names.js'
import lookup from './lookup.js'

class SaveData {
    constructor(data) {
        let view = new DataView(data, 0x1901D04, 10);
        this.characters = new Array(10).fill(false);
        
        for(let i=0; i<10; i++) {
            if(view.getInt8(i) == 1) {
                let reader = new DataReader(this.getSlotData(data, i));
                this.characters[i] = new CharacterData(reader);
            }
        }
    }

    getSlotData(data, slot) {
        let slotStart = 0x300;
        let slotLen = 0x280010;
        let start = slotStart + (slot * slotLen);
        return data.slice(start, start + slotLen);
    }
}

class CharacterData {
    constructor(reader) {
        this.lookup = {};
        Object.defineProperty(this, 'lookup', { enumerable: false });

        reader.seek(0x10);
        this.version = reader.readInt32();
        reader.seek(0x04, true);
        this.timePlayed = reader.readInt32();
        reader.seek(0x04, true);
        console.log(this.version);
        if(this.version > 0x51) // Newer version have an extra 16 bytes of padding
            reader.seek(0x10, true);

        for(let i=0; i<0x1400; i++) { // Lookup Table
            let bytes = reader.read(0x8, false);
            if((bytes[3] == 0xC0 || bytes[3] == 0x80 || bytes[3] == 0x90)) {
                if(bytes[3] == 0x80) { // Weapons
                    let ref = reader.readUint32();
                    let data = reader.read(0x11);

                    let id = data.slice(0x0, 0x4);

                    id = new DataView(id.buffer).getUint32(0, true)
                    this.lookup[ref] = id;
                } else if(bytes[3] == 0x90) { // Armor
                    let ref = reader.readUint32();
                    let data = reader.read(0xC);

                    let id = data.slice(0x0, 0x4);
                    id[3] = 0;

                    id = new DataView(id.buffer).getUint32(0, true)
                    this.lookup[ref] = id;
                } else if(bytes[3] == 0xC0) { // Ash of War
                    let ref = reader.readUint32();
                    let data = reader.read(0x4);

                    let id = data.slice(0x0, 0x4);
                    id[3] = 0;

                    id = new DataView(id.buffer).getUint32(0, true)
                    this.lookup[ref] = id;
                }
            } else if ((bytes[0] == 0x00 && bytes[1] == 0x00 && bytes[2] == 0x00 && bytes[3] == 0x00 && bytes[4] == 0x00 && bytes[5] == 0x00 && bytes[6] == 0x00 && bytes[7] == 0x00)) {
                //Stops earlier than Expected. Shouldn't really happen unless FromSoft decides to add more random bytes in the header.
                break;
            } else {
                reader.read(0x8);
             }
        }
        reader.seek(0x8, true);

        this.stats = {};
        this.equipped = {};

        //Character Info
        this.stats.health = reader.readInt32();
        this.stats.baseMaxHealth = reader.readInt32();
        this.stats.maxHealth = reader.readInt32();
        this.stats.mana = reader.readInt32();
        this.stats.baseMaxMana = reader.readInt32();
        this.stats.maxMana = reader.readInt32();
        reader.seek(0x4, true); // Skip
        this.stats.stamina = reader.readInt32();
        this.stats.baseMaxStamina = reader.readInt32();
        this.stats.maxStamina = reader.readInt32();
        reader.seek(0x4, true); // Skip
        this.stats.vigor = reader.readInt32();
        this.stats.mind = reader.readInt32();
        this.stats.endurance = reader.readInt32();
        this.stats.strength = reader.readInt32();
        this.stats.dexterity = reader.readInt32();
        this.stats.intelligence = reader.readInt32();
        this.stats.faith = reader.readInt32();
        this.stats.arcane = reader.readInt32();
        reader.seek(0xC, true); // Skip
        this.stats.runeLevel = reader.readInt32();
        this.stats.runes = reader.readInt32();
        this.stats.runeMemory = reader.readInt32();
        reader.seek(0x4, true); // Skip
        this.stats.immunity = reader.readInt32();
        let immunity2 = reader.readInt32();
        this.stats.robustness = reader.readInt32();
        this.stats.vitality = reader.readInt32();
        let robustness2 = reader.readInt32();
        this.stats.focus = reader.readInt32();
        let focus2 = reader.readInt32();
        reader.seek(0x8, true); // Skip
        let name = new Uint16Array(reader.read(0x20).buffer);
        this.name = String.fromCharCode.apply(null, name.slice(0, name.indexOf(0)));
        reader.seek(0xFC, true); // Skip the rest for now
        reader.seek(0xD0, true); // Skip padding
        let leftWeapon1Index = reader.readInt32();
        let rightWeapon1Index = reader.readInt32();
        let leftWeapon2Index = reader.readInt32();
        let rightWeapon2Index = reader.readInt32();
        let leftWeapon3Index = reader.readInt32();
        let rightWeapon3Index = reader.readInt32();
        let arrow1Index = reader.readInt32();
        let bolt1Index = reader.readInt32();
        let arrow2Index = reader.readInt32();
        let bolt2Index = reader.readInt32();
        reader.seek(0x8, true); // Skip
        let headIndex = reader.readInt32();
        let chestIndex = reader.readInt32();
        let armsIndex = reader.readInt32();
        let legsIndex = reader.readInt32();
        reader.seek(0x4, true); // Skip
        let talisman1Index = reader.readInt32();
        let talisman2Index = reader.readInt32();
        let talisman3Index = reader.readInt32();
        let talisman4Index = reader.readInt32();
        reader.seek(0x4, true); // Skip
        this.stance = reader.readInt32();
        reader.seek(0x18, true); // Skip
        let leftWeapon1Id = reader.readInt32();
        let rightWeapon1Id = reader.readInt32();
        let leftWeapon2Id = reader.readInt32();
        let rightWeapon2Id = reader.readInt32();
        let leftWeapon3Id = reader.readInt32();
        let rightWeapon3Id = reader.readInt32();
        let arrow1Id = reader.readInt32();
        let bolt1Id = reader.readInt32();
        let arrow2Id = reader.readInt32();
        let bolt2Id = reader.readInt32();
        reader.seek(0x8, true); // Skip
        let headId = reader.readInt32();
        let chestId = reader.readInt32();
        let armsId = reader.readInt32();
        let legsId = reader.readInt32();
        reader.seek(0x4, true); // Skip
        let talisman1Id = reader.readInt32();
        let talisman2Id = reader.readInt32();
        let talisman3Id = reader.readInt32();
        let talisman4Id = reader.readInt32();
        reader.seek(0x4, true); // Skip
        let leftWeapon1Lookup = reader.readUint32();
        let rightWeapon1Lookup = reader.readUint32();
        let leftWeapon2Lookup = reader.readUint32();
        let rightWeapon2Lookup = reader.readUint32();
        let leftWeapon3Lookup = reader.readUint32();
        let rightWeapon3Lookup = reader.readUint32();
        let arrow1Lookup = reader.readInt32();
        let bolt1Lookup = reader.readInt32();
        let arrow2Lookup = reader.readInt32();
        let bolt2Lookup = reader.readInt32();
        reader.seek(0x8, true); // TODO All 0x00
        let headLookup = reader.readUint32();
        let chestLookup = reader.readUint32();
        let armsLookup = reader.readUint32();
        let legsLookup = reader.readUint32();
        reader.seek(0x4, true); // Skip
        let talisman1Lookup = reader.readUint32();
        let talisman2Lookup = reader.readUint32();
        let talisman3Lookup = reader.readUint32();
        let talisman4Lookup = reader.readUint32();
        reader.seek(0x4, true); // Skip
        
        this.inventory = {};
        this.inventory.all = [];
        let inventoryCount = reader.readInt32();
        for(let i=0; i<0xA80; i++) { // Inventory
            let item = reader.readInventoryItem(this.lookup);
            if(item.id > 0)
                this.inventory.all.push(item);
        }

        let keyitemCount = reader.readInt32();
        for(let i=0; i<0x180; i++) { // Key Items
            let item = reader.readInventoryItem(this.lookup);
            if(item.id > 0)
                this.inventory.all.push(item);
        }

        reader.seek(0x8, true); // Skip
        let equippedSpellIds = [];
        for(var i=0; i<0xC; i++) {
            let spellId = reader.readInt32();
            equippedSpellIds.push(spellId);
            reader.seek(0x4, true); // Skip
        }

        reader.seek(0xB8, true);
        this.unknownBlock = {};
        this.unknownBlockCount = reader.readInt32();
        for(var i=0; i<this.unknownBlockCount; i++) {
            let data = reader.read(0x4);
            let id = data.slice(0x0, 0x4);
            id[3] = 0;

            id = new DataView(id.buffer).getUint32(0, true)

            let value = reader.readInt32();

            this.unknownBlock[id] = value;
        }

        let leftWeapon1Id2 = reader.readInt32();
        let rightWeapon1Id2 = reader.readInt32();
        let leftWeapon2Id2 = reader.readInt32();
        let rightWeapon2Id2 = reader.readInt32();
        let leftWeapon3Id2 = reader.readInt32();
        let rightWeapon3Id2 = reader.readInt32();
        let arrow1Id2 = reader.readInt32();
        let bolt1Id2 = reader.readInt32();
        let arrow2Id2 = reader.readInt32();
        let bolt2Id2 = reader.readInt32();
        reader.seek(0x8, true); // Skip
        let headId2 = reader.readInt32NoCategory();
        let chestId2 = reader.readInt32NoCategory();
        let armsId2 = reader.readInt32NoCategory();
        let legsId2 = reader.readInt32NoCategory();
        reader.seek(0x4, true); // Skip
        let talisman1Id2 = reader.readInt32NoCategory();
        let talisman2Id2 = reader.readInt32NoCategory();
        let talisman3Id2 = reader.readInt32NoCategory();
        let talisman4Id2 = reader.readInt32NoCategory();
        reader.seek(0x4, true); // Skip
        let quick1Id = reader.readInt32NoCategory();
        let quick2Id = reader.readInt32NoCategory();
        let quick3Id = reader.readInt32NoCategory();
        let quick4Id = reader.readInt32NoCategory();
        let quick5Id = reader.readInt32NoCategory();
        let quick6Id = reader.readInt32NoCategory();
        let quick7Id = reader.readInt32NoCategory();
        let quick8Id = reader.readInt32NoCategory();
        let quick9Id = reader.readInt32NoCategory();
        let quick10Id = reader.readInt32NoCategory();
        let pouch1Id = reader.readInt32NoCategory();
        let pouch2Id = reader.readInt32NoCategory();
        let pouch3Id = reader.readInt32NoCategory();
        let pouch4Id = reader.readInt32NoCategory();
        let pouch5Id = reader.readInt32NoCategory();
        let pouch6Id = reader.readInt32NoCategory();
        reader.seek(0x4, true); // Skip
        let flask1Id = reader.readInt32NoCategory();
        let flask2Id = reader.readInt32NoCategory();
        reader.seek(0x8, true); // Skip
        console.log(reader.offset); // FACE DATA???

        const blacklist = ['Unarmed', 'Head', 'Body', 'Arms', 'Legs'];

        this.inventory.all = this.inventory.all.filter(x => x.name !== undefined && !blacklist.includes(x.name));

        this.equipped.leftWeapon1 = this.inventory.all.find(item => item.lookupId == leftWeapon1Lookup) || { name: "Unarmed" };
        this.equipped.rightWeapon1 = this.inventory.all.find(item => item.lookupId == rightWeapon1Lookup) || { name: "Unarmed" };
        this.equipped.leftWeapon2 = this.inventory.all.find(item => item.lookupId == leftWeapon2Lookup) || { name: "Unarmed" };
        this.equipped.rightWeapon2 = this.inventory.all.find(item => item.lookupId == rightWeapon2Lookup) || { name: "Unarmed" };
        this.equipped.leftWeapon3 = this.inventory.all.find(item => item.lookupId == leftWeapon3Lookup) || { name: "Unarmed" };
        this.equipped.rightWeapon3 = this.inventory.all.find(item => item.lookupId == rightWeapon3Lookup) || { name: "Unarmed" };

        this.equipped.arrow1 = this.inventory.all.find(item => item.lookupId == arrow1Lookup) || { name: "Arrow" };
        this.equipped.bolt1 = this.inventory.all.find(item => item.lookupId == bolt1Lookup) || { name: "Bolt" };
        this.equipped.arrow2 = this.inventory.all.find(item => item.lookupId == arrow2Lookup) || { name: "Arrow" };
        this.equipped.bolt2 = this.inventory.all.find(item => item.lookupId == bolt2Lookup) || { name: "Bolt" };

        this.equipped.head = this.inventory.all.find(item => item.lookupId == headLookup) || { name: "Head" };
        this.equipped.chest = this.inventory.all.find(item => item.lookupId == chestLookup) || { name: "Body" };
        this.equipped.arms = this.inventory.all.find(item => item.lookupId == armsLookup) || { name: "Arms" };
        this.equipped.legs = this.inventory.all.find(item => item.lookupId == legsLookup) || { name: "Legs" };

        this.equipped.talismans = [];
        this.equipped.talismans.push(this.inventory.all.find(item => item.id == talisman1Id && item.type == "talisman") || { name: "Talisman" });
        this.equipped.talismans.push(this.inventory.all.find(item => item.id == talisman2Id && item.type == "talisman") || { name: "Talisman" });
        this.equipped.talismans.push(this.inventory.all.find(item => item.id == talisman3Id && item.type == "talisman") || { name: "Talisman" });
        this.equipped.talismans.push(this.inventory.all.find(item => item.id == talisman4Id && item.type == "talisman") || { name: "Talisman" });

        this.equipped.quick = [];
        this.equipped.quick.push(this.inventory.all.find(item => item.id == quick1Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.all.find(item => item.id == quick2Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.all.find(item => item.id == quick3Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.all.find(item => item.id == quick4Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.all.find(item => item.id == quick5Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.all.find(item => item.id == quick6Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.all.find(item => item.id == quick7Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.all.find(item => item.id == quick8Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.all.find(item => item.id == quick9Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.all.find(item => item.id == quick10Id) || { name: "Quick Slot" });

        this.equipped.pouch = [];
        this.equipped.pouch.push(this.inventory.all.find(item => item.id == pouch1Id) || { name: "Pouch" });
        this.equipped.pouch.push(this.inventory.all.find(item => item.id == pouch2Id) || { name: "Pouch" });
        this.equipped.pouch.push(this.inventory.all.find(item => item.id == pouch3Id) || { name: "Pouch" });
        this.equipped.pouch.push(this.inventory.all.find(item => item.id == pouch4Id) || { name: "Pouch" });
        this.equipped.pouch.push(this.inventory.all.find(item => item.id == pouch5Id) || { name: "Pouch" });
        this.equipped.pouch.push(this.inventory.all.find(item => item.id == pouch6Id) || { name: "Pouch" });

        this.equipped.flask = [];
        this.equipped.flask.push(this.inventory.all.find(item => item.id == flask1Id) || { name: "Left Flask" });
        this.equipped.flask.push(this.inventory.all.find(item => item.id == flask2Id) || { name: "Right Flask" });

        this.equipped.spells = equippedSpellIds.map(spellId => this.inventory.all.find(item => item.id == spellId && item.type == "goods") || { name: "Spell Slot" });

        this.inventory.tools = this.inventory.all.filter(item => item.params.goodsType == 0 || item.params.goodsType == 3);
        this.inventory.ashes = this.inventory.all.filter(item => item.params.goodsType == 7 || item.params.goodsType == 8);
        this.inventory.crafting = this.inventory.all.filter(item => item.params.goodsType == 2);
        this.inventory.bolstering = this.inventory.all.filter(item => item.params.goodsType == 14);
        this.inventory.keyitems = this.inventory.all.filter(item => item.params.goodsType == 1 || item.params.goodsType == 10 || item.params.goodsType == 11);
        this.inventory.sorceries = this.inventory.all.filter(item => item.params.goodsType == 5 || item.params.goodsType == 17);
        this.inventory.incantations = this.inventory.all.filter(item => item.params.goodsType == 16 || item.params.goodsType == 18);
        this.inventory.ashofwar = this.inventory.all.filter(item => item.type == "ashofwar");
        this.inventory.melee = this.inventory.all.filter(item => [1,3,5,7,9,11,13,14,15,16,17,19,21,23,24,25,28,29,31,33,35,37,39,41].includes(item.params.wepType));
        this.inventory.rangedcatalyst = this.inventory.all.filter(item => [50,51,53,55,56,57,59,61].includes(item.params.wepType));
        this.inventory.arrowbolts = this.inventory.all.filter(item => [81,83,85,86].includes(item.params.wepType));
        this.inventory.shields = this.inventory.all.filter(item => [65,67,69,87].includes(item.params.wepType));
        this.inventory.head = this.inventory.all.filter(item => item.params.protectorCategory == 0);
        this.inventory.chest = this.inventory.all.filter(item => item.params.protectorCategory == 1);
        this.inventory.arms = this.inventory.all.filter(item => item.params.protectorCategory == 2);
        this.inventory.legs = this.inventory.all.filter(item => item.params.protectorCategory == 3);
        this.inventory.talismans = this.inventory.all.filter(item => item.params.accessoryCategory == 0);
        this.inventory.info = this.inventory.all.filter(item => item.params.goodsType == 12);

        this.inventory.weapons = [...this.inventory.melee, ...this.inventory.rangedcatalyst, ...this.inventory.arrowbolts, ...this.inventory.shields];
        this.inventory.armor = [...this.inventory.head, ...this.inventory.chest, ...this.inventory.arms, ...this.inventory.legs];
        this.inventory.spells = [...this.inventory.sorceries, ...this.inventory.incantations];

        this.roundTableOutputIds = {};
        this.roundTableMissingOutput = {};

        let lookupType = {};
        lookupType.weapons = "weapons"
        lookupType.armor = "armor"
        lookupType.talismans = "talismans"
        lookupType.sorceries = "goods"
        lookupType.incantations = "goods"
        lookupType.ashofwar = "ashofwar"
        lookupType.ashes = "goods"
        lookupType.keyitems = "goods"
        lookupType.tools = "goods"
        
        Object.entries(roundtable_names).forEach(([type, list]) => {
            this.roundTableOutputIds[type] = {};
            Object.entries(list).forEach(([name, checkId]) => {
                let item = lookup[lookupType[type]].find(item => item.RowName && item.RowName.toLowerCase() == name.toLowerCase());
                if(item) {
                    this.roundTableOutputIds[type][item.RowID] = list[name];
                } else {
                    this.roundTableMissingOutput[name] = type;
                }
            })
        })

        this.roundTableIds = [];
        this.roundTableMissing = {};

        Object.entries(roundtable).forEach(([type, list]) => {
            this.roundTableMissing[type] = {};
            this.inventory[type].forEach(item => {
                if(list[item.base || item.id]) {
                    this.roundTableIds.push(list[item.base || item.id]);
                } else {
                    this.roundTableMissing[type][item.id] = item.name;
                }
            })
        })

        this.roundTableExportString = JSON.stringify(this.roundTableIds);
    }
}

export { SaveData };