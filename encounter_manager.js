 /* encounter_manager.js
  * Frankie
  * version 1.16
  * 25Oct2013

  TODO: add a keyword field for an environment filter

  * 1.16
  * change creature_popup() to call build_statblock()
  * add statblock primer object, and function to create the block

  * 1.14
  * use new glossary filler function g_load()

  * 1.10
  * comment out validate() function
  * created filters for environments
  * now parsing hint in synch
  * add monster qty to the synch
  * change random monster to only look in the filtered list
  * add filtered monster list

  * 1.8
  * create a loading checker
  * roll init on creature when moving to tracking table
  * create popup for full creature statblock
  * move several function definitions from the .htm page to here
  */

    // define functions to manipulate page
function synch(hint) {
  /* assume _page_data is authoritative
   * only update data for 'hint', or all if hint == null or hint == 'all'
   */

    // define how to synch the several parts of the page to _page_data
  var def_synch = {
        p_size: function(){
            //console.log('synching p_size');
            $('#p_size').val(_page_data.p_size);
          },
        p_lvls: function(){
            //console.log("synching p_lvls");
            var i, j,
                size = _page_data.p_size,
                chSize = size - _page_data.p_lvls.length,
                options, option_txt,
                $select, $lvls = $('#p_lvls');

              // make sure p_size matches p_lvls.length
            if(chSize < 0) { _page_data.p_lvls.splice(size); }              // array should be smaller, cut off the end
            else { for(i = 0; i < chSize; i++) _page_data.p_lvls.push(0); } // array should be bigger, pad it with 0's

              // build the new drop-downs
            //console.log("using group size " + size);
            for(i = 0, $lvls.empty(); i < size; i++, $select = null) {
              for(j = 0, options = []; j <= 20; j++) {
                option_txt = '<option' + (j == _page_data.p_lvls[i] ? " selected='selected'" : '') + '>' + j + '</option>';
                options.push(option_txt);
              }
              //console.log("made options " + options.length);
              $select = $("<select id='p_" + i + "_lvl' onchange='_page_data.p_lvls[" + i + "] = Number(this.value); synch(\"p_apl\")'>" + options.join() + "</select>");
              $lvls.append($select);
            }
          },
        p_apl:  function(){
            //console.log("synching p_apl");
            var i, apl_i = 0, apl = 0,
                levels = _page_data.p_lvls;
          
              // first re-calc p_apl
            for(i = 0; i < levels.length; i++, apl_i++) apl += levels[i];
            apl = Math.round(apl /= apl_i);

              // massage p_apl for over/under-sized groups
            if(levels.length > 5) apl++;
            if(levels.length < 4) apl--;
            $('#p_apl').html(_page_data.p_apl = apl);
          },
        chal_lvl: function(){
            //console.log('synching p_size');
            $('#chal_lvl').val(_page_data.chal_lvl);
          },
        chal_difficulty: function(){
            //console.log("synching chal_difficulty");
            var apl = _page_data.p_apl,
                cr = _page_data.chal_lvl,
                ret = {
                  0: 'Easy',
                  1: 'Average',
                  2: 'Challenging',
                  3: 'Hard',
                  4: 'Epic'
                }[cr - apl + 1];

            if((cr - apl) > 3) ret = 'Epic';
            if((cr - apl) < 0) ret = 'Easy';
            if(cr == 0 || apl == 0) ret = '';
          
            $('#chal_difficulty').html(_page_data.chal_difficulty = ret);
          },
        chal_xp_budget: function(){
            //console.log("synching chal_xp_budget");
            var i;

              // lookup XP in glossary
            for(i in glossary.advances) {
              if(glossary.advances[i].level == _page_data.chal_lvl) {
                _page_data.chal_xp_budget = glossary.advances[i].xp_monster;
                break;
              }
            }

            $('#chal_xp_budget').html(_page_data.chal_xp_budget);
          },
        monster_qty: function(){
              // if the filtered monster list is 0, then it probably hasn't been filled yet
            if(!_page_data.monster_filtered.length) filter_monsters();

            $('#monster_qty').html(_page_data.monster_qty);
          }
      };

  /* hint can be a string that matches one of:
   *  hint               affects
   * p_size             p_size, p_lvls, p_apl, chal_difficulty
   * p_lvls             p_apl, chal_difficulty
   * chal_lvl           chal_difficulty, chal_xp_budget, monster_filtered, monster_qty
   * environ_terrain    monster_filtered, monster_qty
   * environ_temp       monster_filtered, monster_qty
   * environ_plane      monster_filtered, monster_qty
   * monster_filtered   monster_qty

   *  use hint to do the synching
   */
  switch(hint) {
    case "p_size":
      def_synch.p_size();
    case "p_lvls":
      def_synch.p_lvls();
      def_synch.p_apl();
      def_synch.chal_difficulty();
      break;
    case "p_apl":
      def_synch.p_apl();
      break;
    case "chal_lvl":
      def_synch.chal_difficulty();
      def_synch.chal_xp_budget();
    case "environ_terrain":
    case "environ_temp":
    case "environ_plane":
      filter_monsters();
    case "monster_filtered":
      def_synch.monster_qty();
      break;
    case "all":
    default:
        // when in doubt, synch everything
      for(i in def_synch) def_synch[i]();
  }
}

function filter_monsters() {
  // check filters: encounter level, environments
  var l = [], m, c, displ,
      target = {
        temp: _page_data.environ_temp,
        terrain: _page_data.environ_terrain,
        plane: _page_data.environ_plane,
        level: _page_data.chal_lvl
      };

  _page_data.monster_filtered = [];

  function while_conditions() {
    var i, my_RE, F = [], env, any_qual,
        match_level = match_terrain = match_temp = match_plane = false;

      // check filter: Encounter Level
    if(target.level < c.CR) return false;
    match_level = true;

      // setup for Environment filters
    env = c.Environment;
    F['any'] = /any/.test(String(env));
    F['any_qual'] = /any (.*)/.test(String(env));
    any_qual = F['any_qual'] ? /any (.*)/.exec(String(env))[1] : '';

    if(F['any'] && !F['any_qual']) return true;

      // check filter: Environment Terrain
    if(target.terrain != 'any') {
        F['stream'] = /stream/.test(String(env));
        F['river'] = /river/.test(String(env));
        F['flowing'] = (F['stream'] || F['river'] || /\wflowing\w/.test(String(env)));
        F['coast'] = /\wcoast\w/.test(String(env));
        F['lake'] = /lake/.test(String(env));
        F['ocean'] = /ocean/.test(String(env));
        F['non_flowing'] = (F['coast'] || F['lake'] || F['ocean'] || /non-flowing/.test(String(env)));
        F['aquatic'] = (F['flowing'] || F['non_flowing'] || /aquatic/.test(String(env)));

        F['land'] = /land/.test(String(env));
        F['tundra'] = /tundra/.test(String(env));
        F['desert'] = (F['land'] || F['tundra'] || /desert/.test(String(env)));
        F['dungeon'] = (F['land'] || /dungeon/.test(String(env)));
        F['forest'] = (F['land'] || /forest/.test(String(env)));
        F['hill'] = (F['land'] || /hill/.test(String(env)));
        F['moor'] = /moor/.test(String(env));
        F['swamp'] = /swamp/.test(String(env));
        F['marsh'] = (F['land'] || F['moor'] || F['swamp'] || /marsh/.test(String(env)));
        F['alpine'] = /alpine/.test(String(env));
        F['meadow'] = /meadow/.test(String(env));
        F['mountain'] = (F['land'] || F['alpine'] || F['meadow'] || /mountain/.test(String(env)));
        F['farm'] = /farm/.test(String(env));
        F['grass'] = /grass/.test(String(env));
        F['field'] = /field/.test(String(env));
        F['plain'] = (F['land'] || F['farm'] || F['grass'] || F['field'] || /plain/.test(String(env)));
        F['underground'] = (F['land'] || /underground/.test(String(env)));
        F['urban'] = (F['land'] || /urban/.test(String(env)));
      if(F[target.terrain] ||
         (F['any_qual'] && (any_qual == target.temp)) ||
         (F['any_qual'] && (any_qual == target.plane))
          ) match_terrain = true;
    } else { match_terrain = true; }

      // check filter: Environment Temp
    if(target.temp != 'any') {
        F['warm'] = (/warm/.test(String(env)) && !/non-warm/.test(String(env)));
        F['temperate'] = /temperate/.test(String(env));
        F['cold'] = (/cold/.test(String(env)) && !/non-cold/.test(String(env)));
        F['non_warm'] = (F['temperate'] || F['cold'] || /non-warm/.test(String(env)));
        F['non_cold'] = (F['temperate'] || F['warm'] || /non-cold/.test(String(env)));
      if(F[target.temp] ||
         (F['any_qual'] && (any_qual == target.terrain)) ||
         (F['any_qual'] && (any_qual == target.plane))
          ) match_temp = true;
    } else { match_temp = true; }

      // check filter: Environment Plane
    if(target.plane != 'any') {
        F['abaddon'] = /abaddon/.test(String(env));
        F['abyss'] = /abyss/.test(String(env));
        F['hell'] = /hell/.test(String(env));
        F['evil'] = (F['abaddon'] || F['abyss'] || F['hell'] || /evil/.test(String(env)));
        F['elysium'] = /elysium/.test(String(env));
        F['heaven'] = /heaven/.test(String(env));
        F['good'] = (F['elysium'] || F['heaven'] || /good/.test(String(env)));
        F['air'] = /air/.test(String(env));
        F['earth'] = /earth/.test(String(env));
        F['fire'] = /fire/.test(String(env));
        F['water'] = /water/.test(String(env));
        F['elemental'] = (F['air'] || F['earth'] || F['fire'] || F['water'] || /elemental/.test(String(env)));
        F['planar'] = (F['elemental'] || F['evil'] || F['good'] || /planar/.test(String(env)));
      if(F[target.plane] ||
         (F['any_qual'] && (any_qual == target.terrain)) ||
         (F['any_qual'] && (any_qual == target.temp))
          ) match_plane = true;
    } else { match_plane = true; }

    return (match_level && match_terrain && match_temp && match_plane);
  }

  for(m = 0; m < glossary.creatures.length; m++) {
    c = glossary.creatures[m];
    if (while_conditions()) _page_data.monster_filtered.push(m);
  };

  _page_data.monster_qty = _page_data.monster_filtered.length;
}

function get_random_monster() {
  var l = [], m, c, displ;

  if(!_page_data.monster_qty) return;

  m = Math.floor(Math.random() * (_page_data.monster_filtered.length));
  c = glossary.creatures[_page_data.monster_filtered[m]];

  displ = ' <span ' + "onclick='add_to_tracking(" + _page_data.monster_filtered[m] + ")'" + '>+</span> ' +
    c.Name +
    ': CR' + c.CR +
    ': (' + c.XP + ' XP; Environ: ' + c.Environment + '; ' + c.Organization + ')';

  $('#monster_list').append($('<li>').html(displ));
}

function add_to_tracking(m) {
  var i, tr_details, new_init,
      d20 = new dice_roller,
      c = glossary.creatures[m],
      track_id = 'track_row_monster_' + m,
      $track_row = $('<tr id=' + "'" + track_id + "'" + '>');

  new_init = d20.roll() + Number(c.Init);
  tr_details = '<td> <span onclick=' + "'$(\"#" + track_id + "\").remove();'" + '>-</span> </td>' +
    "<td contenteditable='true' sorttable_customkey='" + new_init + "'>" + new_init + '</td>' +
    '<td onclick=' + "'creature_popup(" + m + ");'" + '>' + c.Name + '</td>' +
    "<td contenteditable='true' sorttable_customkey='" + Number(c.HP) + "'>" + c.HP + '</td>' +
    '<td>' + c.AC + '</td>' +
    '<td>' + c.Senses + '</td>';
  $('#track_table').append($track_row.html(tr_details))
}

/* function validate(dom) {
  if(dom.value == 'Planar') {
    $('#environ_temp').addClass('hidden');
    $('#environ_plane').removeClass('hidden');
  }
  else {
    $('#environ_temp').removeClass('hidden');
    $('#environ_plane').addClass('hidden');
  }
}
 *
 */

function creature_popup(m) {
  var c = glossary.creatures[m],
      txt = "<input type='button' value='Close' onclick='$(\"#sb_wrapper\").addClass(\"hidden\");'><br>";
  txt += build_statblock(c, statblock);
  $("#sb_wrapper").html(txt);
  $('#sb_wrapper').removeClass('hidden');

  return true;
}

  function build_statblock(c, sb, p_opt) {
    if(!c || !sb) return '';
    var i, tmp, branches,
        node_label, node_open, node_data, node_close,
        key, opt;
    // use 'c' for raw data, and 'sb' for instructions
    // returns string of stringified 'sb' including 'c' when appropriate

// check 'sb' for several properties to build up 'opt'
    key = "", opt = {
      htm_tag: "",
      tag_class: "",
      tag_style: "",
      htm_subtag: "",
      sb_label: "",
      sb_seperator: "",
      sb_record: "",
      rec_label: "",
      fix_number_sign: false,
      optional: false
    };
    for(key in opt) if(sb[key]) opt[key] = sb[key];
    if(!opt.htm_tag) opt.htm_tag = p_opt.htm_subtag;

// build the tag for node_data wrapper
    node_label = node_open = node_data = node_close = "";
    node_label = opt.sb_label ? '<div class="s_b_label">' + opt.sb_label + '</div>' :
                (opt.rec_label ? '<b>' + opt.rec_label + '</b> ' : '');
    node_open = '<' + opt.htm_tag
        + (opt.sb_record ? ' id="m_' + opt.sb_record + '"' : '')
        + (opt.tag_class ? ' class="' + opt.tag_class + '"' : '')
        + (opt.tag_style ? ' style="' + opt.tag_style + '"' : '')
        + '>';
    node_close = '</' + opt.htm_tag + '>';

// node_data is either the branches, or a record. NOT BOTH
    if(opt.sb_record) {
      if(c[opt.sb_record] || !opt.optional) {
        node_data = c[opt.sb_record];
        if(opt.fix_number_sign) {
          node_data = Number(node_data);
          if(node_data > 0) node_data = "+" + node_data;
        }
      }
    } else {
  // run through the numbered properties
      i = 0, tmp = "", branches = [];
      while(sb[i]) {
        tmp = build_statblock(c, sb[i], opt);
        if(tmp) branches.push(tmp);
        i++;
      };
      if(branches.length || !opt.optional)
        node_data = branches.join(opt.sb_seperator);
    }

// put it all together
    return (node_data || !opt.optional) ? node_label + "\n" + node_open + node_data + node_close + "\n" : '';
  }

window.onload = function () {
    // Load needed glossary items
  g_load(['creatures', 'advances']);
};

  // define object to hold values for the page
var _page_data = {
  p_size: 0,
  p_lvls: [],
  p_apl: 0,
  chal_lvl: 0,
  chal_difficulty: '',
  chal_xp_budget: 0,
  environ_terrain: 'any',
  environ_temp: 'any',
  environ_plane: 'any',
  monster_qty: 0,
  monster_filtered: [],
  monster_list: []
},
  statblock = {
    htm_tag: "div",
//    tag_style: "width: 50%",
    htm_subtag: "div",
    0: {
      tag_class: "s_b_block",
      htm_subtag: "p",
      0: {
        htm_subtag: "span",
        0: { sb_record: "Description_Visual", tag_style: "font-style: italic" }
      }
    },
    1: {
      tag_class: "s_b_title",
      sb_seperator: "&nbsp;",
      htm_subtag: "div",
      0: {
        tag_style: "float: left",
        htm_subtag: "span",
        0: { sb_record: "Name" }
      },
      1: {
        tag_style: "float: right",
        htm_subtag: "span",
        0: { sb_record: "CR", rec_label: "CR" }
      }
    },
    2: {
      tag_class: "s_b_block",
      htm_subtag: "p",
      0: {
        tag_class: "stat_line",
        htm_subtag: "span",
        optional: true,
        0: { sb_record: "XP", rec_label: "XP", optional: true }
      },
      1: {
        sb_seperator: " ",
        tag_class: "stat_line",
        htm_subtag: "span",
        0: { sb_record: "Gender", optional: true },
        1: { sb_record: "Race" },
        2: { sb_record: "Class" }
      },
      2: {
        sb_seperator: " ",
        tag_class: "stat_line",
        htm_subtag: "span",
        0: { sb_record: "Alignment" },
        1: { sb_record: "Size" },
        2: { sb_record: "Type" },
        3: { sb_record: "SubType", optional: true }
      },
      3: {
        sb_seperator: "; ",
        tag_class: "stat_line",
        htm_subtag: "span",
        0: { sb_record: "Init", rec_label: "Init", fix_number_sign: true },
        1: { sb_record: "Senses", rec_label: "Senses" }
      },
      4: {
        tag_class: "stat_line",
        htm_subtag: "span",
        optional: true,
        0: { sb_record: "Aura", rec_label: "Aura", optional: true }
      }
    },
    3: { sb_label: "DEFENSE",
      tag_class: "s_b_block",
      htm_subtag: "p",
      0: {
        sb_seperator: "; ",
        tag_class: "stat_line",
        htm_subtag: "span",
        0: { sb_record: "AC", rec_label: "AC" },
        1: { sb_record: "AC_Mods", optional: true }
      },
      1: {
        sb_seperator: " ",
        tag_class: "stat_line",
        htm_subtag: "span",
        0: { sb_record: "HP", rec_label: "hp" },
        1: { sb_record: "HD" },
        2: { sb_record: "HP_Mods", optional: true }
      },
      2: {
        sb_seperator: "; ",
        tag_class: "stat_line",
        htm_subtag: "span",
        0: { sb_record: "Fort", rec_label: "Fort", fix_number_sign: true },
        1: { sb_record: "Ref", rec_label: "Ref", fix_number_sign: true },
        2: { sb_record: "Will", rec_label: "Will", fix_number_sign: true },
        3: { sb_record: "Save_Mods", optional: true }
      },
      3: {
        sb_seperator: "; ",
        tag_class: "stat_line",
        htm_subtag: "span",
        optional: true,
        0: { sb_record: "DR", rec_label: "DR", optional: true },
        1: { sb_record: "Immune", rec_label: "Immune", optional: true },
        2: { sb_record: "Resist", rec_label: "Resist", optional: true },
        3: { sb_record: "SR", rec_label: "SR", optional: true },
        4: { sb_record: "Vulnerability", rec_label: "Vulnerability", optional: true }
      },
      4: {
        tag_class: "stat_line",
        htm_subtag: "span",
        optional: true,
        0: { sb_record: "Weaknesses", rec_label: "Weaknesses", optional: true }
      }
    },
    4: { sb_label: "OFFENSE",
      tag_class: "s_b_block",
      htm_subtag: "p",
      0: {
        sb_seperator: "; ",
        tag_class: "stat_line",
        htm_subtag: "span",
        0: { sb_record: "Speed", rec_label: "Speed" },
        1: { sb_record: "Speed_Mod", optional: true }
      },
      1: {
        tag_class: "stat_line",
        htm_subtag: "span",
        optional: true,
        0: { sb_record: "Melee", rec_label: "Melee", optional: true }
      },
      2: {
        tag_class: "stat_line",
        htm_subtag: "span",
        optional: true,
        0: { sb_record: "Ranged", rec_label: "Ranged", optional: true }
      },
      3: {
        tag_class: "stat_line",
        htm_subtag: "span",
        optional: true,
        0: { sb_record: "SpecialAttacks", rec_label: "Special Attacks", optional: true }
      },
      4: {
        sb_seperator: "; ",
        tag_class: "stat_line",
        htm_subtag: "span",
        0: { sb_record: "Space", rec_label: "Space" },
        1: { sb_record: "Reach", rec_label: "Reach" }
      },
      5: {
        tag_class: "stat_line",
        htm_subtag: "span",
        optional: true,
        0: { sb_record: "SpellLikeAbilities", rec_label: "Spell-Like Abilities", optional: true }
      },
      6: {
        tag_class: "stat_line",
        htm_subtag: "span",
        optional: true,
        0: { sb_record: "SpellsKnown", rec_label: "Spells Known", optional: true }
      },
      7: {
        tag_class: "stat_line",
        htm_subtag: "span",
        optional: true,
        0: { sb_record: "SpellsPrepared", rec_label: "Spells Prepared", optional: true }
      },
      8: {
        tag_class: "stat_line",
        htm_subtag: "span",
        optional: true,
        0: { sb_record: "SpellDomains", rec_label: "Spell Domains", optional: true }
      },
      9: {
        tag_class: "stat_line",
        htm_subtag: "span",
        optional: true,
        0: { sb_record: "Bloodline", rec_label: "Bloodline", optional: true }
      },
      10: {
        tag_class: "stat_line",
        htm_subtag: "span",
        optional: true,
        0: { sb_record: "FocusedSchool", rec_label: "Focused School", optional: true }
      },
      11: {
        tag_class: "stat_line",
        htm_subtag: "span",
        optional: true,
        0: { sb_record: "ProhibitedSchools", rec_label: "Prohibited Schools", optional: true }
      }
    },
    5: { sb_label: "STATISTICS",
      tag_class: "s_b_block",
      htm_subtag: "p",
      0: {
        sb_seperator: "; ",
        tag_class: "stat_line",
        htm_subtag: "span",
        0: { sb_record: "AbilitiyScores" },
        1: { sb_record: "AbilitiyScore_Mods", optional: true }
      },
      1: {
        sb_seperator: "; ",
        tag_class: "stat_line",
        htm_subtag: "span",
        0: { sb_record: "BaseAtk", rec_label: "Base Attack", fix_number_sign: true },
        1: { sb_record: "CMB", rec_label: "CMB", fix_number_sign: true },
        2: { sb_record: "CMD", rec_label: "CMD" }
      },
      2: {
        tag_class: "stat_line",
        htm_subtag: "span",
        0: { sb_record: "Feats", rec_label: "Feats" }
      },
      3: {
        sb_seperator: "; ",
        tag_class: "stat_line",
        htm_subtag: "span",
        0: { sb_record: "Skills", rec_label: "Skills" },
        1: { sb_record: "RacialMods", rec_label: "Racial Modifiers", optional: true }
      },
      4: {
        tag_class: "stat_line",
        htm_subtag: "span",
        0: { sb_record: "Languages", rec_label: "Languages" }
      },
      5: {
        tag_class: "stat_line",
        htm_subtag: "span",
        optional: true,
        0: { sb_record: "SQ", rec_label: "SQ", optional: true }
      }
    },
    6: { sb_label: "SPECIAL ABILITIES",
      tag_class: "s_b_block",
      htm_subtag: "p",
      optional: true,
      0: {
        tag_class: "stat_line",
        htm_subtag: "span",
        optional: true,
        0: { sb_record: "SpecialAbilities", optional: true }
      }
    },
    7: { sb_label: "ECOLOGY",
      tag_class: "s_b_block",
      htm_subtag: "p",
      0: {
        tag_class: "stat_line",
        htm_subtag: "span",
        0: { sb_record: "Environment", rec_label: "Environment" }
      },
      1: {
        tag_class: "stat_line",
        htm_subtag: "span",
        0: { sb_record: "Organization", rec_label: "Organization" }
      },
      2: {
        tag_class: "stat_line",
        htm_subtag: "span",
        0: { sb_record: "Treasure", rec_label: "Treasure" }
      }
    },
    8: {
      tag_class: "s_b_block",
      htm_subtag: "p",
      0: {
        htm_subtag: "span",
        0: { sb_record: "Description" }
      }
    }
  };
