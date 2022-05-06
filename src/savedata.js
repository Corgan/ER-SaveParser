import { DataReader } from './datareader.js'
import { buf2hex } from './util.js'

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

        reader.seek(0x18);
        this.timePlayed = reader.readInt32();
        reader.seek(0x30);

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
                //Stops earlier than Expected. Pre-1.04 saves have 2 less lookup slots... Hope they don't keep increasing them :)
                break;
            } else {
                reader.read(0x8);
             }
        }
        reader.seek(0x8, true);

        //Character Info
        this.health = reader.readInt32();
        this.baseMaxHealth = reader.readInt32();
        this.maxHealth = reader.readInt32();
        this.mana = reader.readInt32();
        this.baseMaxMana = reader.readInt32();
        this.maxMana = reader.readInt32();
        reader.seek(0x4, true); // Skip
        this.stamina = reader.readInt32();
        this.baseMaxStamina = reader.readInt32();
        this.maxStamina = reader.readInt32();
        reader.seek(0x4, true); // Skip
        this.vigor = reader.readInt32();
        this.mind = reader.readInt32();
        this.endurance = reader.readInt32();
        this.strength = reader.readInt32();
        this.dexterity = reader.readInt32();
        this.intelligence = reader.readInt32();
        this.faith = reader.readInt32();
        this.arcane = reader.readInt32();
        reader.seek(0xC, true); // Skip
        this.runeLevel = reader.readInt32();
        this.runes = reader.readInt32();
        this.runeMemory = reader.readInt32();
        reader.seek(0x4, true); // Skip
        this.unk1 = reader.readInt32(); // These are likely resistances?
        this.unk2 = reader.readInt32();
        this.unk3 = reader.readInt32();
        this.unk4 = reader.readInt32();
        this.unk5 = reader.readInt32();
        this.unk6 = reader.readInt32();
        this.unk7 = reader.readInt32();
        reader.seek(0x8, true); // Skip
        let name = new Uint16Array(reader.read(0x20).buffer);
        this.name = String.fromCharCode.apply(null, name.slice(0, name.indexOf(0)));
        reader.seek(0xFC, true); // Skip the rest for now
        reader.seek(0xD0, true); // Skip padding
        this.leftWeapon1Index = reader.readInt32();
        this.rightWeapon1Index = reader.readInt32();
        this.leftWeapon2Index = reader.readInt32();
        this.rightWeapon2Index = reader.readInt32();
        this.leftWeapon3Index = reader.readInt32();
        this.rightWeapon3Index = reader.readInt32();
        this.arrow1Index = reader.readInt32();
        this.bolt1Index = reader.readInt32();
        this.arrow2Index = reader.readInt32();
        this.bolt2Index = reader.readInt32();
        reader.seek(0x8, true); // Skip
        this.headIndex = reader.readInt32();
        this.chestIndex = reader.readInt32();
        this.armsIndex = reader.readInt32();
        this.legsIndex = reader.readInt32();
        reader.seek(0x4, true); // Skip
        this.ring1Index = reader.readInt32();
        this.ring2Index = reader.readInt32();
        this.ring3Index = reader.readInt32();
        this.ring4Index = reader.readInt32();
        reader.seek(0x4, true); // Skip
        this.stance = reader.readInt32();
        reader.seek(0x18, true); // Skip
        this.leftWeapon1Id = reader.readInt32();
        this.rightWeapon1Id = reader.readInt32();
        this.leftWeapon2Id = reader.readInt32();
        this.rightWeapon2Id = reader.readInt32();
        this.leftWeapon3Id = reader.readInt32();
        this.rightWeapon3Id = reader.readInt32();
        this.arrow1Id = reader.readInt32();
        this.bolt1Id = reader.readInt32();
        this.arrow2Id = reader.readInt32();
        this.bolt2Id = reader.readInt32();
        reader.seek(0x8, true); // Skip
        this.headId = reader.readInt32();
        this.chestId = reader.readInt32();
        this.armsId = reader.readInt32();
        this.legsId = reader.readInt32();
        reader.seek(0x4, true); // Skip
        this.ring1Id = reader.readInt32();
        this.ring2Id = reader.readInt32();
        this.ring3Id = reader.readInt32();
        this.ring4Id = reader.readInt32();
        reader.seek(0x4, true); // Skip
        this.leftWeapon1Lookup = reader.readUint32();
        this.rightWeapon1Lookup = reader.readUint32();
        this.leftWeapon2Lookup = reader.readUint32();
        this.rightWeapon2Lookup = reader.readUint32();
        this.leftWeapon3Lookup = reader.readUint32();
        this.rightWeapon3Lookup = reader.readUint32();
        this.arrow1Lookup = reader.readInt32();
        this.bolt1Lookup = reader.readInt32();
        this.arrow2Lookup = reader.readInt32();
        this.bolt2Lookup = reader.readInt32();
        reader.seek(0x8, true); // TODO All 0x00
        this.headLookup = reader.readUint32();
        this.chestLookup = reader.readUint32();
        this.armsLookup = reader.readUint32();
        this.legsLookup = reader.readUint32();
        reader.seek(0x4, true); // Skip
        this.ring1Lookup = reader.readUint32();
        this.ring2Lookup = reader.readUint32();
        this.ring3Lookup = reader.readUint32();
        this.ring4Lookup = reader.readUint32();
        reader.seek(0x4, true); // Skip
        
        this.inventoryCount = reader.readInt32();
        this.inventory = [];
        for(let i=0; i<0xA80; i++) { // Inventory
            let item = reader.readInventoryItem(this.lookup);
            if(item.id > 0)
                this.inventory.push(item);
        }

        this.keyitems = [];
        this.keyitemCount = reader.readInt32();
        for(let i=0; i<0x180; i++) { // Key Items
            let item = reader.readInventoryItem(this.lookup);
            if(item.id > 0)
                this.keyitems.push(item);
        }
        reader.seek(0x8, true); // Skip
        this.spellIds = [];
        for(var i=0; i<0xC; i++) {
            let spellId = reader.readInt32();
            this.spellIds.push(spellId);
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

        this.leftWeapon1Id2 = reader.readInt32();
        this.rightWeapon1Id2 = reader.readInt32();
        this.leftWeapon2Id2 = reader.readInt32();
        this.rightWeapon2Id2 = reader.readInt32();
        this.leftWeapon3Id2 = reader.readInt32();
        this.rightWeapon3Id2 = reader.readInt32();
        this.arrow1Id2 = reader.readInt32();
        this.bolt1Id2 = reader.readInt32();
        this.arrow2Id2 = reader.readInt32();
        this.bolt2Id2 = reader.readInt32();
        reader.seek(0x8, true); // Skip
        this.headId2 = reader.readInt32NoCategory();
        this.chestId2 = reader.readInt32NoCategory();
        this.armsId2 = reader.readInt32NoCategory();
        this.legsId2 = reader.readInt32NoCategory();
        reader.seek(0x4, true); // Skip
        this.ring1Id2 = reader.readInt32NoCategory();
        this.ring2Id2 = reader.readInt32NoCategory();
        this.ring3Id2 = reader.readInt32NoCategory();
        this.ring4Id2 = reader.readInt32NoCategory();
        reader.seek(0x4, true); // Skip
        this.quick1ID = reader.readInt32NoCategory();
        this.quick2ID = reader.readInt32NoCategory();
        this.quick3ID = reader.readInt32NoCategory();
        this.quick4ID = reader.readInt32NoCategory();
        this.quick5ID = reader.readInt32NoCategory();
        this.quick6ID = reader.readInt32NoCategory();
        this.quick7ID = reader.readInt32NoCategory();
        this.quick8ID = reader.readInt32NoCategory();
        this.quick9ID = reader.readInt32NoCategory();
        this.quick10ID = reader.readInt32NoCategory();
        this.pouch1ID = reader.readInt32NoCategory();
        this.pouch2ID = reader.readInt32NoCategory();
        this.pouch3ID = reader.readInt32NoCategory();
        this.pouch4ID = reader.readInt32NoCategory();
        this.pouch5ID = reader.readInt32NoCategory();
        this.pouch6ID = reader.readInt32NoCategory();
        reader.seek(0x4, true); // Skip
        this.flask1ID = reader.readInt32NoCategory();
        this.flask2ID = reader.readInt32NoCategory();
        reader.seek(0x8, true); // Skip
        console.log(reader.offset); // FACE DATA???

        this.leftWeapon1 = this.inventory.find(item => item.lookupId == this.leftWeapon1Lookup);
        this.rightWeapon1 = this.inventory.find(item => item.lookupId == this.rightWeapon1Lookup);
        this.leftWeapon2 = this.inventory.find(item => item.lookupId == this.leftWeapon2Lookup);
        this.rightWeapon2 = this.inventory.find(item => item.lookupId == this.rightWeapon2Lookup);
        this.leftWeapon3 = this.inventory.find(item => item.lookupId == this.leftWeapon3Lookup);
        this.rightWeapon3 = this.inventory.find(item => item.lookupId == this.rightWeapon3Lookup);

        this.head = this.inventory.find(item => item.lookupId == this.headLookup);
        this.chest = this.inventory.find(item => item.lookupId == this.chestLookup);
        this.arms = this.inventory.find(item => item.lookupId == this.armsLookup);
        this.legs = this.inventory.find(item => item.lookupId == this.legsLookup);

        this.spells = this.spellIds.filter(spellId => spellId != -1).map(spellId => this.inventory.find(item => item.id == spellId && item.type == "goods"))
    }
}

export { SaveData };