'use strict';

var _teams;
var _selected = [];

$(document).ready(function() {

  registerHelpers();

  $('#todays-matches').on('click', function(e) {
    $('#main > :not(header)').remove();

    $('li.active').removeClass('active');
    $(e.currentTarget.parentElement).addClass('active');

    showTodaysMatches();
  });

  $('#team-info').on('click', function(e) {
    $('#main > :not(header)').remove();

    $('li.active').removeClass('active');
    $(e.currentTarget.parentElement).addClass('active');

    showTeamInfo();
  });

  $('#compare-teams').on('click', function(e) {
    $('#main > :not(header)').remove();

    $('li.active').removeClass('active');
    $(e.currentTarget.parentElement).addClass('active');

    showCompareTeams();
  });

  var hash = window.location.hash;
  if (hash == '#info') {
    $('#team-info').trigger('click');
  } else if (hash == '#compare') {
    $('#compare-teams').trigger('click');
  } else {
    $('#todays-matches').trigger('click');
  }
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

function showCompareTeams() {
  $.getJSON('http://worldcup.sfg.io/teams/results', function(teams, textStatus) {
    if (textStatus != 'success') {
      alert(textStatus);
    }

    _teams = teams;
    compareTeams(_teams);
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
  var source = $('#team-information-tmpl').html();
  var template = Handlebars.compile(source);
  var html = template({
    teams: teams
  });

  $('#loading-image').hide();
  $('#main').append(html);
}

function compareTeams(teams) {
  if (_selected.length < 1) {
    _selected.push(teams[0]);
    _selected.push(teams[1]);
  }

  console.log(_selected);

  var maxW, maxD, maxL, maxWidx, maxDidx, maxLidx;
  maxW = maxD = maxL = maxWidx = maxDidx = maxLidx = -1;

  _selected.forEach(function(team, idx) {
    if (maxW < team.wins) {
      maxW = team.wins;
      maxWidx = idx;
    }
    if (maxD < team.draws) {
      maxD = team.draws;
      maxDidx = idx;
    }
    if (maxL < team.losses) {
      maxL = team.losses;
      maxLidx = idx;
    }
  });
  _selected.forEach(function(team, idx) {
    if (team.wins == maxW) {
      if (idx == maxWidx) {
        team.winsStatus = 'success';
      } else {
        team.winsStatus = 'warning';
        maxWidx = idx;
      }
    } else {
      team.winsStatus = 'danger';
    }

    if (team.draws == maxD) {
      if (idx == maxDidx) {
        team.drawsStatus = 'success';
      } else {
        team.drawsStatus = 'warning';
        maxDidx = idx;
      }
    } else {
      team.drawsStatus = 'danger';
    }

    if (team.losses == maxL) {
      if (idx == maxLidx) {
        team.lossesStatus = 'success';
      } else {
        team.lossesStatus = 'warning';
        maxLidx = idx;
      }
    } else {
      team.lossesStatus = 'danger';
    }
  });

  var source = $('#compare-teams-tmpl').html();
  var template = Handlebars.compile(source);
  var html = template({
    teams: _selected
  });
  $('#main').append(html);
}
