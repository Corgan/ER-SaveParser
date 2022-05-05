import { DataReader } from './datareader.js'

class SaveData {
    constructor(data) {
        let view = new DataView(data, 0x1901D04, 10);
        this.characters = new Array(10);
        
        for(let i=0; i<10; i++) {
            if(view.getInt8(i) == 1) {
                this.characters[i] = new CharacterData(this.getSlotData(data, i));
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
    constructor(data) {
        let reader = new DataReader(data);
        this.lookup = {};
        Object.defineProperty(this, 'lookup', { enumerable: false });
        this.inventory = [];
        this.keyitems = [];

        reader.seek(0x18);
        this.timePlayed = reader.readInt32();
        reader.seek(0x30);

        let stopReading = false;
        while(!stopReading) {
            let bytes = reader.read(0x8, false);
            if((bytes[0] == 0x00 && bytes[1] == 0x00 && bytes[2] == 0x00 && bytes[3] == 0x00
             && bytes[4] == 0x00 && bytes[5] == 0x00 && bytes[6] == 0x00 && bytes[7] == 0x00))
             {
                 reader.read(0x8);
                 stopReading = true;
             } else if(bytes[0] == 0x00 && bytes[1] == 0x00 && bytes[2] == 0x00 && bytes[3] == 0x00
                    && bytes[4] == 0xFF && bytes[5] == 0xFF && bytes[6] == 0xFF && bytes[7] == 0xFF) {
                reader.read(0x8);
             } else if((bytes[3] == 0xC0 || bytes[3] == 0x80 || bytes[3] == 0x90)) {
                if(bytes[3] == 0xC0) {
                    let ref = reader.readUint32();
                    let dat = reader.read(0x4);
                    let id = dat.slice(0x0, 0x4);
                    id[3] = 0;
                    id = new DataView(id.buffer).getUint32(0, true)
                    this.lookup[ref] = id;
                } else if(bytes[3] == 0x80) {
                    let ref = reader.readUint32();
                    let dat = reader.read(0x11);
                    let id = dat.slice(0x0, 0x4);
                    id = new DataView(id.buffer).getUint32(0, true)
                    this.lookup[ref] = id;
                } else if(bytes[3] == 0x90) {
                    let ref = reader.readUint32();
                    let dat = reader.read(0xC);
                    let id = dat.slice(0x0, 0x4);
                    id[3] = 0;
                    id = new DataView(id.buffer).getUint32(0, true)
                    this.lookup[ref] = id;
                }
             } else {
                 console.log(buf2hex(bytes.buffer));
                 reader.read(0x8);
             }
        }
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
        reader.seek(0x18, true); // TODO Quick Slots?
        reader.seek(0x18, true); // TODO All 0x00
        reader.seek(0x10, true); // TODO Gestures?
        reader.seek(0x4, true); // Skip
        reader.seek(0x10, true); // TODO DPad Slots?
        reader.seek(0x4, true); // Skip
        this.inventoryCount = reader.readInt32();
        for(let i=0; i<0xA80; i++) { // Inventory
            let item = reader.readInventoryItem(this.lookup);
            if(item.id > 0)
                this.inventory.push(item);
        }
        this.keyitemCount = reader.readInt32();
        for(let i=0; i<0x180; i++) { // Key Items
            let item = reader.readInventoryItem(this.lookup);
            if(item.id > 0)
                this.keyitems.push(item);
        }
        reader.seek(0x8, true); // Skip
        this.spells = [];
        for(var i=0; i<12; i++) {
            this.spells.push(reader.readInt32());
            reader.seek(0x4, true); // Skip
        }
        console.log(reader.offset);
    }
}

export { SaveData };