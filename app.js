'use strict';

var _teams;

$(document).ready(function() {

  registerHelpers();

  showTodaysMatches();

  $('#todays-matches').on('click', function(e) {
    $('#main > :not(header)').remove();
    showTodaysMatches();
  });

  $('#team-info').on('click', function(e) {
    $('#main > :not(header)').remove();
    showTeamInfo();
  });
});

function showTodaysMatches() {
  $.getJSON('http://worldcup.sfg.io/matches/today', function(matches, textStatus) {
    if (textStatus != 'success') {
      alert(textStatus);
    }



    listMatches(matches);
  });
}

function showTeamInfo() {
  $.getJSON('http://worldcup.sfg.io/teams/results', function(teams, textStatus) {
    if (textStatus != 'success') {
      alert(textStatus);
    }

    _teams = teams;
    listTeams(_teams);
  });
}

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

      var status = 'Unknown status';
      if (minutesPassed > 90) {
        minutesPassed = 90;
        status = 'Finished';
      } else {
        status = (90 - minutesPassed) + 'minutes left';
      }

      html = template({
        pct: minutesPassed * 100 / 90,
        msg: status
      });
    }
    return html;
  });

  Handlebars.registerHelper('option', function() {
    var team = this;
    return new Handlebars.SafeString('<option value="' + team.fifa_code + '">' + team.country);
  });
}

function listMatches(matches) {
  var source = $('#list-template').html();
  var template = Handlebars.compile(source);
  var information = {};
  var html = template({
    matches: matches
  });

  $('#loading-image').hide();
  $('#main').append(html);

  var popoverSrc = $('#popover-tmpl').html();
  var popoverTmpl = Handlebars.compile(popoverSrc);

  $('.flag').on('click', function(e) {
    var $flag = $(e.currentTarget);
    var countryCode = $(this).data('code');
    $.getJSON('http://worldcup.sfg.io/teams/results', function(countryMatches) {
      countryMatches.forEach(function(match) {
        if (match.fifa_code === countryCode) {
          information = match;
        }
      });

      $flag.popover({
        placement: 'bottom',
        html: false,
        content: popoverTmpl(information),
        title: information.country,
        trigger: 'manual'
      });
      console.log(popoverTmpl(information));
      $flag.popover('show');
      $('body').on('click', function() {
        $flag.popover('destroy');
      });

    });
  });
}

function listTeams(teams) {
  var selectSource = $('#select-team-tmpl').html();
  var selectTemplate = Handlebars.compile(selectSource);
  var html = selectTemplate({
    teams: teams
  });
  var selectedTeam = {};
  var infoSource = $('#team-information-tmpl').html();

  $('#loading-image').hide();
  $('#main').append(html);

   $('.select-country-options').change(function() {
    var selected = $(this).val();
    teams.forEach(function(team) {
      if (team.fifa_code === selected) {
        selectedTeam = team;
      }
    });
    var infoTemplate = Handlebars.compile(infoSource);
    var teamHtml = infoTemplate(selectedTeam);
    $('.country-information').replaceWith(teamHtml);
  });
}
