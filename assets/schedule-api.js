var page_length = 25, recordsTotal = 0, event_count = 0;

const schedule_type = (schedule_api_object.schedule_settings.type ? schedule_api_object.schedule_settings.schedule_type : 'schedule');
const schedule_status = (schedule_api_object.schedule_settings.status ? schedule_api_object.schedule_settings.status : 'all');
const schedule_show_games_only = (Number.isInteger(parseInt(schedule_api_object.schedule_settings.show_games_only)) ? schedule_api_object.schedule_settings.show_games_only : 1);

jQuery(document).ready(function(){
	jQuery(".wp-block-teamlinkt-schedule-box").each(function(index) {
		jQuery(this).find("#teamlinktFilterBtn").click(function() {
			loadScheduleTable(this);
		});
		updateSeasonDropdown(this, loadScheduleTable, this);
	} );
});

function schedule_block(el) {
	return jQuery(el).closest(".wp-block-teamlinkt-schedule-box");
}

function loadScheduleTable (el, start=0) {
	if (!association_key || !season_id) return;

	schedule_block(el).find("#teamlinktScheduleTable").empty().append( jQuery('<p class="text-center"></p>').html("Loading...") );

	jQuery.ajax({
		type: "POST",
		url: `https://${teamlinkt_env}.teamlinkt.com/wordpress_api/getEvents`,
		data: {
			association_key: getAssociationKey(),
			season_id: season_id, 
			team_id: team_id,
			group_ids: getFilterObject(), 
			limit: page_length,
			offset: start,
			is_league_site: 0, 
			show_team_links: 0,
			type: schedule_type, 
			status: schedule_status, 
			show_games_only: schedule_show_games_only
		},
		cache: false,
		dataType: "json",
		success: function(data){
			schedule_block(el).find("#teamlinktScheduleTable").empty();
			schedule_block(el).find("nav").remove(); //remove old nav buttons
			let events = data.payload.events;
			recordsTotal = data.recordsTotal;
			event_count = data.payload.event_count;
			let curr_date = null;

			let game_date_range = {first: null, last: null};


			if (events && Array.isArray(events) && events.length > 0) {
				let header_row = jQuery('<thead></thead>');
				header_row.append('<th>Date</th>');
				header_row.append('<th>Time </th>');
				header_row.append('<th>Home </th>');
				header_row.append('<th>Away </th>');
				header_row.append('<th>Location</th>');

				schedule_block(el).find("#teamlinktScheduleTable").append(header_row);
				schedule_block(el).find("#teamlinktScheduleTable").append(`<tbody></tbody>`);
				for(let i in events) {
					// Check if we're on a new date.
					let event_date = events[i].AssociationEvent.start.substring(0,10);
					let last_index = 6;
					if (status == "current") last_index = 7;
					if ( typeof(events[i][last_index]) !== 'undefined' && (game_date_range.first == null || events[i][last_index] < game_date_range.first) ) {
						game_date_range.first = events[i][last_index];
					}
					if ( typeof(events[i][last_index]) !== 'undefined' && (game_date_range.last == null || events[i][last_index] > game_date_range.last) ) {
						game_date_range.last = events[i][last_index];
					}
			
					let row = jQuery('<tr></tr>');
					
					let cell = null;

					cell = jQuery('<td style="white-space:nowrap;"></td>');
					var date = new Date(events[i].AssociationEvent.start.replace(/-/g, "/"));
					if ( parseInt(schedule_api_object.schedule_settings.gameday_links) ) {
						cell.append(`<a target="_blank" href="https://leagues.teamlinkt.com/Leagues/event/${events[i].AssociationEvent.association_id}/${events[i].AssociationEvent.id}" >
							${date.toLocaleDateString(date_format[schedule_api_object.schedule_settings.date_format][0], date_format[schedule_api_object.schedule_settings.date_format][1])}
						</a>`);
					} else {
						cell.append(date.toLocaleDateString(date_format[schedule_api_object.schedule_settings.date_format][0], date_format[schedule_api_object.schedule_settings.date_format][1]));
					}
					
					row.append( cell );

					cell = jQuery('<td style="white-space:nowrap;"></td>');
					cell.append(`${date.toLocaleTimeString(time_format[schedule_api_object.schedule_settings.time_format][0], time_format[schedule_api_object.schedule_settings.time_format][1])}`);
					row.append( cell );
					
					//Highlight the winning teams name and include the scores
					var schedule_home_team_name = events[i].HomeTeam.name;
					var schedule_away_team_name = events[i].AwayTeam.name;
					if (events[i].AssociationScore.id > 0) {
						if (events[i].AssociationScore.home_score == events[i].AssociationScore.away_score) {
							schedule_home_team_name = `<strong>${schedule_home_team_name} (${events[i].AssociationScore.home_score})</strong>`;
							schedule_away_team_name = `<strong>${schedule_away_team_name} (${events[i].AssociationScore.away_score})</strong>`;
						}
						else if (events[i].AssociationScore.home_score > events[i].AssociationScore.away_score) {
							schedule_home_team_name = `<strong>${schedule_home_team_name} (${events[i].AssociationScore.home_score})</strong>`;
							schedule_away_team_name = `${schedule_away_team_name} (${events[i].AssociationScore.away_score})`;
						}
						else if (events[i].AssociationScore.home_score < events[i].AssociationScore.away_score) {
							schedule_home_team_name = `${schedule_home_team_name} (${events[i].AssociationScore.home_score})`;
							schedule_away_team_name = `<strong>${schedule_away_team_name} (${events[i].AssociationScore.away_score})</strong>`;
						}
					}
					
					cell = jQuery('<td></td>');
					if (parseInt(schedule_api_object.schedule_settings.team_site_links) && parseInt(events[i].HomeTeam.association_team_id) > 0) {
						cell.append(`<a target="_blank" href="https://${teamlinkt_env}.teamlinkt.com/team_sites/${events[i].HomeTeam.id}/home">${schedule_home_team_name}</a>`);
					}
					else {
						cell.append(`${schedule_home_team_name}`);
					}
					
					row.append( cell );
					
					cell = jQuery('<td></td>');
					if (parseInt(schedule_api_object.schedule_settings.team_site_links) && parseInt(events[i].AwayTeam.association_team_id) > 0) {
						cell.append(`<a href="https://${teamlinkt_env}.teamlinkt.com/team_sites/${events[i].AwayTeam.id}/home">${schedule_away_team_name}</a>`);
					}
					else {
						if (events[i].AssociationEvent.type != "Game") cell.append(`${events[i].AssociationEvent.type}`);
						else cell.append(`${schedule_away_team_name}`);
						
					}
					
					row.append( cell );
					
					cell = jQuery('<td></td>');
					let location_name = events[i].Location.name ?? "TBD";
					cell.append( `<a target="_blank" href="https://maps.google.com/?q=${events[i].Location.lat+","+events[i].Location.lng}">${location_name}</a>` );
					row.append( cell );

					schedule_block(el).find("#teamlinktScheduleTable tbody").append( row );
				}

				let page_count = Math.ceil(events.length / page_length);
				
				let page_nav = jQuery('<nav style="text-align:center;" aria-label="pagination"></nav>');
				let page_nav_ul = jQuery('<div class="pagination justify-content-center"></div>');
				
				let prev_btn = jQuery('<button class="page-item"></button>').append( jQuery('<a class="page-link" onclick="prevSchedulePage(this,'+start+');"></a>').html("Prev") );
				if (start == 0) prev_btn.prop("disabled", true);
				page_nav_ul.append( prev_btn );

				let next_btn = jQuery('<button class="page-item"></button>').append( jQuery('<a class="page-link" onclick="nextSchedulePage(this, '+start+');"></a>').html("Next") );
				if (start + page_length > event_count) next_btn.prop("disabled", true);
				page_nav_ul.append( next_btn );

				page_nav.append(page_nav_ul);
				schedule_block(el).find("#teamlinktScheduleTable").parent().append( page_nav );

				// check if there are games around the current date
				let curr_ts = Math.floor(Date.now() / 1000);
				if ( game_date_range.first != null && game_date_range.last != null && curr_ts > game_date_range.first - (7*24*60*60) && curr_ts < game_date_range.last + (1*24*60*60) ) {
					showClaimModal();
				}
				return event_count;
			}
			else {
				
				schedule_block(el).find("#teamlinktScheduleTable").append( jQuery("<div></div>").html("Looks like you have no events.") );
				schedule_block(el).find("#teamlinktScheduleTable").append( jQuery("<div></div>").html("If you are the administrator, you can add events through our schedule builder, quick add or import options.") );
				schedule_block(el).find("#teamlinktScheduleTable").append( jQuery("<div></div>").append( jQuery("<a class='btn btn-primary' href='https://${teamlinkt_env}.teamlinkt.com/users/login'></a>").html("Login") ) );
				return 0;
			}
		}
	}).always( function() {

	});
}

//CURRENTLY NOT USED Success with calling api
function scheduleGrabbed(res) {
	data = JSON.parse(res);
	if (data.code != 200) {
		document.getElementById("message").innerHTML = "There was a problem getting your events.";
		document.getElementById("message").style.display = "block";
		return;
	}
	document.getElementById("message").style.display = "none";

	events = data.payload.events;
	if (data.payload.event_count == 0) {
		document.getElementById("teamlinktScheduleTable").style.display = "none";
		document.getElementById("message").innerHTML = "There are no events.";
		document.getElementById("message").style.display = "block";
		return;
	}

	if (events) {
		document.getElementById("teamlinktScheduleTable").style.display = "block";
		document.getElementById("teamlinktScheduleTableBody").innerHTML = "";
		for (e in events) {

		}
	}
}

async function nextSchedulePage(el, start) {
	start += page_length;
	loadScheduleTable(schedule_block(el), start);
}

async function prevSchedulePage(el, start) {
	start -= page_length;
	if (start < 0) start = 0;
	loadScheduleTable(schedule_block(el), start);
}