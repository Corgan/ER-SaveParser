import { weapons, armor, goods, talismans, ashes } from './lookup.js'
import { buf2hex } from './util.js'

class DataReader {
    constructor(data) {
        this.data = new Uint8Array(data);
        this.view = new DataView(data);
        this.offset = 0;
    }

    read(len, consume=true) {
        let data = this.data.slice(this.offset, this.offset + len);
        if(consume)
            this.offset += len;
        return data;
    }

    readInt32NoCategory(consume=true) {
        let data = this.data.slice(this.offset, this.offset + 0x4);
        if(data[3] == 0x10 || data[3] == 0x20 || data[3] == 0x40 || data[3] == 0x80)
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

    seek(offset, relative=false) {
        if(relative) {
            this.offset += offset;
        } else {
            this.offset = offset;
        }
    }

    readInventoryItem(lookup) {
        let ref = this.read(4, false);
        let lookupId = -1;
        let id = -1;
        let type = -1;
        let level = -1;
        if((ref[3] == 0xC0 || ref[3] == 0x80 || ref[3] == 0x90)) {
            lookupId = this.readUint32();
            id = lookup[lookupId];
            if(ref[3] == 0x80)
                type = "weapon";
            if(ref[3] == 0x90)
                type = "armor";
            if(ref[3] == 0xC0)
                type = "ash";
        } else {
            let dat = this.read(4);
            id = dat.slice(0x0, 0x4);
            if(ref[3] == 0xB0)
                type = "goods";
            if(ref[3] == 0xA0)
                type = "talisman";
            id[3] = 0;
            id = new DataView(id.buffer).getUint32(0, true)
        }
        let qty = this.readInt32();
        let handle = this.readUint32();

        let param;
        if(type == "goods")
            param = goods.find(good => good.RowID == id);
        if(type == "armor")
        param = armor.find(armor => armor.RowID == id);
        if(type == "weapon") {
            let weaponId = Math.trunc(id / 100) * 100;
            level = id % 100;
            param = weapons.find(weapon => weapon.RowID == weaponId);
        }
        if(type == "talisman")
            param = talismans.find(talisman => talisman.RowID == id);
        if(type == "ash")
            param = ashes.find(ash => ash.RowID == id);

        let name;
        if(param && param.RowName)
            name = param.RowName;
        
        let ret = { name: name, id: id, type: type, qty: qty, handle: handle, hex: buf2hex(ref.buffer), params: param };
            
        if(lookupId > -1)
            ret.lookupId = lookupId;

        if(level > -1)
            ret.level = level;
        if(type == "weapon")
            ret.base = Math.trunc(id / 10000) * 10000;
        return ret;
    }
}

export { DataReader };