'use strict';

$(document).ready(function() {

  $.getJSON('http://worldcup.sfg.io/matches/today', function(matches, textStatus) {
    if (textStatus != 'success') {
      alert(textStatus);
    }

    listMatches(matches);

  });
});

function listMatches(matches) {
  var source = $('#list-template').html();
  var template = Handlebars.compile(source);
  var html = template({
    matches: matches
  });

  $('#main').append(html);
}
