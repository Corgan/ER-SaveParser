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
        Object.defineProperty(this, 'reader', { enumerable: false });

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

        Object.defineProperty(this, 'internal', { enumerable: false });
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
        this.internal.nameBuffer = name;
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

        //Start Character Customization Data
        reader.read(0x4, true); // FACE
        //reader.seek(0x127, true); // Skip Face Data

        this.internal.customization = {}
        this.internal.customization.AlterBody = {}
        this.internal.customization.AlterFaceAndHair = {}
        this.internal.customization.AlterFaceAndHair.FaceTemplate = {}
        this.internal.customization.AlterFaceAndHair.FaceStructure = {}
        this.internal.customization.AlterFaceAndHair.FaceStructure.FacialBalance = {}
        this.internal.customization.AlterFaceAndHair.FaceStructure.ForeheadGlabella = {}
        this.internal.customization.AlterFaceAndHair.FaceStructure.BrowRidge = {}
        this.internal.customization.AlterFaceAndHair.FaceStructure.Eyes = {}
        this.internal.customization.AlterFaceAndHair.FaceStructure.NoseRidge = {}
        this.internal.customization.AlterFaceAndHair.FaceStructure.Nostrils = {}
        this.internal.customization.AlterFaceAndHair.FaceStructure.Cheeks = {}
        this.internal.customization.AlterFaceAndHair.FaceStructure.Lips = {}
        this.internal.customization.AlterFaceAndHair.FaceStructure.Mouth = {}
        this.internal.customization.AlterFaceAndHair.FaceStructure.Chin = {}
        this.internal.customization.AlterFaceAndHair.FaceStructure.Jaw = {}
        this.internal.customization.AlterFaceAndHair.Hair = {}
        this.internal.customization.AlterFaceAndHair.Eyebrows = {}
        this.internal.customization.AlterFaceAndHair.FacialHair = {}
        this.internal.customization.AlterFaceAndHair.Eyelashes = {}
        this.internal.customization.AlterFaceAndHair.Eyes = {}
        this.internal.customization.AlterFaceAndHair.SkinFeatures = {}
        this.internal.customization.AlterFaceAndHair.Cosmetics = {}
        this.internal.customization.AlterFaceAndHair.TattooMarkEyepatch = {}
        this.internal.customization.AlterFaceAndHair.TattooMarkEyepatch.TweakTattooMark = {}

        reader.seek(0x8, true); // Skip
        this.internal.customization.BaseStructure = reader.readUint8();
        reader.seek(0xB, true); // Skip
        this.internal.customization.AlterFaceAndHair.Eyebrows.Brow = reader.readUint8();
        reader.seek(0x3, true); // Skip
        this.internal.customization.AlterFaceAndHair.FacialHair.Beard = reader.readUint8();
        reader.seek(0x3, true); // Skip
        this.internal.customization.AlterFaceAndHair.TattooMarkEyepatch.Eyepatch = reader.readUint8();
        reader.seek(0x3, true); // Skip
        this.internal.customization.AlterFaceAndHair.TattooMarkEyepatch.TattooMark = reader.readUint8();
        reader.seek(0x3, true); // Skip
        this.internal.customization.AlterFaceAndHair.Eyelashes.Eyelashes = reader.readUint8();
        reader.seek(0x3, true); // Skip
        this.internal.customization.AlterFaceAndHair.FaceTemplate.ApparentAge = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceTemplate.FacialAesthetic = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceTemplate.FormEmphasis = reader.readUint8();
        reader.seek(0x1, true); // Skip
        this.internal.customization.AlterFaceAndHair.FaceStructure.BrowRidge.BrowRidgeHeight = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.BrowRidge.InnerBrowRidge = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.BrowRidge.OuterBrowRidge = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Cheeks.CheekboneHeight = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Cheeks.CheekboneDepth = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Cheeks.CheekboneWidth = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Cheeks.CheekboneProtrusion = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Cheeks.Cheeks = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Chin.ChinTipPosition = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Chin.ChinLength = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Chin.ChinProtrusion = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Chin.ChinDepth = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Chin.ChinSize = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Chin.ChinHeight = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Chin.ChinWidth = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Eyes.EyePosition = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Eyes.EyeSize = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Eyes.EyeSlant = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Eyes.EyeSpacing = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.FacialBalance.NoseSize = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.FacialBalance.NoseForeheadRatio = reader.readUint8();
        reader.seek(0x1, true); // Skip
        this.internal.customization.AlterFaceAndHair.FaceStructure.FacialBalance.FaceProtrusion = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.FacialBalance.VertFaceRatio = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.FacialBalance.FacialFeatureSlant = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.FacialBalance.HorizFaceRatio = reader.readUint8();
        reader.seek(0x1, true); // Skip
        this.internal.customization.AlterFaceAndHair.FaceStructure.ForeheadGlabella.ForeheadDepth = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.ForeheadGlabella.ForheadProtrusion = reader.readUint8();
        reader.seek(0x1, true); // Skip
        this.internal.customization.AlterFaceAndHair.FaceStructure.Jaw.JawProtrusion = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Jaw.JawWidth = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Jaw.LowerJaw = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Jaw.JawContour = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Lips.LipShape = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Lips.LipSize = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Lips.LipFullness = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Lips.MouthExpression = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Lips.LipProtrusion = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Lips.LipThickness = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Mouth.MouthProtrusion = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Mouth.MouthSlant = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Mouth.Occlusion = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Mouth.MouthPosition = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Mouth.MouthWidth = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Mouth.MouthChinDistance = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.NoseRidge.NoseRidgeDepth = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.NoseRidge.NoseRidgeLength = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.NoseRidge.NosePosition = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.NoseRidge.NoseTipHeight = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Nostrils.NostrilSlant = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Nostrils.NostrilSize = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.Nostrils.NostrilWidth = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.NoseRidge.NoseProtrusion = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.ForeheadGlabella.NoseBridgeHeight = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.ForeheadGlabella.BridgeProtrusion1 = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.ForeheadGlabella.BridgeProtrusion2 = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.ForeheadGlabella.NoseBridgeWidth = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.NoseRidge.NoseHeight = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FaceStructure.NoseRidge.NoseSlant = reader.readUint8();
        reader.seek(0x40, true); // Skip
        this.internal.customization.AlterBody.Head = reader.readUint8();
        this.internal.customization.AlterBody.Chest = reader.readUint8();
        this.internal.customization.AlterBody.Abdomen = reader.readUint8();
        this.internal.customization.AlterBody.Arms = reader.readUint8();
        this.internal.customization.AlterBody.Legs = reader.readUint8();
        this.internal.customization.AlterBody.ArmsR = reader.readUint8();
        this.internal.customization.AlterBody.LegsR = reader.readUint8();
        this.internal.customization.AlterSkinColor = reader.readRGB();
        this.internal.customization.AlterFaceAndHair.SkinFeatures.SkinLuster = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.SkinFeatures.Pores = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FacialHair.Stubble = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.SkinFeatures.DarkCircles = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.SkinFeatures.DarkCircleColor = reader.readRGB();
        this.internal.customization.AlterFaceAndHair.Cosmetics.Cheeks = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.Cosmetics.CheeksColor = reader.readRGB();
        this.internal.customization.AlterFaceAndHair.Cosmetics.Eyeliner = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.Cosmetics.EyelinerColor = reader.readRGB();
        this.internal.customization.AlterFaceAndHair.Cosmetics.EyeshadowLower = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.Cosmetics.EyeshadowLowerColor = reader.readRGB();
        this.internal.customization.AlterFaceAndHair.Cosmetics.EyeshadowUpper = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.Cosmetics.EyeshadowUpperColor = reader.readRGB();
        this.internal.customization.AlterFaceAndHair.Cosmetics.Lipstick = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.Cosmetics.LipstickColor = reader.readRGB();
        this.internal.customization.AlterFaceAndHair.TattooMarkEyepatch.TweakTattooMark.PositionHoriz = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.TattooMarkEyepatch.TweakTattooMark.PositionVert = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.TattooMarkEyepatch.TweakTattooMark.Angle = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.TattooMarkEyepatch.TweakTattooMark.Expansion = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.TattooMarkEyepatch.TattooMarkColor = reader.readRGB();
        reader.seek(0x1, true); // Skip
        this.internal.customization.AlterFaceAndHair.TattooMarkEyepatch.TweakTattooMark.Flip = reader.readUint8();
        this.internal.customization.AlterBody.BodyHair = reader.readUint8();
        this.internal.customization.AlterBody.BodyHairColor = reader.readRGB();
        this.internal.customization.AlterFaceAndHair.Eyes.RightIrisColor = reader.readRGB();
        this.internal.customization.AlterFaceAndHair.Eyes.RightIrisSize = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.Eyes.REyeClouding = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.Eyes.RCloudingColor = reader.readRGB();
        this.internal.customization.AlterFaceAndHair.Eyes.REyeWhiteColor = reader.readRGB();
        this.internal.customization.AlterFaceAndHair.Eyes.REyePosition = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.Eyes.LeftIrisColor = reader.readRGB();
        this.internal.customization.AlterFaceAndHair.Eyes.LeftIrisSize = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.Eyes.LEyeClouding = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.Eyes.LCloudingColor = reader.readRGB();
        this.internal.customization.AlterFaceAndHair.Eyes.LEyeWhiteColor = reader.readRGB();
        this.internal.customization.AlterFaceAndHair.Eyes.LEyePosition = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.Hair.HairColor = reader.readRGB();
        this.internal.customization.AlterFaceAndHair.Hair.Luster = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.Hair.RootDarkness = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.Hair.WhiteHairs = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FacialHair.BeardColor = reader.readRGB();
        this.internal.customization.AlterFaceAndHair.FacialHair.Luster = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FacialHair.RootDarkness = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.FacialHair.WhiteHairs = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.Eyebrows.BrowColor = reader.readRGB();
        this.internal.customization.AlterFaceAndHair.Eyebrows.Luster = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.Eyebrows.RootDarkness = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.Eyebrows.WhiteHairs = reader.readUint8();
        this.internal.customization.AlterFaceAndHair.Eyelashes.EyelashColor = reader.readRGB();
        this.internal.customization.AlterFaceAndHair.TattooMarkEyepatch.EyepatchColor = reader.readRGB();
        reader.seek(0x15, true); // Skip
        reader.seek(0x8, true); // Skip

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
            if(Array.isArray(flag.id)) {
                flag.id.forEach(id => this.internal.flags[id] = checkFlag(id));
            } else {
                this.internal.flags[flag.id] = checkFlag(flag.id)
            }
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
        this.customization = JSON.parse(JSON.stringify(this.internal.customization));
        this.customization.AlterFaceAndHair.Eyebrows.Brow++;
        this.customization.AlterFaceAndHair.FacialHair.Beard++;
        this.customization.AlterFaceAndHair.Eyelashes.Eyelashes++;

        this.customization.AlterBody.Musculature = Math.trunc(this.customization.BaseStructure / 100);
        this.customization.AlterFaceAndHair.FaceTemplate.BoneStructure = Math.trunc((this.customization.BaseStructure % 100) / 10) + 1;
        this.customization.Age = Math.trunc(this.customization.BaseStructure % 10);

        let ageMap = ['Young', 'Mature', 'Aged'];
        let musculatureMap = ['Standard', 'Muscular'];
        this.customization.Age = ageMap[this.customization.Age];
        this.customization.AlterBody.Musculature = musculatureMap[this.customization.AlterBody.Musculature];

        let hairMap = [0, 113, 112, 1, 3, 100, 5, 10, 101, 9, 8, 6, 7, 115, 114, 2, 4, 102, 103, 104, 105, 106, 107, 109, 108, 110, 111];
        let eyepatchMap = [0, 2, 1, 10];

        let tattooMarkMap = {}
        for(var i=0; i<19; i++)
            tattooMarkMap[i] = i+1;
        for(var i=20; i<=38; i++)
            tattooMarkMap[i] = i;

        this.customization.AlterFaceAndHair.Hair.Hair = hairMap.indexOf(this.internal.customization.AlterFaceAndHair.Hair.Hair) + 1;
        this.customization.AlterFaceAndHair.TattooMarkEyepatch.Eyepatch = eyepatchMap.indexOf(this.customization.AlterFaceAndHair.TattooMarkEyepatch.Eyepatch) + 1;
        this.customization.AlterFaceAndHair.TattooMarkEyepatch.TattooMark = tattooMarkMap[this.customization.AlterFaceAndHair.TattooMarkEyepatch.TattooMark];
        this.customization.AlterFaceAndHair.TattooMarkEyepatch.TweakTattooMark.Flip = (this.customization.AlterFaceAndHair.TattooMarkEyepatch.TweakTattooMark.Flip == 0);

        this.inventory.all = this.internal.inventory.filter(item => item.params && item.text && !blacklist.includes(item.text.name));
        
        this.inventory.tools = this.inventory.all.filter(item => item.params.goodsType == 0 || item.params.goodsType == 3 || item.params.goodsType == 9);
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
        this.inventory.quickItems = [...this.inventory.tools, ...this.inventory.ashes];

        
        this.storage.all = this.internal.storage.filter(item => item.params && item.text && !blacklist.includes(item.text.name));
        
        this.storage.tools = this.storage.all.filter(item => item.params.goodsType == 0 || item.params.goodsType == 3 || item.params.goodsType == 9);
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
        this.equipped.leftWeapon1.equipped = true;
        this.equipped.rightWeapon1.equipped = true;
        this.equipped.leftWeapon2.equipped = true;
        this.equipped.rightWeapon2.equipped = true;
        this.equipped.leftWeapon3.equipped = true;
        this.equipped.rightWeapon3.equipped = true;

        this.equipped.arrow1 = this.inventory.arrowbolts.find(item => item.lookup.id == this.internal.arrow1Lookup.id) || { name: "Arrow" };
        this.equipped.bolt1 = this.inventory.arrowbolts.find(item => item.lookup.id == this.internal.bolt1Lookup.id) || { name: "Bolt" };
        this.equipped.arrow2 = this.inventory.arrowbolts.find(item => item.lookup.id == this.internal.arrow2Lookup.id) || { name: "Arrow" };
        this.equipped.bolt2 = this.inventory.arrowbolts.find(item => item.lookup.id == this.internal.bolt2Lookup.id) || { name: "Bolt" };
        this.equipped.arrow1.equipped = true;
        this.equipped.bolt1.equipped = true;
        this.equipped.arrow2.equipped = true;
        this.equipped.bolt2.equipped = true;

        this.equipped.head = this.inventory.armor.find(item => item.lookup.id == this.internal.headLookup.id) || { name: "Head" };
        this.equipped.chest = this.inventory.armor.find(item => item.lookup.id == this.internal.chestLookup.id) || { name: "Body" };
        this.equipped.arms = this.inventory.armor.find(item => item.lookup.id == this.internal.armsLookup.id) || { name: "Arms" };
        this.equipped.legs = this.inventory.armor.find(item => item.lookup.id == this.internal.legsLookup.id) || { name: "Legs" };
        this.equipped.head.equipped = true;
        this.equipped.chest.equipped = true;
        this.equipped.arms.equipped = true;
        this.equipped.legs.equipped = true;

        this.equipped.talismans = [];
        this.equipped.talismans.push(this.inventory.talismans.find(item => item.id == this.internal.talisman1Id && item.type == "talisman") || { name: "Talisman" });
        this.equipped.talismans.push(this.inventory.talismans.find(item => item.id == this.internal.talisman2Id && item.type == "talisman") || { name: "Talisman" });
        this.equipped.talismans.push(this.inventory.talismans.find(item => item.id == this.internal.talisman3Id && item.type == "talisman") || { name: "Talisman" });
        this.equipped.talismans.push(this.inventory.talismans.find(item => item.id == this.internal.talisman4Id && item.type == "talisman") || { name: "Talisman" });
        this.equipped.talismans.forEach(talisman => talisman.equipped = true);

        this.equipped.quick = [];
        this.equipped.quick.push(this.inventory.quickItems.find(item => item.id == this.internal.quick1Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.quickItems.find(item => item.id == this.internal.quick2Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.quickItems.find(item => item.id == this.internal.quick3Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.quickItems.find(item => item.id == this.internal.quick4Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.quickItems.find(item => item.id == this.internal.quick5Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.quickItems.find(item => item.id == this.internal.quick6Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.quickItems.find(item => item.id == this.internal.quick7Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.quickItems.find(item => item.id == this.internal.quick8Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.quickItems.find(item => item.id == this.internal.quick9Id) || { name: "Quick Slot" });
        this.equipped.quick.push(this.inventory.quickItems.find(item => item.id == this.internal.quick10Id) || { name: "Quick Slot" });
        this.equipped.quick.forEach(quick => quick.equipped = true);

        this.equipped.pouch = [];
        this.equipped.pouch.push(this.inventory.quickItems.find(item => item.id == this.internal.pouch1Id) || { name: "Pouch" });
        this.equipped.pouch.push(this.inventory.quickItems.find(item => item.id == this.internal.pouch2Id) || { name: "Pouch" });
        this.equipped.pouch.push(this.inventory.quickItems.find(item => item.id == this.internal.pouch3Id) || { name: "Pouch" });
        this.equipped.pouch.push(this.inventory.quickItems.find(item => item.id == this.internal.pouch4Id) || { name: "Pouch" });
        this.equipped.pouch.push(this.inventory.quickItems.find(item => item.id == this.internal.pouch5Id) || { name: "Pouch" });
        this.equipped.pouch.push(this.inventory.quickItems.find(item => item.id == this.internal.pouch6Id) || { name: "Pouch" });
        this.equipped.pouch.forEach(pouch => pouch.pouch = true);

        this.equipped.flask = [];
        this.equipped.flask.push(this.inventory.all.find(item => item.id == this.internal.flask1Id) || { name: "Left Flask" });
        this.equipped.flask.push(this.inventory.all.find(item => item.id == this.internal.flask2Id) || { name: "Right Flask" });
        this.equipped.flask.forEach(flask => flask.flask = true);

        this.equipped.spells = this.internal.equippedSpellIds.map(spellId => this.inventory.spells.find(item => item.id == spellId && item.type == "goods") || { name: "Spell Slot" });
        this.equipped.spells.forEach(spell => spell.spell = true);

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