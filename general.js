 /* general.js
  * Frankie
  * version 1.2
  * 28May2013

  * 1.14
  * combine project-wide ajax calls to fill in glossary data

  * things that are unneeded are deleted; all else moved

  * 1.2
  * added glossary={} for treasure_generator to work
  */

function gid(id) { return document.getElementById(id); }

function g_load(g) {
  // g is a string or an array of strings, that correspond to the objects in glossary
  if(typeof(g) == 'string') g = new Array(g);

  var checkLoader = setInterval(function(d){
        for(var i in g) if(!glossary[g[i]].status.ready) return;
        window.clearInterval(checkLoader);
        $('#loading').hide();
        synch();
      },
    1000);

  function ajax_retrieve(url, obj, type, supress_status) {
    jQuery.ajax({
        url: url,
        dataType: 'text',
        complete: function(resp){
            if(!supress_status) obj.status.loading = true;
            $.csv.toObjects(resp.responseText).forEach(function (d) { obj.push(new type(d)); });
            if(!supress_status) obj.status.ready = true;
          }
      });
  }

  //console.log(g);
  for(var i in g) switch(g[i]) {
    case "skills":
      ajax_retrieve('csv_data/skills.csv', glossary[g[i]], G_Skill); break;
    case "abilities":
      //console.log('inside abilities');
      ajax_retrieve('csv_data/abilities.csv', glossary[g[i]], G_Ability); break;
    case "creatures":
      //console.log('inside creatures');
      ajax_retrieve('csv_data/monster_bestiary_bestiary1_not-full.csv', glossary[g[i]], G_Creature); break;
    case "advances":
      //console.log('inside advances');
      ajax_retrieve('csv_data/advancement.csv', glossary[g[i]], G_Advancement); break;
    case "gear":
      ajax_retrieve('csv_data/armor.csv', glossary[g[i]], G_Armor, true);
      ajax_retrieve('csv_data/arms.csv', glossary[g[i]], G_Weapon, true);
      ajax_retrieve('csv_data/magic_items_core_non-full.csv', glossary[g[i]], G_MagicItem); break;
  }

}

