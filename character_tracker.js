 /* character_tracker.js
  * Frankie
  * version 1.16
  * 25Oct2013

  TODO: change gid() to $()
        change update_page() to synch()

  * 1.16
  * added carrying capacity to 'status'
  * filling in synch(), update_page() for hint=='status'
  * filling in synch(), update_page() for hint=='abil'
  * filling in synch(), update_page() for hint=='vitals'
  * refactor make_tags_editable()
  * filling in synch(), update_page() for hint=='who'
  * use jquery in update_page()

  * 1.14
  * use new glossary filler function g_load()
  * moved a bunch of stuff from .htm script to onload function here

  * 1.6
  * update version to match char_tracker.htm
  * remove addToCharSkills()

  * 1.2
  * move gid() to general.js
  * create addToSkills()
  */

function stat_roll_btn() {
  var ddowns, i, j;
  char.roll_stats();
  gid('stat_rolls').innerHTML = char.stat_rolls;
  ddowns = gid("stat_ddowns").getElementsByTagName("select");
  for(i in ddowns) {
    if(ddowns[i].appendChild) {
      ddowns[i].innerHTML = "";
      for(j in char.stat_rolls) {
        opt = document.createElement("option");
        opt.value = j;
        opt.text = char.stat_rolls[j] + "(" + (Math.floor(char.stat_rolls[j]/2) - 5) + ") (" + ddowns[j].id.slice(0,3) + ")";
        opt.selected = (i == j) ? "selected" : "";
        ddowns[i].appendChild(opt);
      };
      ddowns[i].onchange = swap_stats;
    };
  };
}

function swap_stats() {
  var i, j, ddowns, aval, bval = this.value,
      a = this.id.slice(0,3),
      b = this.options[this.value].text.slice(-4,-1),
      bnode = gid(b + "_stat_ddown");

// check for change in status, only proceed if there is change
  if(a == b) return true;

// what used to be the value
  for(i in this.options) {
    if(a == this.options.item(i).text.slice(-4, -1)) {
      aval = this.options.item(i).value;
      break;
    };
  };

// update each ddown with new info
  ddowns = gid("stat_ddowns").getElementsByTagName("select");
  for(i in ddowns) {
    if(ddowns[i].appendChild) for(j in ddowns[i].options) {
      switch(j) {
        case aval:
        // change to b
          ddowns[i].options.item(j).text = ddowns[i].options.item(j).text.slice(0,-4) + b + ")";
          break;
        case bval:
        // change to a
          ddowns[i].options.item(j).text = ddowns[i].options.item(j).text.slice(0,-4) + a + ")";
          break;
      };
    };
  };

// change other ddown we're swapping with (.selectedIndex = #)
  bnode.selectedIndex = aval;
  return true;

}

function stat_save_btn() {
    // TODO: stat_save_btn(): make this work with new abilities object in char
  var i, ddowns = gid("stat_ddowns").getElementsByTagName("select");
  for(i in ddowns) {
    if(ddowns[i].appendChild) switch(ddowns[i].id.slice(0,3)) {
      case "str": char.abil.s[1] = char.stat_rolls[ddowns[i].value]; break;
      case "dex": char.abil.d[1] = char.stat_rolls[ddowns[i].value]; break;
      case "con": char.abil.con[1] = char.stat_rolls[ddowns[i].value]; break;
      case "int": char.abil.i[1] = char.stat_rolls[ddowns[i].value]; break;
      case "wis": char.abil.w[1] = char.stat_rolls[ddowns[i].value]; break;
      case "cha": char.abil.cha[1] = char.stat_rolls[ddowns[i].value]; break;
    };
  };
  gid("assign_stats").style.display = "none";
}

function make_tags_editable($n, e) {
  /***
   *  set the contenteditable attribute for this node and children
   *  based on either the e variable, or the existance of the class 'data_editable'
   */

    // make $n a jquery object if it isn't already
  if(!$n.jquery) return;
  var i, $n_kids = $n.children();
  //console.log($n_kids);

    // only risk changing e if it is false
  if(e) {  $n.attr('contenteditable', 'true');
  } else { if($n.hasClass('data_editable')) e = true;
  };

  if($n_kids.length == 0) return;
  for(i = 0; i < $n_kids.length; i++) { make_tags_editable($($n_kids[i]), e); };
}

function synch(hint) {
  if(typeof(char) == 'undefined') {
    char = new Char();
    char.addInfo(char_default);
  }
  var ch = char;

  if(hint) switch(hint) {
    case 'who':
      ch.descript.name = $('#char_who_name').html().replace(/<br>/g, '');
      ch.descript.level = $('#char_who_level').html().replace(/<br>/g, '');
      break;
    case 'vitals':
      ch.descript.align = $('#char_vitals_align').html().replace(/<br>/g, '');
      ch.descript.size = $('#char_vitals_size').html().replace(/<br>/g, '');
      ch.descript.type = $('#char_vitals_type').html().replace(/<br>/g, '');
      break;
    case 'abil':
      ch.abilities.setBase('str', Number($('#char_abil_str').html()));
      ch.abilities.setBase('dex', Number($('#char_abil_dex').html()));
      ch.abilities.setBase('con', Number($('#char_abil_con').html()));
      ch.abilities.setBase('int', Number($('#char_abil_int').html()));
      ch.abilities.setBase('wis', Number($('#char_abil_wis').html()));
      ch.abilities.setBase('cha', Number($('#char_abil_cha').html()));
      break;
    case 'status':
      ch.combat.current_hp = Number($('#char_status_hp').html());
      ch.combat.current_conditions = $('#char_status_conditions').html().replace(/<br>/g, '');
      break;
  };

  update_page(ch);
}

function update_page(ch) {
  var my = {};
  //console.log(ch);
  if(ch.recalc) ch.recalc('all');
//    $('#enter_xp').html(my.xp =    ch.descript.generate('xp'));
  $('#char_who_name').html(my.name =   ch.descript.generate('name'));
  $('#char_who_level').html(my.level = ch.descript.generate('level'));
  $('#char_who').html([my.name, my.level].join(', '));

  $('#char_vitals_align').html(my.align = ch.descript.generate('align'));
  $('#char_vitals_size').html(my.size =   ch.descript.generate('size'));
  $('#char_vitals_type').html(my.type =   ch.descript.generate('type'));
  $('#char_vitals').html([my.align, my.size, my.type].join(', '));

  $('#char_abil_str').html(ch.abilities.generate('str', 'raw'));
  $('#char_abil_dex').html(ch.abilities.generate('dex', 'raw'));
  $('#char_abil_con').html(ch.abilities.generate('con', 'raw'));
  $('#char_abil_int').html(ch.abilities.generate('int', 'raw'));
  $('#char_abil_wis').html(ch.abilities.generate('wis', 'raw'));
  $('#char_abil_cha').html(ch.abilities.generate('cha', 'raw'));
  $('#char_abil').html(ch.abilities.generate());

  $('#char_status_hp').html(my.hp = ch.combat.generate('current_hp'));
    my.hp = 'Status: ' + my.hp + ' hp';
  $('#char_status_conditions').html(my.conds = ch.combat.generate('current_conditions'));
  $('#char_status_carry').html(my.carry = ch.combat.generate('carry'));
  $('#char_status').html((my.conds) ? [my.hp, my.conds].join('; ') : my.hp);

  $('#char_defense_ac').html(my.ac =     ch.defense.generate('ac'));
    my.ac = 'AC: ' + my.ac;
  $('#char_defense_fort').html(my.fort = ch.defense.generate('fort'));
    my.fort = 'Fort: +' + my.fort;
  $('#char_defense_refl').html(my.refl = ch.defense.generate('refl'));
    my.refl = 'Refl: +' + my.refl;
  $('#char_defense_will').html(my.will = ch.defense.generate('will'));
    my.will = 'Will: +' + my.will;
  $('#char_defense').html([my.ac, my.fort, my.refl, my.will].join(', '));

  $('#char_offense_single').html( ch.slots.generate('single', ch.gear));
  $('#char_offense_full').html( ch.slots.generate('full', ch.gear));
  $('#char_offense_ranged').html( ch.slots.generate('ranged', ch.gear));
  $('#char_offense_special').html( ch.slots.generate('special', ch.gear));
  $('#char_offense').html( ch.slots.generate('atk', ch.gear));



  $('#char_skills').html(ch.skills.generate());

  //console.log(my);
}

window.onload = function () {
  // Load needed glossary items
  g_load(['skills', 'abilities', 'gear']);
  var char;

  // Massage DOM on page
  //make_tags_editable($('#data_entry'), false);
  make_tags_editable($('#data_who'), false);
  make_tags_editable($('#data_vitals'), false);
  make_tags_editable($('#data_abil'), false);
  make_tags_editable($('#data_status'), false);
  make_tags_editable($('#data_defense'), false);
};

var char_default = {
      name: "Ragnar", xp: 1300,
      level: "Rogue 3",
      align: "Chaotic",
      size: "Med",
      type: "humanoid(Human)",
      stat_rolls: [18, 16, 16, 15, 13, 10],
      abilities: { str: 10, dex: 18, con: 15, 'int': 16, wis: 13, cha: 16 },
      skills: { // [shown, ranks]
        bluff:      [true,6],
        dDevice:    [true,2],
        disguise:   [true,6],
        dScript:    [false,1],
        gInfo:      [false,6],
        hAnimal:    [false,1],
        hide:       [true,6],
        kDungeon:   [false,1],
        kLocal:     [false,1],
        kNobility:  [false,1],
        listen:     [true,6],
        mSilent:    [true,6],
        oLock:      [false,1],
        proSailor:  [false,1],
        proArtist:  [true,1],
        search:     [false,6],
        sMotive:    [true,6],
        SoHand:     [false,1],
        spot:       [true,6],
        tumble:     [false,6],
        UMD:        [false,3]
      },
      hp_rolls: [6, 3, 4],
      bab: 1,
      base_saves: { f:1, r:3, w:1 },
      gear: [ // quantity, name, where, properties
        [1, "morningstar",    "sheath",   {type: "weapon"}],
        [1, "dagger",         "sheath",   {type: "weapon"}],
        [4, "dagger",         "hidden",   {type: "weapon"}],
        [1, "Rapier",         "weapon1",  {type: "weapon", mwk: true}],
        [1, "light crossbow", "sheath",   {type: "weapon"}],
        [20, "crossbow bolt", "sheath",   {type: "ammunition"}],
        [1, "Chain shirt",    "body",     {type: "armor", mwk: true, category: "light", bonus: 4, maxDex: 4, check: 1, arcaneFailure: 20}],
        [1, "Buckler",        "shield",   {type: "shield", mwk: true, bonus: 1, maxDex: "n", check: 0, arcaneFailure: 5}],
        [1, "backpack",       "worn",     {type: "container"}],
        [1, "adventures kit", "backpack", {}],
        [1, "thieves tools",  "backpack", {}],
        [1, "coinpurse",      "backpack", {type: "container"}],
        [6, "gold",           "coinpurse", {}],
        [1, "guard dog",      "", {}]
      ]
    };
