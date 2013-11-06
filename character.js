/* This is character.js 1.0 valid as of 2/25/2013
* This file currently only contains logic for 
* generating stats. It will eventually contain
* all of the functional logic for generating and saving a character.
*
*/
$(document).ready(function () {
    $(".navButton").hover(function () { $(this).css('background-color', 'black') });
    $(".navButton").mouseleave(function () { $(this).css('background', '#e5e0e0') });
    $(".menuItem").hover(function () { $(this).css('color', 'white') });
    $(".menuItem").mouseleave(function () { $(this).css('color', 'black') });
    $("#tabs").tabs();
    $("#m1").menu();
    $("#m2").menu();
    $("#m3").menu();
    $("#m4").menu();
    $("#m5").menu();
    //Ability Scores tab logic
    $("#methods").selectable({
        selected: function () {
            $('#rolls li').remove();
            $('label[class*="score"]').text('00');
            $('label[class*="mod"]').text('00');
        }
    });

    $('.sscore,.dscore,.cscore,.iscore, .wscore, .hscore').droppable({
        drop: function (event, ui) {

            $(this).find(".score").remove();

            $(this).text(ui.draggable.text());


            $(ui.draggable).draggable('disable');
            var mod = Math.floor((Number(ui.draggable.text()) / 2) - 5);
            
            applyMod($(this).attr('class'), mod);

            $(this).attr('title', 'modifier = ' + mod);
        }
    });

    $('#roll').click(function () {
        $('#rolls li').remove();
        $('label[class*="score"]').text('00');
        $('label[class*="mod"]').text('00');
        getStats($('#methods .ui-selected').attr('id'));
    });

    $('#reset').click(function () {
        $('label[class*="score"]').text('00');
        $('label[class*="mod"]').text('00');
        $('#rolls li').remove();
    });

    $('#assign').click(function () {
        $('label[class*="score"]').text('00');
        $('label[class*="mod"]').text('00');
        $('li[title*="rolls"]').draggable('enable');
    });

    $('#save').button({
        icons: {
            primary: 'ui-icon-disk'
        },
        label: 'Save',
        text:true
    });

    $('#roll').button({
        label: 'Roll'
    });

    $('#reset').button({
        label: 'Reset'
    });

    $('#assign').button({
        label: 'redo'
    });

    $('#save').hover(
        function () {
            $('#save').removeClass('ui-state-hover');
        }
       );

    //Races tab functionality
    $('#raceCategories').accordion({
        heightStyle: 'content',
        collapsible: true,
        active: false
    });


});
function getStats(method) {
    if (typeof method == 'undefined') {
        alert('Choose a method to generate your stats');
    }
    else {
        switch (method) {
            case '1': statMethod1();
                break;
            case '2': statMethod2();
                break;
            case '3': statMethod3();
                break
            case '4': statMethod4();
                break;
            case '5': statMethod5();
                break;
            case '6': statMethod6();
                break
            case '7': statMethod7();
                break;

        }
    }
}
function statMethod1() {
    var total = 0;
    var roll = 0;
    var rolls = new Array(3);
    var data = new Array(6);

    for (var j = 0; j < 6; j++) {
        for (var i = 0; i < 3; i++) {
            roll = (Math.floor(Math.random() * 6) + 1);
            total += roll;
            rolls[i] = roll;
        }
        rolls.sort(function (a, b) { return b - a });
        data[j] = { key: total, value: rolls.join(',') };
        total = 0;
        roll = 0;
    }

    data.sort(function (a, b) {
        return a.key - b.key
    });

    for (var h = 0; h < data.length; h++) {
        $('#rolls').append('<li title=" rolls : ' + data[h].value + '" id="roll' + h + '">' + data[h].key + '</li>');
    }
    $('#rolls li').draggable({
        appendTo: "body",
        helper: "clone"
    });
}
function statMethod2() {
    var total = 0;
    var roll = 0;
    var rolls = new Array(4);
    var data = new Array(6);

    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 4; j++) {
            roll = (Math.floor(Math.random() * 6) + 1);
            rolls[j] = roll;
        }
        rolls.sort(function (a, b) { return b - a });
        for (var k = 0; k < 3; k++) {
            total += Number(rolls[k]);
        }
        data[i] = { key: total, value: rolls.join(',') };
        total = 0;
        roll = 0;
    }
    data.sort(function (a, b) {
        return a.key - b.key
    });

    for (var l = 0; l < data.length; l++) {
        $('#rolls').append('<li title=" rolls : ' + data[l].value + '">' + data[l].key + '</li>');
    }
    $('#rolls li').draggable({
        appendTo: "body",
        helper: "clone"
    });
}
function statMethod3() {
    var total = 0;
    var roll = 0;
    var rolls = new Array(4);
    var data = new Array(6);

    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 4; j++) {
            roll = (Math.floor(Math.random() * 6) + 1);
            if (roll == '1') {
                while (roll == '1') {
                    roll = (Math.floor(Math.random() * 6) + 1);
                }
            }
            rolls[j] = roll;
        }
        rolls.sort(function (a, b) { return b - a });
        for (var k = 0; k < 3; k++) {
            total += Number(rolls[k]);
        }
        data[i] = { key: total, value: rolls.join(',') };
        total = 0;
        roll = 0;
    }

    data.sort(function (a, b) {
        return a.key - b.key
    });

    for (var l = 0; l < data.length; l++) {
        $('#rolls').append('<li title=" rolls : ' + data[l].value + '">' + data[l].key + '</li>');
    }
    $('#rolls li').draggable({
        appendTo: "body",
        helper: "clone"
    });
}
function statMethod4() {
    var total = 0;
    var roll = 0;
    var rolls = new Array(4);
    var data = new Array(6);

    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 4; j++) {
            roll = (Math.floor(Math.random() * 6) + 1);
            if (roll == '1' || roll == '2') {
                while (roll == '1' || roll == '2') {
                    roll = (Math.floor(Math.random() * 6) + 1);
                }
            }
            rolls[j] = roll;
        }
        rolls.sort(function (a, b) { return b - a }); 

        for (var k = 0; k < 3; k++) {
            total += Number(rolls[k]);
        }

        data[i] = { key: total, value: rolls.join(',') };
        total = 0;
        roll = 0;
    }

    data.sort(function (a, b) {
        return a.key - b.key
    });

    for (var l = 0; l < data.length; l++) {
        $('#rolls').append('<li title=" rolls : ' + data[l].value + '">' + data[l].key + '</li>');
    }

    $('#rolls li').draggable({
        appendTo: "body",
        helper: "clone"
    });
}
function statMethod5() {
    var total = 0;
    var roll = 0;
    var rolls = new Array(5);
    var data = new Array(6);

    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 5; j++) {
            roll = (Math.floor(Math.random() * 6) + 1);
            rolls[j] = roll;
        }
        rolls.sort(function (a, b) { return b - a }); 
        for (var k = 0; k < 3; k++) {
            total += Number(rolls[k]);
        }

        data[i] = { key: total, value: rolls.join(',') };
        total = 0;
        roll = 0;
    }

    data.sort(function (a, b) {
        return a.key - b.key
    });
    for (var l = 0; l < data.length; l++) {
        $('#rolls').append('<li title=" rolls : ' + data[l].value + '">' + data[l].key + '</li>');
    }
    $('#rolls li').draggable({
        appendTo: "body",
        helper: "clone"
    });
}
function statMethod6() {
    var total = 0;
    var roll = 0;
    var rolls = new Array(5);
    var data = new Array(6);

    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 5; j++) {
            roll = (Math.floor(Math.random() * 6) + 1);
            if (roll == '1') {
                while (roll == '1') {
                    roll = (Math.floor(Math.random() * 6) + 1);
                }
            }
            rolls[j] = roll;
        }
        rolls.sort(function (a, b) { return b - a });
        for (var k = 0; k < 3; k++) {
            total += Number(rolls[k]);
        }

        data[i] = { key: total, value: rolls.join(',') };
        total = 0;
        roll = 0;
    }

    data.sort(function (a, b) {
        return a.key - b.key
    });

    for (var l = 0; l < data.length; l++) {
        $('#rolls').append('<li title=" rolls : ' + data[l].value + '">' + data[l].key + '</li>');
    }
    $('#rolls li').draggable({
        appendTo: "body",
        helper: "clone"
    });
}
function statMethod7() {
    var total = 0;
    var roll = 0;
    var rolls = new Array(5);
    var data = new Array(6);

    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 5; j++) {
            roll = (Math.floor(Math.random() * 6) + 1);
            if (roll == '1' || roll == '2') {
                while (roll == '1' || roll == '2') {
                    roll = (Math.floor(Math.random() * 6) + 1);
                }
            }
            rolls[j] = roll;
        }
        rolls.sort(function (a, b) { return b - a });
        for (var k = 0; k < 3; k++) {
            total += Number(rolls[k]);
        }

        data[i] = { key: total, value: rolls.join(',') };
        total = 0;
        roll = 0;
    }
    data.sort(function (a, b) {
        return a.key - b.key
    });

    for (var l = 0; l < data.length; l++) {
        $('#rolls').append('<li title=" rolls : ' + data[l].value + '">' + data[l].key + '</li>');
    }

    $('#rolls li').draggable({
        appendTo: "body",
        helper: "clone"
    });
}
function applyMod(target, modifier) {
    var v = target.substr(0, 1);
    var t = '.' + v + 'mod';
    switch (v) {
        case 's': $(t).text(modifier);
            break;
        case 'd': $(t).text(modifier);
            break;
        case 'c': $(t).text(modifier);
            break;
        case 'i': $(t).text(modifier);
            break;
        case 'w': $(t).text(modifier);
            break;
        case 'h': $(t).text(modifier);
            break;
    }
}