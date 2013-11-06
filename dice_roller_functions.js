 /* dice_roller_functions.js
  * Frankie
  * version 1.2
  * 1Mar2013

  * changed to object def; added verbosity; cleaned up defaults
  */

function by_number(a, b) { return ((a >= b) ? ((a > b) ? -1 : 0) : 1); }

function dice_roller(inp) {

    // defaults: 1 d20, no reroll
  this.sides = 20;
  this.quantity = 1;
  this.reroll = 0;
  this.drop = 0;
  this.verb = 0;

  if(inp) {
    if(inp.sides) this.sides = inp.sides;
    if(inp.quantity) this.quantity = inp.quantity;
    if(inp.reroll) this.reroll = inp.reroll;
    if(inp.drop) this.drop = inp.drop;
    if(inp.verb) this.verb = inp.verb;
  };

  this.roll = function(verb) {
    if(verb == 'undefined') verb = this.verb;
    var i, total = 0, rolls = [], one_dice = 0, ret;

    for(i = 0; i < this.quantity; i++) {
      do { one_dice = Math.floor(Math.random() * this.sides) + 1; }
        while(one_dice < this.reroll);
      rolls.push(one_dice); };
    rolls.sort(by_number);
    for(i = 0; i < (rolls.length - this.drop); i++) total += rolls[i];

    switch(verb) {
      case 1:  ret = { total: total, rolls: rolls };
        break;
      case 2:  ret = { total: total, rolls: rolls, data: inp };
        break;
      default: ret = total;
    };

    return ret; };

}


