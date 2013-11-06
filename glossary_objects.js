 /* glossary_objects.js
  * Frankie
  * version 1.8
  * 25May2013

  * KNOWN ISSUES:
  *   JQuery.ajax(): if calling a file using file:// there is a warning on the firefox console: not well-formed. This warning goes away when using http://

  * 1.8
  * changed glossary objects from [] to G_Obj
  * add G_Advancement
  * add G_Creature
  * move loading of glossary items to each page that wants them

  * 1.6
  * update version to match char_tracker.*
  * add abilities into glossary
  * change constructor names to add G_ prefix
  */

var glossary = {
  gear: new G_Obj(),
  skills: new G_Obj(),
  abilities: new G_Obj(),
  creatures: new G_Obj(),
  advances: new G_Obj()
};

function G_Obj() {
  var x = [];
  x.status = {
    needed: false,
    loading: false,
    ready: false
  };
  return x;
}

function G_Item(d) {
  if(!d) return false;

    // Required properties
  this.type = 'equipment'; // e.g. arms, equipment, wondrous, etc.
  this.name = '';
  this.cost = 0; // price of only 1 even if qty>1
  this.resale = 0; // resale of only 1 even if qty>1

    // Optional properties
      // other properties in common
  this.slot = '';
  this.weight = 0;
/*
      // stuff for armor
  this.encumbrance;
  this.bonus;
  this.max_DEX;
  this.armor_check;
  this.arcane_failure;
  this.speed_30ft;
*/

/*
      // stuff for arms
  this.training = d.training;
  this.encumbrance = d.encumbrance;
  this.dmg_S = d.dmg_S;
  this.dmg_M = d.dmg_M;
  this.crit = d.crit;
  this.range = d.range;
  this.dmg_type = d.dmg_type;
  this.special = d.special;
*/

  this.size;
      // useful for breaking/mending;
  this.material;
  this.hardness;
      // for magical items, to determine detect magic stuff
  this.CL;
  this.school;

  this.vital_stats; // for i.e. guard dog -- stringify of statblock data

    // Other properties defined by Paizo;
  this.source = '';
  this.description = '';

    // Properties that can be changed;
  this.qty = 0;
  this.hp = 0;
  this.mwk = false; // only makes sense for type==(arms, armor);
  this.condition = '';

  return true;
}
G_Item.prototype.getProperty = function(prop) {
    if(!prop) return undefined;
    var ret = '';
    switch(prop) {
      case 'type':
      case 'name':
      case 'cost':
      case 'resale':

      case 'slot':
      case 'encumbrance':
      case 'bonus':
      case 'max_DEX':
      case 'check':
      case 'arcane_failure':
      case 'speed_30ft':
      case 'weight':
        ret = this[prop];
        break;

      case 'category': ret = category; break;
      case 'handed': ret = handed; break;
      case 'med_dmg': ret = med_dmg; break;
      case 'crit': ret = crit; break;
      case 'range': ret = range; break;

      case 'size': ret = size; break;
      case 'weight': ret = weight; break;
      case 'material': ret = material; break;
      case 'hardness': ret = hardness; break;
      case 'CL': ret = CL; break;
      case 'school': ret = school; break;
      case 'vital_stats': ret = vital_stats; break;
      case 'source': ret = source; break;
      case 'description': ret = description; break;

      case 'qty': ret = qty; break;
      case 'hp': ret = hp; break;
      case 'mwk': ret = mwk; break;
      case 'condition': ret = condition; break;
    };

    return ret; };
G_Item.prototype.setProperty = function(prop, val) {
    if(typeof(prop) == 'undefined') return false;

    var ret = false;
    if(typeof(prop) == 'String') switch(prop) {
      case 'qty':       if((typeof(val) == 'Number') && (val > 0))  (qty = val, ret = true); break;
      case 'hp':        if((typeof(val) == 'Number') && (val > -1))    (hp = val, ret = true); break;
      case 'mwk':       if((val === true) || (val === false))           (mwk = val, ret = true); break;
      case 'condition': if((val == 'broken') || (val == 'sinking')) (condition = val, ret = true); break;
    };
    return ret; };
G_Item.prototype.toString = function() { return '['+this.constructor.name+' '+this.name+']'; }

function G_Weapon(d) {
  if(!d) return false;

  this.type = "Weapon";
  this.name = d.name;
  this.training = d.training;
  this.encumbrance = d.encumbrance;
  this.cost = d.cost;
  this.dmg_S = d.dmg_S;
  this.dmg_M = d.dmg_M;
  this.crit = d.crit;
  this.range = d.range;
  this.weight = d.weight;
  this.dmg_type = d.dmg_type;
  this.special = d.special;

  this.slot = 'weapon1';
  this.costValue = this.cost;
  this.resale = this.cost/2;

  return true;
}
G_Weapon.prototype = new G_Item();
G_Weapon.prototype.constructor = G_Weapon;

function G_Armor(d) {
  if(!d) return false;

  this.type = "Armor";
  this.name = d.name;
  this.encumbrance = d.encumbrance;
  this.bonus = d.bonus;
  this.max_DEX = d.max_DEX;
  this.check = d.check;
  this.arcane_failure = d.arcane_failure;
  this.speed_30ft = d.speed_30ft;
  this.speed_20ft = d.speed_20ft;
  this.weight = d.weight;
  this.cost = d.cost;

  this.slot = (this.encumbrance=='Extras')?'':((this.encumbrance=='Shields')?'shield':'body');
  this.costValue = this.cost;
  this.resale = this.cost/2;

  return true;
}
G_Armor.prototype = new G_Item();
G_Armor.prototype.constructor = G_Armor;

function G_MagicItem(d) {
  if(!d) return false;

  this.type = "MagicItem";
  this.name = d.Name;
  this.aura = d.Aura;
  this.CL = d.CL;
  this.slot = d.Slot;
  this.price = d.Price;
  this.weight = d.Weight;
  this.description = d.Description;
  this.requirements = d.Requirements;
  this.cost =d.Cost;
  this.group = d.Group;
  this.source = d.Source;
  this.align = d.AL;
  this.INT = d.Int;
  this.WIS = d.Wis;
  this.CHA = d.Cha;
  this.ego = d.Ego;
  this.communication = d.Communication;
  this.senses = d.Senses;
  this.powers = d.Powers;
  this.magicItems = d.MagicItems;
  this.destruction = d.Destruction;
  this.minorArtifact = d.MinorArtifactFlag;
  this.majorArtifact = d.MajorArtifactFlag;
  this.abjur = d.Abjuration;
  this.conj = d.Conjuration;
  this.divin = d.Divination;
  this.ench = d.Enchantment;
  this.evoc = d.Evocation;
  this.necro = d.Necromancy;
  this.trans = d.Transmutation;
  this.auraStrength = d.AuraStrength;
  this.weightValue = d.WeightValue;
  this.priceValue = d.PriceValue;
  this.costValue = Number(String(d.Cost).replace(/,|(?:[pgsc]p)|\s/, ""));
  this.languages = d.Languages;
  this.baseItem = d.BaseItem;
  this.linkText = d.LinkText;
  this.id = d.id;

  return true;
}
G_MagicItem.prototype = new G_Item();
G_MagicItem.prototype.constructor = G_MagicItem;

function G_Skill(d) {
  if(!d) return false;

  this.type = "Skill";
  this.name = d.name;
  this.abrev = d.abrev;
  this.ability = d.ability;
  this.penalty = d.penalty;
  this.untrained = d.untrained;

  return true;
}

function G_Ability(d) {
  if(!d) return false;

  this.type = "Ability";
  this.name = d.name;
  this.abrev = d.abrev;
  this.description = '';

  return true;
}

function G_Creature(d) {
  if(!d) return false;

  this.type = "Creature";
  this.Creature = d.Creature;
  this.Name = d.Name;
  this.CR = d.CR;
  this.XP = d.XP;
  this.Race = d.Race;
  this.Class = d.Class;
  this.MonsterSource = d.MonsterSource;
  this.Alignment = d.Alignment;
  this.Size = d.Size;
  this.Type = d.Type;
  this.SubType = d.SubType;
  this.Init = d.Init;
  this.Senses = d.Senses;
  this.Aura = d.Aura;
  this.AC = d.AC;
  this.AC_Mods = d.AC_Mods;
  this.HP = d.HP;
  this.HD = d.HD;
  this.HP_Mods = d.HP_Mods;
  this.Saves = d.Saves;
  this.Fort = d.Fort;
  this.Ref = d.Ref;
  this.Will = d.Will;
  this.Save_Mods = d.Save_Mods;
  this.DefensiveAbilities = d.DefensiveAbilities;
  this.DR = d.DR;
  this.Immune = d.Immune;
  this.Resist = d.Resist;
  this.SR = d.SR;
  this.Weaknesses = d.Weaknesses;
  this.Speed = d.Speed;
  this.Speed_Mod = d.Speed_Mod;
  this.Melee = d.Melee;
  this.Ranged = d.Ranged;
  this.Space = d.Space;
  this.Reach = d.Reach;
  this.SpecialAttacks = d.SpecialAttacks;
  this.SpellLikeAbilities = d.SpellLikeAbilities;
  this.SpellsKnown = d.SpellsKnown;
  this.SpellsPrepared = d.SpellsPrepared;
  this.SpellDomains = d.SpellDomains;
  this.AbilitiyScores = d.AbilitiyScores;
  this.AbilitiyScore_Mods = d.AbilitiyScore_Mods;
  this.BaseAtk = d.BaseAtk;
  this.CMB = d.CMB;
  this.CMD = d.CMD;
  this.Feats = d.Feats;
  this.Skills = d.Skills;
  this.RacialMods = d.RacialMods;
  this.Languages = d.Languages;
  this.SQ = d.SQ;
  this.Environment = d.Environment;
  this.Organization = d.Organization;
  this.Treasure = d.Treasure;
  this.Description_Visual = d.Description_Visual;
  this.Group = d.Group;
  this.Source = d.Source;
  this.IsTemplate = d.IsTemplate;
  this.SpecialAbilities = d.SpecialAbilities;
  this.Description = d.Description;
  this.Gender = d.Gender;
  this.Bloodline = d.Bloodline;
  this.ProhibitedSchools = d.ProhibitedSchools;
  this.BeforeCombat = d.BeforeCombat;
  this.DuringCombat = d.DuringCombat;
  this.Morale = d.Morale;
  this.Gear = d.Gear;
  this.OtherGear = d.OtherGear;
  this.Vulnerability = d.Vulnerability;
  this.Note = d.Note;
  this.CharacterFlag = d.CharacterFlag;
  this.CompanionFlag = d.CompanionFlag;
  this.Fly = d.Fly;
  this.Climb = d.Climb;
  this.Burrow = d.Burrow;
  this.Swim = d.Swim;
  this.Land = d.Land;
  this.TemplatesApplied = d.TemplatesApplied;
  this.OffenseNote = d.OffenseNote;
  this.BaseStatistics = d.BaseStatistics;
  this.ExtractsPrepared = d.ExtractsPrepared;
  this.AgeCategory = d.AgeCategory;
  this.DontUseRacialHD = d.DontUseRacialHD;
  this.VariantParent = d.VariantParent;
  this.Mystery = d.Mystery;
  this.ClassArchetypes = d.ClassArchetypes;
  this.Patron = d.Patron;
  this.CompanionFamiliarLink = d.CompanionFamiliarLink;
  this.FocusedSchool = d.FocusedSchool;
  this.Traits = d.Traits;
  this.AlternateNameForm = d.AlternateNameForm;
  this.StatisticsNote = d.StatisticsNote;
  this.LinkText = d.LinkText;
  this.id = d.id;
  this.UniqueMonster = d.UniqueMonster;

  return true;
}

function G_Advancement(d) {
  if(!d) return false;

  this.type = "Advancement";
  this.level = d.level;
  this.xp_slow = d.xp_slow;
  this.xp_medium = d.xp_medium;
  this.xp_fast = d.xp_fast;
  this.wealth_pc = d.wealth_pc;
  this.wealth_npc_basic = d.wealth_npc_basic;
  this.wealth_npc_heroic = d.wealth_npc_heroic;
  this.treasure_slow = d.treasure_slow;
  this.treasure_medium = d.treasure_medium;
  this.treasure_fast = d.treasure_fast;
  this.xp_monster = d.xp_monster;

  return true;
}

