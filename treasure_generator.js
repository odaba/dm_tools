 /* treasure_generator.js
  * Frankie
  * version 1.12
  * 28May2013

  * 1.14
  * use new glossary filler function g_load()

  * 1.12
  * remove Advance class
  * encounter treasure is based on party level in pathfinder, not challenge level
  * moved upd() logic into synch()
  * added synch() to synch _page_data
  * added _page_data to track data from .htm
  * moved a bunch of stuff from .htm script to onload function here

  * 1.2
  * added a bunch of stuff, noteably, getRandomItem()
  */

function Trsr() {
  value = 0;
  resale = 0;
// NOTE: Trsr: every entry in 'items' should hava a value, and a resale
  items = [];

  party_level = 0;
}

/************************/

function synch() {
  function pc_wealth(lvl) {
    var i, ret;
    for(i in glossary.advances) if(glossary.advances[i].level == lvl) break;
    ret = Number(glossary.advances[i].wealth_pc);
    return ret ? ret : Number(glossary.advances[i].wealth_npc_basic);
  }

    // define how to synch the several parts of the page to _page_data
  var i,
      def_synch = {
        p_size: function(){
            //console.log('synching p_size');
            $('#p_size').val(_page_data.p_size);
          },
        p_lvl: function(){
            $('#p_lvl').val(_page_data.p_lvl);
          },
        chal_lvl: function(){
            $('#chal_lvl').val(_page_data.chal_lvl);
          },
        note_wealth: function(){
            //console.log('synching note_wealth');
            _page_data.note_wealth = pc_wealth(_page_data.p_lvl + 1);
            $('#note_wealth').html(_page_data.note_wealth);
          },
        t_roll: function(){
            $('#t_roll').val(_page_data.t_roll);
          },
        t_val_target: function(){
            _page_data.t_val_target = (pc_wealth(_page_data.p_lvl + 1) / 13) + _page_data.t_roll;
            $('#t_val_target').html(Math.round(_page_data.t_val_target));
          },
        t_per_target: function(){
            _page_data.t_per_target = _page_data.t_val_target / _page_data.p_size;
            $('#t_per_target').html(Math.round(_page_data.t_per_target));
          },
        t_item_max: function(){
            _page_data.t_item_max = pc_wealth(_page_data.p_lvl) / 2;
            $('#t_item_max').html(Math.round(_page_data.t_item_max));
          },
        t_incl_total: function(){
            $('#t_incl_total').html(_page_data.t_incl_total);
          },
        t_new_roll: function(){
            _page_data.t_new_roll = _page_data.t_val_target - _page_data.t_incl_total;
            $('#t_new_roll').html(Math.round(_page_data.t_new_roll));
          }
      };
  for(i in def_synch) def_synch[i]();

  /* hint can be a string that matches one of:
   *  hint           affects
   * p_size         p_size, p_lvls, p_apl, chal_difficulty
   * p_lvl          p_apl, chal_difficulty
   * chal_lvl       chal_difficulty, chal_xp_budget, monster_filtered, monster_qty
   * note_wealth    monster_filtered, monster_qty
   * t_roll         monster_filtered, monster_qty
   * t_val_target   monster_filtered, monster_qty
   * t_per_target   monster_filtered, monster_qty
   * t_item_max     monster_filtered, monster_qty
   * t_incl_gear    monster_filtered, monster_qty
   * t_total_val    monster_filtered, monster_qty
   * t_new_roll     monster_filtered, monster_qty

   *  use hint to do the synching
   */
}

// TODO: refactor these 4 functions into a single object, use Trsr class to hold the treasure, synch that with UL #t_incl_gear
function getRandomItem(max_value) {
  var num_items, match_items, this_item;
    num_items = glossary.gear.length;
    match_items = (
      function(){
        var i = [];
        glossary.gear.forEach(
          function(d){
            if( (d.group != 'Artifact') &&
                (d.group != 'Cursed') &&
                (d.costValue <= max_value)) this.push(d);
          }, i);
        return i;
      })();   // filter out artifacts, and expensive gear
    //console.log(match_items);
    this_item = Math.floor(Math.random() * (match_items.length)); // get random gear from what is left
  return match_items[this_item];
}

function addRandomItem() {
  var itm = getRandomItem(_page_data.t_item_max);
  _page_data.t_incl_total += itm.cost;
  $('#t_incl_gear').append($('<li>').html("<span onclick='removeItem(this); synch();'> - </span>" + itm.name + ": " + itm.cost));
}

function removeItem(n) {
  var $li = $(n.parentNode);
  _page_data.t_incl_total -= Number(/: (.*)$/.exec($li.html())[1]);
  $li.remove();
}

function clearItems() {
  $('#t_incl_gear').html('');
  _page_data.t_incl_total = 0;
}

window.onload = function () {
    // Load needed glossary items
  g_load(['gear', 'advances']);
};

/************************/

  // define object to hold values for the page
var defaults = {
      rollover: 0,
      incl_gear: [{name: 'heavy mace', mwk: true}]
    },
    trsr_list = {
      trsrs: [], // array of trsr objects
      rollover: 0,
      wishlist: [] // array of items
    },
    _page_data = {
      p_size: 4,
      p_lvl: 1,
      chal_lvl: 0,
      note_wealth: 0,
      t_roll: 0,
      t_val_target: 0,
      t_per_target: 0,
      t_item_max: 0,
      t_incl_gear: [],
      t_total_val: 0,
      t_incl_total: 0,
      t_new_roll: 0
    };
