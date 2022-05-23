import { weapons, armor, goods, talismans, ashofwar } from './lookup.js'
import { buf2hex } from './util.js'
import textLookup from './textlookup.js'

class DataReader {
    constructor(data) {
        this.data = new Uint8Array(data);
        this.view = new DataView(data);
        this.offset = 0;
        this.lookup = [];
        this.missedLookup = [];
    }

    read(len, consume=true) {
        let data = this.data.slice(this.offset, this.offset + len);
        if(consume)
            this.offset += len;
        return data;
    }

    readInt32NoCategory(consume=true) {
        let data = this.data.slice(this.offset, this.offset + 0x4);
        if(data[3] == 0x10 || data[3] == 0x20 || data[3] == 0x40 || data[3] == 0x80 || data[3] == 0xA0 || data[3] == 0xB0 || data[3] == 0xC0)
            data[3] = 0;

        if(consume)
            this.offset += 4;

        return new DataView(data.buffer).getInt32(0, true)
    }

    readInt32(consume=true) {
        let ret = this.view.getInt32(this.offset, true);

        if(consume)
            this.offset += 4;
        return ret;
    }

    readUint32(consume=true) {
        let ret = this.view.getUint32(this.offset, true);

        if(consume)
            this.offset += 4;
        return ret;
    }

    readInt16(consume=true) {
        let ret = this.view.getInt16(this.offset, true);

        if(consume)
            this.offset += 2;
        return ret;
    }

    readUint16(consume=true) {
        let ret = this.view.getUint16(this.offset, true);

        if(consume)
            this.offset += 2;
        return ret;
    }

    readInt8(consume=true) {
        let ret = this.view.getInt8(this.offset, true);

        if(consume)
            this.offset += 1;
        return ret;
    }

    readUint8(consume=true) {
        let ret = this.view.getUint8(this.offset, true);

        if(consume)
            this.offset += 1;
        return ret;
    }

    readRGB(consume=true) {
        let r = this.view.getUint8(this.offset, true);
        let g = this.view.getUint8(this.offset+1, true);
        let b = this.view.getUint8(this.offset+2, true);

        if(consume)
            this.offset += 3;
        return { r: r, g: g, b: b };
    }

    seek(offset, relative=false) {
        if(relative) {
            this.offset += offset;
        } else {
            this.offset = offset;
        }
    }

    parseLookupEntry() {
        let ret = { };
        let bytes = this.read(0x8, false);
        if((bytes[3] == 0xC0 || bytes[3] == 0x80 || bytes[3] == 0x90)) {
            ret.hex =  buf2hex(bytes.buffer);
            Object.defineProperty(ret, 'hex', { enumerable: false });
            ret.ref = this.readUint16();
            ret.unk = this.readUint8();
            Object.defineProperty(ret, 'unk', { enumerable: false });
            ret.type = this.readUint8();
            ret.id = this.readInt32NoCategory();
            if(bytes[3] == 0x80) { // Weapon
                let extra = this.read(0xD);
                ret.extra = buf2hex(extra.buffer);
                Object.defineProperty(ret, 'extra', { enumerable: false });
                let ashLookup = new DataView(extra.buffer).getUint16(0x8, true);
                if(ashLookup > 0)
                    ret.ashLookup = ashLookup;
            } else if(bytes[3] == 0x90) { // Armor
                ret.extra = buf2hex(this.read(0x8).buffer);
            } else if(bytes[3] == 0xC0) { // Ash of War
                // No extra bytes to read
            }
            this.lookup[ret.ref] = ret;
        } else {
            this.missedLookup.push(buf2hex(this.read(0x8).buffer));
        }
    }

    readLookupEntry() {
        let ret = { }
        ret.id = this.readUint16();
        ret.unk = this.readUint8();
        Object.defineProperty(ret, 'unk', { enumerable: false });
        ret.type = this.readUint8();
        return ret;
    }

    readInventoryItem() {
        let ret = { };

        let bytes = this.read(4, false);
        ret.hex = buf2hex(bytes.buffer);
        Object.defineProperty(ret, 'hex', { enumerable: false });

        if((bytes[3] == 0xC0 || bytes[3] == 0x80 || bytes[3] == 0x90)) {
            ret.lookup = {};
            ret.lookup.id = this.readUint16();
            ret.lookup.unk = this.readUint8();
            Object.defineProperty(ret, 'lookup', { enumerable: false });
            ret.lookup.type = this.readUint8();

            ret.lookupEntry = this.lookup[ret.lookup.id];
            Object.defineProperty(ret, 'lookupEntry', { enumerable: false });
            ret.id = ret.lookupEntry.id;
        } else {
            ret.id = this.readInt32NoCategory();
        }
        ret.qty = this.readInt32();
        ret.handle = this.readUint32();
        Object.defineProperty(ret, 'handle', { enumerable: false });

        if(bytes[3] == 0x80) {
            ret.type = "weapon";
            ret.base = Math.trunc(ret.id / 10000) * 10000;
            ret.level = ret.id % 100;

            ret.infusion = Math.trunc((ret.id % 10000) / 100);

            let weaponId = Math.trunc(ret.id / 100) * 100;
            ret.params = weapons.find(weapon => weapon.RowID == weaponId);

            if(ret.lookupEntry.ashLookup) {
                ret.ashLookup = this.lookup[ret.lookupEntry.ashLookup];
                ret.socketedAsh = ashofwar.find(ash => ash.RowID == ret.ashLookup.id);
                Object.defineProperty(ret, 'socketedAsh', { enumerable: false });
            }

            if(textLookup.weapon[weaponId])
                ret.text = textLookup.weapon[weaponId];
        }
        if(bytes[3] == 0x90) {
            ret.type = "armor";
            ret.params = armor.find(armor => armor.RowID == ret.id);

            if(textLookup.armor[ret.id])
                ret.text = textLookup.armor[ret.id];
        }
        if(bytes[3] == 0xA0) {
            ret.type = "talisman";
            ret.params = talismans.find(talisman => talisman.RowID == ret.id);

            if(textLookup.talisman[ret.id])
                ret.text = textLookup.talisman[ret.id];
        }
        if(bytes[3] == 0xB0) {
            ret.type = "goods";
            ret.params = goods.find(good => good.RowID == ret.id);
            if(ret.params && (ret.params.goodsType == 7 || ret.params.goodsType == 8))
                ret.base = Math.trunc(ret.id / 100) * 100;

            if(textLookup.good[ret.id])
                ret.text = textLookup.good[ret.id];
        }
        if(bytes[3] == 0xC0) {
            ret.type = "ashofwar";
            ret.params = ashofwar.find(ash => ash.RowID == ret.id);

            if(textLookup.ashofwar[ret.id])
                ret.text = textLookup.ashofwar[ret.id];
        }
        Object.defineProperty(ret, 'params', { enumerable: false });
        Object.defineProperty(ret, 'text', { enumerable: false });
        
        return ret;
    }
}

export { DataReader };