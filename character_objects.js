 /* character_objects.js
  * Frankie
  * version 1.16
  * 25Oct2013

  * 1.16
  * added combat.carry and associated rules
  * added combat.hp_update()
  * update ability.generate() for format=='raw'
  * update abilities.generate() for both hint and format

  * 1.6
  * got private variables working in abilities, skills
  * worked on char.skills and char.abilities
  * worked on char.toString
  * put Skill() constructor back

  * 1.4
  * stripped out Skill() constructor

  * 1.2
  * Abilities.roll_stats: changed disregard to drop
  * Skills: skills are defined elsewhere to allow for database, or other rulesets
  * Char.addInfo: split init and addInfo to allow for init of objects inside before adding info
  */

function Ability(d) {
//if(d) console.log(d);
  this.type = 'ability';

  var _name = d.name,
      _description = d.description,
      _abrev = d.abrev.toLowerCase(),
      _base = 10,
      _total = 10,
      _mod = 0,
      _bonus = 0,
      _damage = 0,
      _penalty = 0,
      _drain = 0,

      _screen_txt = '';

  this.getProperty = function(prop) {
    if(typeof(prop) == 'undefined') return false;

    var _cases = {
      type: this.type,
      name: _name,
      description: _description,
      abrev: _abrev,
      base: _base,
      total: _total,
      mod: _mod,
      bonus: _bonus,
      damage: _damage,
      penalty: _penalty,
      drain: _drain,
      screen_txt: _screen_txt
    };
    return _cases[prop]; };
  this.setProperty = function(prop, val) {
    if(typeof(prop) == 'undefined') return false;

    var ret = false;
//console.log({propT: typeof(prop), valT: typeof(val), val: val});
    if(typeof(prop) == 'string') switch(prop) {
      case 'base': if(Number(val) > -1) (_base = val, ret = true); break;
      case 'bonus': if(Number(val) > -1) (_bonus = val, ret = true); break;
      case 'damage': if(Number(val) > -1) (_damage = val, ret = true); break;
      case 'penalty': if(Number(val) > -1) (_penalty = val, ret = true); break;
      case 'drain': if(Number(val) > -1) (_drain = val, ret = true); break;
    };
    if(ret) this.recalc('all');
    return ret; };
  this.recalc = function(abil) {
    abil = abil || 'all';
    var ret = false;
    if((abil == _abrev) || (abil == 'all')) {
      _total = _base + _bonus - _damage - _penalty - _drain;
      _mod = Math.floor(_total / 2 - 5);
      ret = true;
    }
    return ret; };
  this.generate = function(format) {
    //console.log([format, this.getProperty('total')]);
    format = format || 'normal';
    var mod_txt = (_mod != 0) ? String(" (+" + _mod + ")") : "",
        formats = {
          normal: _name.substr(0,3) + ": " + String(_total) + mod_txt,
          raw: String(_total)
        };
    return _screen_txt = formats[format]; };
  this.toString = function() { return '['+this.constructor.name+' '+_name+']'; };
}
function Abilities(d) {
  if(typeof(d) == 'undefined') d = { };
  var _creature = d;

  this.stat_rolls = [10, 10, 10, 10, 10, 10];

  this.roll_stats = function() {
    var rolls = [], roller = dice_roller({sides: 6, quantity: 5, reroll: 1, drop: 2});
    for(var i = 0; i < 6; i++) rolls.push(roller.roll());
    rolls.sort(by_number);
    this.stat_rolls = rolls; };

  this.getAbility = function(abrev){
    for(var i in this) if(this[i].type && this[i].type == 'ability' && this[i].getProperty('abrev') == abrev) return this[i];
    return false; };
  this.generate = function(hint, format) {
    //console.log(hint, format);
    var i, txt = [];
    for(i in this)
      if(this[i].type && this[i].type == 'ability' && (!hint || hint == 'all' || hint == this[i].getProperty('abrev')))
        txt.push(this[i].generate(format));
    //console.log(txt);
    return (txt.length) ? txt.join(", ") : "Abilities";
  };
  this.recalc = function(abil) {
    for(var i in this) if(this[i].type && this[i].type == 'ability') this[i].recalc(abil);
    return true; };
  this.getBase = function(abil) {
    var a = this.getAbility(abil);
    return (a.setProperty) ? a.getProperty('base') : false; };
  this.setBase = function(abil, val) {
    var a = this.getAbility(abil);
    return (a.setProperty) ? a.setProperty('base', Number(val)) : false; };
  this.toSource = function() { var ret = []; this.forEach(function(d){ if(d.type && d.type == 'ability') this.push(d+' ('+d.getProperty('abrev')+')'); }, ret); return ret; };
}
Abilities.prototype = Array.prototype;
Abilities.prototype.constructor = Abilities;

function Skill(d) {
  this.type = 'skill';

  var _total = 0,
      _ranks = 0,
      _name = d.name,
      _abrev = d.abrev,
      _shown = d.shown,
      _ability = d.ability,
      _penalty = d.penalty;

  this.getProperty = function(prop) {
    if(typeof(prop) == 'undefined') return false;

    var _cases = {
      type: this.type,
      total: _total,
      ranks: _ranks,
      name: _name,
      abrev: _abrev,
      shown: _shown,
      ability: _ability,
      penalty: _penalty
    };
    return _cases[prop]; };
  this.setProperty = function(prop, val) {
    if(typeof(prop) == 'undefined') return false;

    var ret = false;
    if(typeof(prop) == 'string') switch(prop) {
      case 'ranks': if((typeof(val) == 'number') && (val > -1)) (_ranks = val, ret = true); break;
      case 'shown': if((val === true) || (val === false))     (_shown = val, ret = true); break;
    };
    return ret; };
  this.recalc = function(ch, sk) {
    sk = sk || 'all';
    var ret = false, tmp_abililty,
        ABILITYMOD = ch && (tmp_abililty = ch.abilities.getAbility(_ability)) ? tmp_abililty.getProperty('mod') : 0,
        ACCHECK = ch && ch.defense ? (_penalty == "2ac" ? (2 * ch.defense.ac.check) :
                                      _penalty == "ac" ? ch.defense.ac.check : 0) : 0;
    if(sk == _abrev || sk == 'all') {
      _total = _ranks + ABILITYMOD - ACCHECK;
      ret = true;
    }
    return ret; };
  this.generate = function(format) {
    format = format || 'normal';
    var formats = {
      normal: " &nbsp; " + _name + " = +" + _total
    };
    return formats[format];
  };
}
function Skills(d) {
  if(typeof(d) == 'undefined') d = { };
  var _creature = d;

  this.getSkill = function(abrev){
    for(var i in this) if(this[i].type && this[i].type == 'skill' && this[i].getProperty('abrev') == abrev) return this[i];
    return false; };
  this.generate = function(format) {
    var i, txt = [];
    for(i in this) if(this[i].type && this[i].type == 'skill' && this[i].getProperty('shown')) txt.push(this[i].generate(format));
    return (txt.length > 0) ? txt.join("<br>\n") : "just heavily used ones shown"; };
  this.recalc = function(sk) {
    for(var i in this) if(this[i].type && this[i].type == 'skill') this[i].recalc(_creature, sk);
    return true; };
}
Skills.prototype = Array.prototype;
Skills.prototype.constructor = Skills;

function Slots() {
  function Slot() {
    this.type = 'slot';
    this.value = 0;
  }
  function Container() {
    this.type = 'container';
    this.value = [];
  }

  var i;

  this.slot_list = [
      // first, the basic slots (phb page xx)
    'head', 'eyes', 'neck', 'shoulders', 'arms', 'hands', 'ring1', 'ring2',
    'torso', 'body', 'waist', 'feet',
      // next, the ficticious slots, used for bookkeeping
    'weapon1', // used to equip primary weapon; wand; potion; etc.
    'weapon2', // used for off-hand weapon
    'armor',   // only used for armor
    'shield'   // only used for shield
  ];
  this.slots = {};
  for(i in this.slot_list) this.slots[this.slot_list[i]] = new Slot();

  this.container_list = [
      // containers are fiction, used only for bookkeeping
    'hidden',  // used for items secreted on the body
    'sheath',  // used for quickdraw; etc.
    'backpack' // used to store inventory
  ];
  this.containers = {};
  for(i in this.container_list) this.containers[this.container_list[i]] = new Container();

    // anything inside a bag or purse; etc; can be retrieved
    // change location of an item in inventory (referenced by index i) to either weapon1 or weapon2 (if available)
  this.retrieve = function(i) {
    if(typeof(i) == 'undefined') return false;
      // TODO: slots-retrieve: doublecheck that i exists in inventory
    if(this.weapon1.value && !this.weapon2.value) { this.weapon2.value = i; }
    else { this.weapon1.value = i; };
    return true; };

  this.equip = function(item) {
    if(typeof(item) == 'undefined') return false;

    var i, where;
      // assume the 'where' in inventory is correct, and assign each to its slot
    if((where = item.where) == 'worn') {
      for(i in this.containers) if(i == item.name) return true;
      this.containers[item.name] = new Container();
      return true; };
    for(i in this.slots) if(i == where) {
        // TODO: slots-equip: if there was already something in that slot, mark it off in inventory (or into weapon1??)
      this.slots[i].value = item.id;
      if(item.properties.type && (item.properties.type == 'armor')) this.slots['armor'].value = item.id;
      return true; };
    for(i in this.containers) if(i == where) {
        // NOTE: how much sense does it make to "equip" a sword into a "sheath" container??
        // TODO: slots-equip: if it was already in that container, don't do anything further
      this.containers[i].value.push(item.id);
      return true; };
    return false; };

    // only clothing-type things can be put_on or take_off; also; armor/shield
  this.put_on = function() {};
  this.take_off = function() {};

  this.secret = function() {}; // used for slight-of-hand
  this.draw = function() {}; // only things in a sheath (or hidden)
  this.sheath = function() {}; // only weapon-like items that already have a sheath

  this.cross_reference = function(inv) {
    if(typeof(inv) == 'undefined') return false;
  /*
    go through the inventory, for each one:
      check the slot it is supposedly in
      if match, great, if not, set to: err
    go through slots, for each one:
      check item's place in inventory
      if match, great, if not, set to: 0
    then containers, the same way
   */
    var i, j, k, what, where;

      inventory_loop:
    for(i in inv) {
      what = inv[i].id;
      where = inv[i].where;
      if((this.slots[where]) && (this.slots[where].value == what)) continue inventory_loop;
      if(this.containers[where]) for(j in this.containers[where].value)
        if(this.containers[where].value[j] == what) continue inventory_loop;
      inv[i].where = "err"; };

      slots_loop:
    for(i in this.slots) {
      what = this.slots[i].value;
      for(j in inv) {
        if((inv[j].id == what) &&
           (inv[j].where == i)) continue slots_loop; };
      this.slots[i].value = 0; };

      containers_loop:
    for(i in this.containers) {
      for(j in this.containers[i].value) {
        what = this.containers[i].value[j];
        for(k in inv) {
          if((inv[k].id == what) &&
            (inv[k].where == i)) continue containers_loop; };
        this.containers[i].value[j] = 0; }; };

    return true; };

  this.generate = function(hint, gear) {
    var i, id;
// simple: weapon1 (weapon2); full with weapon1 (weapon2)
// complicated:
//   atk with fist if !(weapon1 || weapon2) or feat: improved unarmed strike
//   or atk (& full) with weapon1 if weapon1 has weapon property
//   or atk (& full) with weapon2 if weapon2 has weapon property
//   or 2weapon if both weapon1 && weapon2 have weapon property
    i = 'weapon1'; id = this.slots[i].value;
    j = 'weapon2'; 
    switch(hint) {
      case "atk":
        if(id) for(i in gear.inventory) if(gear.inventory[i].id == id) return gear.inventory[i].name;
        break;
      case 'single':
        // check weapon1 for weapon, else check weapon2, else assume unarmed
        break;
      case 'full':
        // if bab allows for more than 1 attack, multiple attacks with weapon1 (or else weapon2, or else unarmed)
        // or both weapons are melee (or w1 with fist, or w2 with fist), then 2weapon fighting
        break;
      case 'ranged':
        // if weapon1 is ranged, then single attack w/ weapon1
        // else, if weapon2 is ranged, single attack w/ weapon2
        // else, if special is ranged, etc.
        break;
      case 'special':
        break;
    };
    return ""; };
}

function Gear() {
  this.inventory = [ /* uid, quantity, name, where  */ ];
  this.coinpurse = 6; // value of coins/gems: in gold

    // put an item into inventory (and give it an index)
  this.store = function(i) {
    if(typeof(i) == 'undefined') return false;
    var itemid, item_obj, len = this.inventory.length;
    itemid = (len) ? this.inventory[len - 1].id + 1 : 10;
    item_obj = {
      id: itemid,
      quantity: i[0],
      name: i[1],
      where: i[2],
      properties: i[3] };
    this.inventory.push(item_obj); // now that .length has changed, we need to re-sort
    this.re_sort();
    return true; };

    // remove an item from inventory (referenced by index i)
  this.drop = function(i) {
    if(typeof(i) == 'undefined') return false;
    this.inventory.splice(i, 1); // now that .length has changed, we need to re-sort
    this.re_sort();
    return true; };

  this.details = function(i) {
    if(typeof(i) == 'undefined') return false;
    var item;
    for(item in this.inventory) if(this.inventory[item].id && (this.inventory[item].id == i)) return this.inventory[item];
    return false; };

  this.re_sort = function() {
    this.inventory.sort(function(a, b) {
      return ((a.id < b.id) ? -1 : ((a.id == b.id) ? 0 : 1)); }); };
}

function Combat() {
    // init, hp, bab, cmb, etc.
  this.hp_rolls = [];
//  this.hp = 0;
  this.hp_base = 0;
  this.hp_damage = 0;
  this.bab = 0;
  this.carry = 0;

  this.init = 0;
  this.cmb = 0;
  this.cmd = 0;

  this.melee = 0;
  this.ranged = 0;

  this.current_conditions = '';

  this.hp_update = function(hint, data) {
    var f;
    f = {
      full: function(d) {
        this.hp_damage = 0; },
      damage: function(d) {
        this.hp_damage += d; },
      sleep: function(d) {
        // total number of HD tell us how many hp to get back each night
        this.hp_damage -= this.hp_rolls.length;
        if(this.hp_damage < 0) this.hp_damage = 0; },
      heal: function(d) {
        this.hp_damage -= d;
        if(this.hp_damage < 0) this.hp_damage = 0; }
    };
    f[hint](data);
  };

  this.generate = function (hint) {
    switch(hint) {
      case 'current_conditions': return this.current_conditions;  break;
      case 'current_hp': return this.hp_base - this.hp_damage;  break;
      case 'carry': return this.carry; break;
      case 'base_hp': return this.hp_base;  break;
      case 'cmb': return this.cmb;  break;
      case 'cmd': return this.cmd;  break;
      default: };
    return ""; };

  this.recalc = function(ch, hint) {
    if(typeof(ch) == 'undefined') return false;
      // TODO: combat.recalc(): hint is currently unused, put in code for it
      // TODO: combat.recalc(): bab should come from classes, not hardcoded

    var i, ability;
      // check abilities for str, dex, con
    var Strength = (ability = ch.abilities.getAbility('str')) ? ability.getProperty('total') : 0,
        STR = (ability = ch.abilities.getAbility('str')) ? ability.getProperty('mod') : 0,
        DEX = (ability = ch.abilities.getAbility('dex')) ? ability.getProperty('mod') : 0,
        CON = (ability = ch.abilities.getAbility('con')) ? ability.getProperty('mod') : 0;
      // check slots for weapons in hand
      // check saq for feats, featured class choices that can affect:
      //    hp, init, melee, ranged, cmb, cmd

    var hp_tmp = 0;
    for(i = 0; i < this.hp_rolls.length; i++) hp_tmp += this.hp_rolls[i] + CON; // +toughness? +featured class?
    this.hp_base = hp_tmp;

    var carry_tmp = [100, 115, 130, 150, 175, 200, 230, 260, 300, 350];
    if(Strength <= 10) {
      this.carry = 10 * Strength;
    } else {
      this.carry = carry_tmp[Strength % 10] * Math.pow(4, Math.floor(Strength / 10) - 1);
    }

    this.init = DEX; // +improved init?

    this.melee = this.bab + STR; // +enh on weapon? change to DEX for finesse? proficiency penalty?
    this.ranged = this.bab + DEX;

    this.cmb = this.bab + STR; // +improved grapple, etc?
    this.cmd = this.bab + DEX + 10;

    return true; };
}

function Defense() {
    // AC, saves, immunities, regeneration, etc.
  this.ac = { total: 0, flat: 0, touch: 0, check: 0 };

  this.base_saves = { f:0, r:0, w:0 };
  this.saves = { f:0, r:0, w:0 };

  this.resistance = [];
  this.immunities = [];
  this.other = [];

  this.generate = function (hint) {
    switch(hint) {
      case 'ac': return this.ac.total;   break;
      case 'fort': return this.saves.f;  break;
      case 'refl': return this.saves.r;  break;
      case 'will': return this.saves.w;  break;
      default:
        var tmp_ac = 'AC ' + this.ac.total,
            tmp_fort = 'Fort +' + this.saves.f,
            tmp_refl = 'Refl +' + this.saves.r,
            tmp_will = 'Will +' + this.saves.w;
        return [tmp_ac, tmp_fort, tmp_refl, tmp_will].join(', ');
    };
    return ""; };

  this.recalc = function (ch, hint) {
    if(typeof(ch) == 'undefined') return false;
      // TODO: defense.recalc(): hint is currently unused, put in code for it
      // TODO: combat.recalc(): base saves should come from classes, not hardcoded

    var ability;
      // check abilities for dex, con, wis
    var DEX = (ability = ch.abilities.getAbility('dex')) ? ability.getProperty('mod') : 0,
        CON = (ability = ch.abilities.getAbility('con')) ? ability.getProperty('mod') : 0,
        WIS = (ability = ch.abilities.getAbility('wis')) ? ability.getProperty('mod') : 0;
      // check slots for armor
    var ARM_id = ch.slots.slots['armor'].value,
        ARM_itm = (ARM_id) ? ch.gear.details(ARM_id) : 0,
        ARMOR = (ARM_itm && ARM_itm.properties && ARM_itm.properties.bonus) ? ARM_itm.properties.bonus : 0;
      // check slots for shield, also weapon1 or weapon2 are open
    var W1_id = ch.slots.slots['weapon1'].value,
        W2_id = ch.slots.slots['weapon2'].value,
        SHL_id = ch.slots.slots['shield'].value,
        SHL_itm = (SHL_id) ? ch.gear.details(SHL_id) : 0,
        SHL_bonus = (SHL_itm && SHL_itm.properties && SHL_itm.properties.bonus) ? SHL_itm.properties.bonus : 0,
        SHIELD = (W1_id && W2_id) ? 0 : SHL_bonus;
    var ARM_dex = Math.min(DEX, ((ARM_itm && ARM_itm.properties && ARM_itm.properties.maxDex) ? ARM_itm.properties.maxDex : 0)),
        ARM_chk = ((ARM_itm && ARM_itm.properties && ARM_itm.properties.check) ? ARM_itm.properties.check : 0)
                + ((SHL_itm && SHL_itm.properties && SHL_itm.properties.check) ? SHL_itm.properties.check : 0);

      // check sq for other things ?

    this.ac.total = 10 + ARM_dex + ARMOR + SHIELD; // +dodge? +subschool?
    this.ac.flat = 10 + ARMOR + SHIELD;
    this.ac.touch = 10 + ARM_dex;
    this.ac.check = ARM_chk;

    this.saves.f = this.base_saves.f + CON; // +immunities?
    this.saves.r = this.base_saves.r + DEX;
    this.saves.w = this.base_saves.w + WIS;

    return true; };
}

function sAQ() {
  // track feats, racial traits, class features, etc
}

function Description() {
  // track name, xp, alignment, etc.

  this.name = '';
  this.xp = 0;
  this.align = '';

  this.type = '';  // another class for race/template???
  this.size = '';

  this.level = ''; // another class for class/prestige???

  this.generate = function(hint) {
    switch(hint) {
      case 'name': return this.name;   break;
      case 'xp': return this.xp;  break;
      case 'align': return this.align;  break;
      case 'type': return this.type;  break;
      case 'size': return this.size;  break;
      case 'level': return this.level;  break;
      default: };
    return ""; };
}

function Char(data) {
  if(typeof(data) == 'undefined') data = {
    name: "Name", xp: 0,
    level: "Level",
    align: "Alignment",
    size: "Size",
    type: "Type",

    stat_rolls: [10, 10, 10, 10, 10, 10],
//    abilities: { str: 10, dex: 10, con: 10, 'int': 10, wis: 10, cha: 10 },
    skills: {
      spot:   [false,0],
      listen: [false,0] },
    hp_rolls: [0],
    bab: 0,
    base_saves: { f:0, r:0, w:0 },
    gear: []
  };

  var i, j;
    // Setup the objects to hold the data
  this.descript = new Description();
  this.abilities = new Abilities(this);
    glossary.abilities.forEach(function(d){ this.abilities.push(new Ability(d)); }, this);
  this.skills = new Skills(this);
    glossary.skills.forEach(function(d){ this.skills.push(new Skill(d)); }, this);
  this.slots = new Slots();
  this.gear = new Gear();
  this.sAQ = new sAQ();
  this.combat = new Combat();
  this.defense = new Defense();

  this.addInfo = function(d) {
    if(typeof(d) == 'undefined') return false;

    var i, j;
      for(i in d) switch(i) {
        case 'length':  // length is an artifact of the js language, not part of the project
                        // don't let the following be overwritten:
        case 'descript':
        case 'slots':
        case 'sAQ':
        case 'combat':
        case 'defense':
          continue; break;
  // TODO: Char-addinfo(): change each part to .addInfo and make the data arrays of objects here
        case "stat-rolls":
          this.abilities.stat_rolls = d[i];
          break;
        case "abilities":
          var ability;
          for(j in d[i]) {
            if(!(ability = this.abilities.getAbility(j))) continue;
            ability.setProperty('base', Number(d[i][j]));
          }
          break;
        case "skills":
          var skill;
          for(j in d[i]) {
            if(!(skill = this.skills.getSkill(j))) continue;
            skill.setProperty('shown', Boolean(d[i][j][0]));
            skill.setProperty('ranks', Number(d[i][j][0]));
          };
          break;
        case "gear":
          for(j in d[i]) this[i].store(d[i][j]);
          for(i in this.gear.inventory) this.slots.equip(this.gear.inventory[i]);
          break;
    // stuff for descript
        case "name":
        case "xp":
        case "align":
        case "type": // WARN: Char-addInfo()->for->switch->case type: depreciated
        case "size": // WARN: Char-addInfo()->for->switch->case size: depreciated
        case "level": // this is scheduled to go somewhere else
          this.descript[i] = d[i];
          break;
    // stuff for sAQ
        case "sAQ":
          this.sAQ[i] = d[i];
          break;
    // stuff for combat (hp, init, melee, ranged, cmb, cmd are otherwise calculated)
        case "bab": // WARN: Char-addInfo()->for->switch->case bab: depreciated
        case "hp_rolls":
          this.combat[i] = d[i];
          break;
    // stuff for defense (ac, saves are otherwise calculated)
        case "base_saves": // WARN: Char-addInfo()->for->switch->case base_saves: depreciated
          this.defense[i] = d[i];
          break;

      };
    return true; };

  this.recalc = function(hint) {
    /* rc_levels:
        2 = abilities
        3 = combat
        5 = defense
        7 = skills
        11 = s_aq
     */
    var rc_level = 1;
    switch(hint) {
      case 'all': rc_level *= 2 * 3 * 5 * 7 * 11;
      case 's_aq': rc_level *= 11;
      case 'skills': rc_level *= 7;
      case 'defense': rc_level *= 5;
      case 'combat': rc_level *= 3;
      case 'abilities': rc_level *= 2;
    };

      // recalc abilities for modifiers
    if(0 === (rc_level%2)) this.abilities.recalc();
      // recalc combat for initial numbers (taking into account ability mods)
    if(0 === (rc_level%3)) this.combat.recalc(this);
      // recalc ac for initial numbers (taking into account ability mods)
    if(0 === (rc_level%5)) this.defense.recalc(this);
      // recalc skills for initial numbers (taking into account ability mods and ac penalties)
    if(0 === (rc_level%7)) this.skills.recalc(this);
  };

  this.toString = function() {
    var ret = {
      name: this.descript.name, xp: this.descript.xp,
      level: this.descript.level,
      align: this.descript.align,
      size: this.descript.size,
      type: this.descript.type,

      stat_rolls: this.abilities.stat_rolls,
      abilities: {
        str: this.abilities.getBase('str'),
        dex: this.abilities.getBase('dex'),
        con: this.abilities.getBase('con'),
        'int': this.abilities.getBase('int'),
        wis: this.abilities.getBase('wis'),
        cha: this.abilities.getBase('cha') },
      skills: {
        spot:   [false,0],
        listen: [false,0] },
      hp_rolls: this.combat.hp_rolls,
      bab: this.combat.bab,
      base_saves: this.defense.base_saves,
      gear: []
    };

    return JSON.stringify(ret);

  };
}
