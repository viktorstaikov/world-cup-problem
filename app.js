'use strict';

$(document).ready(function() {

  $.getJSON('http://worldcup.sfg.io/matches/today', function(matches, textStatus) {
    if (textStatus != 'success') {
      alert(textStatus);
    }

    registerHelpers();
    listMatches(matches);

  });
});

function registerHelpers() {
  Handlebars.registerHelper('status', function() {
    var match = this;
    var html = '<div>PUT SOME HTML</div>';

    var startDate = new Date(match.datetime);
    var hours = startDate.getHours();
    var minutes = startDate.getMinutes();

    if (match.status == 'future') {
      var startAt = hours + ':' + (minutes < 10 ? '0' : '') + minutes + ' h';

      html = '<h3>Starts at: ' + startAt + '</h3>';
    } else {
      var source = $('#progress-bar-tmpl').html();
      var template = Handlebars.compile(source);

      var now = new Date(Date.now());

      var minutesPassed = (now.getHours() - hours) * 60 + now.getMinutes() - minutes;

      if (45 < minutesPassed && minutesPassed < 60) {
        minutesPassed = 45;
      }
      if (60 < minutesPassed) {
        minutesPassed -= 15;
      }

      html = template({
        pct: minutesPassed * 100 / 90,
        minLeft: 90 - minutesPassed
      });
    }
    return html;
  });
}

function listMatches(matches) {
  var source = $('#list-template').html();
  var template = Handlebars.compile(source);
  var html = template({
    matches: matches
  });

  $('#main').empty();
  $('#main').append(html);
}
