var standings_page_length = 25, recordsTotal = 0, event_count = 0;

jQuery(document).ready(function(){
	jQuery(".wp-block-teamlinkt-standings-box").each(function(index) {
		jQuery(this).find("#teamlinktFilterBtn").click(function() {
			loadStandingsTable(this);
		});
		updateSeasonDropdown(this, function (){return;}, null);
		standings_block(this).find("#teamlinktStandingsTable").append(`<tr><td>Standings</td></tr>`).append(`<tr><td>Select a group and press Filter</td></tr>`);
	} );
});

function standings_block(el) {
	return jQuery(el).closest(".wp-block-teamlinkt-standings-box");
}

function loadStandingsTable (el, start=0) {
	if (!association_key || !season_id) return;

	standings_block(el).find("#teamlinktStandingsTable").empty().append( jQuery('<p class="text-center"></p>').html("Loading...") );

	jQuery.ajax({
		type: "POST",
		url: `https://${teamlinkt_env}.teamlinkt.com/wordpress_api/getStandings`,
		data: {
			association_key: getAssociationKey(),
			season_id: season_id, 
			team_id: team_id,
			filters: getFilterObject(), 
			limit: standings_page_length,
			offset: start,
			is_league_site: 0, 
			show_team_links: 0
		},
		cache: false,
		dataType: "json",
		success: function(data){
			var standings_result = data.standings.payload;
			var standings_fields_result = data.standings_fields;
			standings_block(el).find("#teamlinktStandingsTable").empty();
			if (standings_result.length == 0 || standings_fields_result.length == 0) {
				standings_block(el).find("#teamlinktStandingsTable").append(`<p>There are no Standings for this group.</p>`);
			}
			else {
				var standings_head = `<thead style="text-align:left;">`;
				standings_head += `<th>Team</th>`;
				for (i in standings_fields_result) {
					standings_head += `<th>${standings_fields_result[i].AssociationStandingColumn.abbreviation}</th>`;
				}
				standings_head += `</thead>`;
				
				var standings_body = `<tbody>`;
				for (i in standings_result) {
					standings_body += `<tr>`;
					standings_body += `<td>${standings_result[i].team_name}</td>`;
					for (col in standings_fields_result) {
						standings_body += `<td>${standings_result[i][standings_fields_result[col].AssociationStandingColumn.column_type]}</td>`;
					}
					standings_body += `</tr>`;
				}
				standings_body += `</tbody>`;
				
				standings_block(el).find("#teamlinktStandingsTable").append(standings_head);
				standings_block(el).find("#teamlinktStandingsTable").append(standings_body);
				
				let page_count = Math.ceil(standings_result.length / standings_page_length);
				
				let page_nav = jQuery('<nav style="text-align:center;" aria-label="pagination"></nav>');
				let page_nav_ul = jQuery('<ul class="pagination justify-content-center"></ul>');
				
				let prev_btn = jQuery('<li class="page-item"></li>').append( jQuery('<a class="page-link" onclick="prevStandingsPage(this, '+start+');"></a>').html("Prev") );
				if (start == 0) prev_btn.prop("disabled", true);
				page_nav_ul.append( prev_btn );

				let next_btn = jQuery('<li class="page-item"></li>').append( jQuery('<a class="page-link" onclick="nextStandingsPage(this, '+start+');"></a>').html("Next") );
				if (start + page_length > event_count) next_btn.prop("disabled", true);
				page_nav_ul.append( next_btn );

				page_nav.append(page_nav_ul);
				//standings_block(el).find("#teamlinktStandingsTable").parent().append( page_nav );
			}
			
		}
	}).always( function() {

	});
}

async function nextStandingsPage(el, start) {
	start += standings_page_length;
	loadStandingsTable(standings_block(el), start);
}

async function prevStandingsPage(el, start) {
	start -= standings_page_length;
	if (start < 0) start = 0;
	loadStandingsTable(standings_block(el), start);
}