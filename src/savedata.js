import { DataReader } from './datareader.js'
import { buf2hex } from './util.js'
import { roundtable } from './roundtable.js'
import lookup from './lookup.js'
import offsetMap from './offsets.js'
import eventFlags from './eventflags.js'

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
        this.reader = reader;

        reader.seek(0x10);
        this.version = reader.readInt32();
        reader.seek(0x04, true);
        this.timePlayed = reader.readInt32();
        reader.seek(0x04, true);

        if(this.version > 0x51) // Newer versions have an extra 16 bytes of padding
            reader.seek(0x10, true);

        for(let i=0; i<0x1400; i++) // Lookup Table
            reader.parseLookupEntry();

        reader.seek(0x8, true);

        this.internal = {};

        //Character Info
        this.internal.health = reader.readInt32();
        this.internal.baseMaxHealth = reader.readInt32();
        this.internal.maxHealth = reader.readInt32();
        this.internal.mana = reader.readInt32();
        this.internal.baseMaxMana = reader.readInt32();
        this.internal.maxMana = reader.readInt32();
        reader.seek(0x4, true); // Skip
        this.internal.stamina = reader.readInt32();
        this.internal.baseMaxStamina = reader.readInt32();
        this.internal.maxStamina = reader.readInt32();
        reader.seek(0x4, true); // Skip
        this.internal.vigor = reader.readInt32();
        this.internal.mind = reader.readInt32();
        this.internal.endurance = reader.readInt32();
        this.internal.strength = reader.readInt32();
        this.internal.dexterity = reader.readInt32();
        this.internal.intelligence = reader.readInt32();
        this.internal.faith = reader.readInt32();
        this.internal.arcane = reader.readInt32();
        reader.seek(0xC, true); // Skip
        this.internal.runeLevel = reader.readInt32();
        this.internal.runes = reader.readInt32();
        this.internal.runeMemory = reader.readInt32();
        reader.seek(0x4, true); // Skip
        this.internal.immunity = reader.readInt32();
        this.internal.immunity2 = reader.readInt32();
        this.internal.robustness = reader.readInt32();
        this.internal.vitality = reader.readInt32();
        this.internal.robustness2 = reader.readInt32();
        this.internal.focus = reader.readInt32();
        this.internal.focus2 = reader.readInt32();
        reader.seek(0x8, true); // Skip
        let name = new Uint16Array(reader.read(0x20).buffer);
        this.internal.name = String.fromCharCode.apply(null, name.slice(0, name.indexOf(0)));
        reader.seek(0xFC, true); // Skip the rest for now
        reader.seek(0xD0, true); // Skip padding
        this.internal.leftWeapon1Index = reader.readInt32();
        this.internal.rightWeapon1Index = reader.readInt32();
        this.internal.leftWeapon2Index = reader.readInt32();
        this.internal.rightWeapon2Index = reader.readInt32();
        this.internal.leftWeapon3Index = reader.readInt32();
        this.internal.rightWeapon3Index = reader.readInt32();
        this.internal.arrow1Index = reader.readInt32();
        this.internal.bolt1Index = reader.readInt32();
        this.internal.arrow2Index = reader.readInt32();
        this.internal.bolt2Index = reader.readInt32();
        reader.seek(0x8, true); // Skip
        this.internal.headIndex = reader.readInt32();
        this.internal.chestIndex = reader.readInt32();
        this.internal.armsIndex = reader.readInt32();
        this.internal.legsIndex = reader.readInt32();
        reader.seek(0x4, true); // Skip
        this.internal.talisman1Index = reader.readInt32();
        this.internal.talisman2Index = reader.readInt32();
        this.internal.talisman3Index = reader.readInt32();
        this.internal.talisman4Index = reader.readInt32();
        reader.seek(0x4, true); // Skip
        this.internal.stance = reader.readInt32();
        reader.seek(0x18, true); // Skip
        this.internal.leftWeapon1Id = reader.readInt32();
        this.internal.rightWeapon1Id = reader.readInt32();
        this.internal.leftWeapon2Id = reader.readInt32();
        this.internal.rightWeapon2Id = reader.readInt32();
        this.internal.leftWeapon3Id = reader.readInt32();
        this.internal.rightWeapon3Id = reader.readInt32();
        this.internal.arrow1Id = reader.readInt32();
        this.internal.bolt1Id = reader.readInt32();
        this.internal.arrow2Id = reader.readInt32();
        this.internal.bolt2Id = reader.readInt32();
        reader.seek(0x8, true); // Skip
        this.internal.headId = reader.readInt32();
        this.internal.chestId = reader.readInt32();
        this.internal.armsId = reader.readInt32();
        this.internal.legsId = reader.readInt32();
        reader.seek(0x4, true); // Skip
        this.internal.talisman1Id = reader.readInt32();
        this.internal.talisman2Id = reader.readInt32();
        this.internal.talisman3Id = reader.readInt32();
        this.internal.talisman4Id = reader.readInt32();
        reader.seek(0x4, true); // Skip
        this.internal.leftWeapon1Lookup = reader.readLookupEntry();
        this.internal.rightWeapon1Lookup = reader.readLookupEntry();
        this.internal.leftWeapon2Lookup = reader.readLookupEntry();
        this.internal.rightWeapon2Lookup = reader.readLookupEntry();
        this.internal.leftWeapon3Lookup = reader.readLookupEntry();
        this.internal.rightWeapon3Lookup = reader.readLookupEntry();
        this.internal.arrow1Lookup = reader.readLookupEntry();
        this.internal.bolt1Lookup = reader.readLookupEntry();
        this.internal.arrow2Lookup = reader.readLookupEntry();
        this.internal.bolt2Lookup = reader.readLookupEntry();
        reader.seek(0x8, true); // Skip
        this.internal.headLookup = reader.readLookupEntry();
        this.internal.chestLookup = reader.readLookupEntry();
        this.internal.armsLookup = reader.readLookupEntry();
        this.internal.legsLookup = reader.readLookupEntry();
        reader.seek(0x4, true); // Skip
        this.internal.talisman1Lookup = reader.readLookupEntry();
        this.internal.talisman2Lookup = reader.readLookupEntry();
        this.internal.talisman3Lookup = reader.readLookupEntry();
        this.internal.talisman4Lookup = reader.readLookupEntry();
        reader.seek(0x4, true); // Skip
        
        this.internal.inventory = [];
        this.internal.inventoryCount = reader.readInt32();
        for(let i=0; i<0xA80; i++) { // Inventory
            let item = reader.readInventoryItem();
            this.internal.inventory.push(item);
        }

        this.internal.keyitemCount = reader.readInt32();
        for(let i=0; i<0x180; i++) { // Key Items
            let item = reader.readInventoryItem();
            this.internal.inventory.push(item);
        }

        reader.seek(0x8, true); // Skip

        this.internal.equippedSpellIds = [];
        for(var i=0; i<0xC; i++) {
            let spellId = reader.readInt32();
            this.internal.equippedSpellIds.push(spellId);
            reader.seek(0x4, true); // Skip
        }

        reader.seek(0xB8, true);
        this.internal.unknownBlock = {};
        this.internal.unknownBlockCount = reader.readInt32();
        for(var i=0; i<this.internal.unknownBlockCount; i++) {
            let id = reader.readInt32NoCategory();
            let value = reader.readInt32();

            this.internal.unknownBlock[id] = value;
        }

        this.internal.leftWeapon1Id2 = reader.readInt32();
        this.internal.rightWeapon1Id2 = reader.readInt32();
        this.internal.leftWeapon2Id2 = reader.readInt32();
        this.internal.rightWeapon2Id2 = reader.readInt32();
        this.internal.leftWeapon3Id2 = reader.readInt32();
        this.internal.rightWeapon3Id2 = reader.readInt32();
        this.internal.arrow1Id2 = reader.readInt32();
        this.internal.bolt1Id2 = reader.readInt32();
        this.internal.arrow2Id2 = reader.readInt32();
        this.internal.bolt2Id2 = reader.readInt32();
        reader.seek(0x8, true); // Skip
        this.internal.headId2 = reader.readInt32NoCategory();
        this.internal.chestId2 = reader.readInt32NoCategory();
        this.internal.armsId2 = reader.readInt32NoCategory();
        this.internal.legsId2 = reader.readInt32NoCategory();
        reader.seek(0x4, true); // Skip
        this.internal.talisman1Id2 = reader.readInt32NoCategory();
        this.internal.talisman2Id2 = reader.readInt32NoCategory();
        this.internal.talisman3Id2 = reader.readInt32NoCategory();
        this.internal.talisman4Id2 = reader.readInt32NoCategory();
        reader.seek(0x4, true); // Skip
        this.internal.quick1Id = reader.readInt32NoCategory();
        this.internal.quick2Id = reader.readInt32NoCategory();
        this.internal.quick3Id = reader.readInt32NoCategory();
        this.internal.quick4Id = reader.readInt32NoCategory();
        this.internal.quick5Id = reader.readInt32NoCategory();
        this.internal.quick6Id = reader.readInt32NoCategory();
        this.internal.quick7Id = reader.readInt32NoCategory();
        this.internal.quick8Id = reader.readInt32NoCategory();
        this.internal.quick9Id = reader.readInt32NoCategory();
        this.internal.quick10Id = reader.readInt32NoCategory();
        this.internal.pouch1Id = reader.readInt32NoCategory();
        this.internal.pouch2Id = reader.readInt32NoCategory();
        this.internal.pouch3Id = reader.readInt32NoCategory();
        this.internal.pouch4Id = reader.readInt32NoCategory();
        this.internal.pouch5Id = reader.readInt32NoCategory();
        this.internal.pouch6Id = reader.readInt32NoCategory();
        reader.seek(0x4, true); // Skip
        this.internal.flask1Id = reader.readInt32NoCategory();
        this.internal.flask2Id = reader.readInt32NoCategory();
        reader.seek(0x8, true); // Skip
        reader.seek(0x12B, true); // Skip Face Data

        this.internal.storage = [];
        this.internal.storageCount = reader.readInt32();
        for(let i=0; i<0x800; i++) { // Storage
            let item = reader.readInventoryItem();
            this.internal.storage.push(item);
        }
        reader.seek(0x10C, true); // Not sure what this is

        this.internal.playRegions = {};
        this.internal.playRegionCount = reader.readInt32();
        for(let i=0; i<this.internal.playRegionCount; i++) {
            let playRegion = reader.readInt32();
            this.internal.playRegions[playRegion] = lookup.playRegion.find(p => p.RowID == playRegion);
        }

        reader.seek(0x1C629, true); // Skip this BS
        // Start of the Event Flag Block
        reader.seek(0x1C, true); // Skip unknown stuff
        this.internal.flags = {};
        reader.seek(0x419, true); // Skip unknown stuff
        let flagsOffset = reader.offset;

        let checkFlag = (flagId) => {
            let category = Math.floor(flagId / 1000);
            let subId = flagId - (category * 1000);
            if(offsetMap[category] == undefined)
                return 'invalid';
            
            let checkMask = 1 << (7 - (subId & 7));
            let shiftedOffset = subId >> 3;
            let offset = offsetMap[category] + shiftedOffset;

            reader.seek(flagsOffset + offset);

            let checkBytes = reader.readUint32(false);
            return (checkBytes & checkMask) != 0;
        }
        
        eventFlags.forEach(flag => {
            this.internal.flags[flag.id] = checkFlag(flag.id);
        });

        this.name = this.internal.name;
        this.stats = {
            health: this.internal.health,
            baseMaxHealth: this.internal.baseMaxHealth,
            maxHealth: this.internal.maxHealth,

            mana: this.internal.mana,
            baseMaxMana: this.internal.baseMaxMana,
            maxMana: this.internal.maxMana,

            stamina: this.internal.stamina,
            baseMaxStamina: this.internal.baseMaxStamina,
            maxStamina: this.internal.maxStamina,

            vigor: this.internal.vigor,
            mind: this.internal.mind,
            endurance: this.internal.endurance,
            strength: this.internal.strength,
            dexterity: this.internal.dexterity,
            intelligence: this.internal.intelligence,
            faith: this.internal.faith,
            arcane: this.internal.arcane,

            runeLevel: this.internal.runeLevel,
            runes: this.internal.runes,
            runeMemory: this.internal.runeMemory,

            immunity: this.internal.immunity,
            robustness: this.internal.robustness,
            vitality: this.internal.vitality,
            focus: this.internal.focus
        };

        const blacklist = ['Unarmed', 'Head', 'Body', 'Arms', 'Legs'];
        
        this.equipped = {};
        this.inventory = {};
        this.storage = {};

        this.inventory.all = this.internal.inventory.filter(item => item.params && item.text && !blacklist.includes(item.text.name));
        
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

        
        this.storage.all = this.internal.storage.filter(item => item.params && item.text && !blacklist.includes(item.text.name));
        
        this.storage.tools = this.storage.all.filter(item => item.params.goodsType == 0 || item.params.goodsType == 3);
        this.storage.ashes = this.storage.all.filter(item => item.params.goodsType == 7 || item.params.goodsType == 8);
        this.storage.crafting = this.storage.all.filter(item => item.params.goodsType == 2);
        this.storage.bolstering = this.storage.all.filter(item => item.params.goodsType == 14);
        this.storage.keyitems = this.storage.all.filter(item => item.params.goodsType == 1 || item.params.goodsType == 10 || item.params.goodsType == 11);
        this.storage.sorceries = this.storage.all.filter(item => item.params.goodsType == 5 || item.params.goodsType == 17);
        this.storage.incantations = this.storage.all.filter(item => item.params.goodsType == 16 || item.params.goodsType == 18);
        this.storage.ashofwar = this.storage.all.filter(item => item.type == "ashofwar");
        this.storage.melee = this.storage.all.filter(item => [1,3,5,7,9,11,13,14,15,16,17,19,21,23,24,25,28,29,31,33,35,37,39,41].includes(item.params.wepType));
        this.storage.rangedcatalyst = this.storage.all.filter(item => [50,51,53,55,56,57,59,61].includes(item.params.wepType));
        this.storage.arrowbolts = this.storage.all.filter(item => [81,83,85,86].includes(item.params.wepType));
        this.storage.shields = this.storage.all.filter(item => [65,67,69,87].includes(item.params.wepType));
        this.storage.head = this.storage.all.filter(item => item.params.protectorCategory == 0);
        this.storage.chest = this.storage.all.filter(item => item.params.protectorCategory == 1);
        this.storage.arms = this.storage.all.filter(item => item.params.protectorCategory == 2);
        this.storage.legs = this.storage.all.filter(item => item.params.protectorCategory == 3);
        this.storage.talismans = this.storage.all.filter(item => item.params.accessoryCategory == 0);
        this.storage.info = this.storage.all.filter(item => item.params.goodsType == 12);

        this.storage.weapons = [...this.storage.melee, ...this.storage.rangedcatalyst, ...this.storage.arrowbolts, ...this.storage.shields];
        this.storage.armor = [...this.storage.head, ...this.storage.chest, ...this.storage.arms, ...this.storage.legs];
        this.storage.spells = [...this.storage.sorceries, ...this.storage.incantations];

        this.equipped.leftWeapon1 = this.inventory.weapons.find(item => item.lookup.id == this.internal.leftWeapon1Lookup.id) || { name: "Unarmed" };
        this.equipped.rightWeapon1 = this.inventory.weapons.find(item => item.lookup.id == this.internal.rightWeapon1Lookup.id) || { name: "Unarmed" };
        this.equipped.leftWeapon2 = this.inventory.weapons.find(item => item.lookup.id == this.internal.leftWeapon2Lookup.id) || { name: "Unarmed" };
        this.equipped.rightWeapon2 = this.inventory.weapons.find(item => item.lookup.id == this.internal.rightWeapon2Lookup.id) || { name: "Unarmed" };
        this.equipped.leftWeapon3 = this.inventory.weapons.find(item => item.lookup.id == this.internal.leftWeapon3Lookup.id) || { name: "Unarmed" };
        this.equipped.rightWeapon3 = this.inventory.weapons.find(item => item.lookup.id == this.internal.rightWeapon3Lookup.id) || { name: "Unarmed" };

        this.equipped.arrow1 = this.inventory.arrowbolts.find(item => item.lookup.id == this.internal.arrow1Lookup.id) || { name: "Arrow" };
        this.equipped.bolt1 = this.inventory.arrowbolts.find(item => item.lookup.id == this.internal.bolt1Lookup.id) || { name: "Bolt" };
        this.equipped.arrow2 = this.inventory.arrowbolts.find(item => item.lookup.id == this.internal.arrow2Lookup.id) || { name: "Arrow" };
        this.equipped.bolt2 = this.inventory.arrowbolts.find(item => item.lookup.id == this.internal.bolt2Lookup.id) || { name: "Bolt" };

        this.equipped.head = this.inventory.armor.find(item => item.lookup.id == this.internal.headLookup.id) || { name: "Head" };
        this.equipped.chest = this.inventory.armor.find(item => item.lookup.id == this.internal.chestLookup.id) || { name: "Body" };
        this.equipped.arms = this.inventory.armor.find(item => item.lookup.id == this.internal.armsLookup.id) || { name: "Arms" };
        this.equipped.legs = this.inventory.armor.find(item => item.lookup.id == this.internal.legsLookup.id) || { name: "Legs" };

        this.equipped.talismans = [];
        this.equipped.talismans.push(this.inventory.talismans.find(item => item.id == this.internal.talisman1Id && item.type == "talisman") || { name: "Talisman" });
        this.equipped.talismans.push(this.inventory.talismans.find(item => item.id == this.internal.talisman2Id && item.type == "talisman") || { name: "Talisman" });
        this.equipped.talismans.push(this.inventory.talismans.find(item => item.id == this.internal.talisman3Id && item.type == "talisman") || { name: "Talisman" });
        this.equipped.talismans.push(this.inventory.talismans.find(item => item.id == this.internal.talisman4Id && item.type == "talisman") || { name: "Talisman" });

        this.equipped.quick = [];
        this.equipped.quick.push(this.inventory.all.find(item => item.id == this.internal.quick1Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.all.find(item => item.id == this.internal.quick2Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.all.find(item => item.id == this.internal.quick3Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.all.find(item => item.id == this.internal.quick4Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.all.find(item => item.id == this.internal.quick5Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.all.find(item => item.id == this.internal.quick6Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.all.find(item => item.id == this.internal.quick7Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.all.find(item => item.id == this.internal.quick8Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.all.find(item => item.id == this.internal.quick9Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.all.find(item => item.id == this.internal.quick10Id) || { name: "Quick Slot" });

        this.equipped.pouch = [];
        this.equipped.pouch.push(this.inventory.all.find(item => item.id == this.internal.pouch1Id) || { name: "Pouch" });
        this.equipped.pouch.push(this.inventory.all.find(item => item.id == this.internal.pouch2Id) || { name: "Pouch" });
        this.equipped.pouch.push(this.inventory.all.find(item => item.id == this.internal.pouch3Id) || { name: "Pouch" });
        this.equipped.pouch.push(this.inventory.all.find(item => item.id == this.internal.pouch4Id) || { name: "Pouch" });
        this.equipped.pouch.push(this.inventory.all.find(item => item.id == this.internal.pouch5Id) || { name: "Pouch" });
        this.equipped.pouch.push(this.inventory.all.find(item => item.id == this.internal.pouch6Id) || { name: "Pouch" });

        this.equipped.flask = [];
        this.equipped.flask.push(this.inventory.all.find(item => item.id == this.internal.flask1Id) || { name: "Left Flask" });
        this.equipped.flask.push(this.inventory.all.find(item => item.id == this.internal.flask2Id) || { name: "Right Flask" });

        this.equipped.spells = this.internal.equippedSpellIds.map(spellId => this.inventory.spells.find(item => item.id == spellId && item.type == "goods") || { name: "Spell Slot" });


    }

    exportRoundTable() {
        let roundTableIds = [];
        let roundTableMissing = {};

        Object.entries(roundtable).forEach(([type, list]) => {
            roundTableMissing[type] = {};
            this.inventory[type].forEach(item => {
                if(list[item.base || item.id]) {
                    roundTableIds.push(list[item.base || item.id]);
                } else {
                    roundTableMissing[type][item.id] = item.name;
                }
            })
        })

        return roundTableIds;
    }
}

export { SaveData };