var page_length = 25, start = 0;

jQuery(document).ready(function(){
	//Initialize the stats table for each stats block that could be on this page
	jQuery(".wp-block-teamlinkt-stats-box").each(function(index) {
		jQuery(this).find("#teamlinktFilterBtn").click(function() {
			start = 0;
			getPlayerStatistics(this);
		});
		updateSeasonDropdown(this, loadStatsTable, this);
	} );
});

function stats_block(el) {
	return jQuery(el).closest(".wp-block-teamlinkt-stats-box");
}

function loadStatsTable(el) {
	if (!association_key || !season_id) return;
	stats_block(el).find(".teamlinktStatsTable").empty().append( jQuery('<p class="text-center"></p>').html("Loading...") );
	
	//Get Statistics
	jQuery.ajax({
		type: "POST",
		url: `https://${teamlinkt_env}.teamlinkt.com/wordpress_api/getStatistics`,
		data: {
			association_key: getAssociationKey(),
			season_id: stats_block(el).find("#teamlinktSeasonSelect").val()
		},
		cache: false,
		dataType: "json",
		success: function(data){
			start = 0;
			stats_block(el).find("#teamlinktStatsTable").empty();
			let statistics = data.statistics;
			let statistic_groups = data.statistic_groups;
			buildStatisticsTableHead(el,statistics,statistic_groups);
			//get Player Statistics
			getPlayerStatistics(el);
		}
	}).always( function() {
	});
	
	
}

function getPlayerStatistics(el, sort=null) {
	var team_ids = [];
	el = stats_block(el).find("#teamlinktStatsTable").get();
	stats_block(el).find("#teamlinktGroupSelect").children().last().children().each(function(i){
		if (jQuery(this).val()!='all') {
			team_ids.push(jQuery(this).val());
		}
	});
	if (stats_block(el).find("#teamlinktGroupSelect").children().last().children(":selected").val() != 0 && stats_block(el).find("#teamlinktGroupSelect").children().last().children(":selected").val() != 'all') {
		team_ids = stats_block(el).find("#teamlinktGroupSelect").children().last().children(":selected").val();
	}
	var statistic_group_id = stats_block(el).find("#teamlinktStatisticGroupsSelect").val();
	if (sort == null) {
		sort = {col: 'player_name', dir: 'asc'};
	}
	console.log(sort);
	
	var statistics = [];
	var season_id = stats_block(el).find("#teamlinktSeasonSelect").val();
	//Get Statistics
	jQuery.ajax({
		type: "POST",
		url: `https://${teamlinkt_env}.teamlinkt.com/wordpress_api/getStatistics`,
		data: {
			association_key: getAssociationKey(),
			season_id: season_id
		},
		cache: false,
		dataType: "json",
		success: function(data){
			stats_block(el).find("#teamlinktStatsTable").empty();
			let statistics = data.statistics;
			let statistic_groups = data.statistic_groups;
			
			//update the sorting attributes of the table
			if (stats_block(el).find("#teamlinktStatsTable").data('col') == sort.col) {
				(stats_block(el).find("#teamlinktStatsTable").data('dir') == 'desc' ? stats_block(el).find("#teamlinktStatsTable").attr('data-dir', 'asc') : stats_block(el).find("#teamlinktStatsTable").attr('data-dir', 'desc') );
			} else {
				stats_block(el).find("#teamlinktStatsTable").attr('data-dir', 'desc');
			}
			stats_block(el).find("#teamlinktStatsTable").attr('data-col',  sort.col);
			
			jQuery.ajax({
				type: "POST",
				url: `https://${teamlinkt_env}.teamlinkt.com/wordpress_api/getPlayerStatistics`,
				data: {
					association_key: getAssociationKey(),
					season_id: season_id,
					team_id: team_ids,
					statistic_group_id: statistic_group_id,
					dir: sort.dir,
					col: sort.col,
					start: start
				},
				cache: false,
				dataType: "json",
				success: function(data){
					stats_block(el).find("#teamlinktStatsTable>tbody").empty();
					stats_block(el).find("nav").remove(); //remove old nav buttons
					
					
					
					buildPlayerStatisticRows(el,data.player_stats, statistics, statistic_group_id, sort.dir, sort.col);
					
					let page_count = Math.ceil(data.player_count / page_length);
				
					let page_nav = jQuery('<nav style="text-align:center;" aria-label="pagination"></nav>');
					let page_nav_ul = jQuery('<div class="pagination justify-content-center"></div>');
					
					let prev_btn = jQuery('<button class="page-item"></button>').append( jQuery(`<a class="page-link" onclick='prevStatsPage(this,${start}, ${JSON.stringify(sort)});'></a>`).html("Prev") );
					if (start == 0) prev_btn.prop("disabled", true);
					page_nav_ul.append( prev_btn );

					let next_btn = jQuery('<button class="page-item"></button>').append( jQuery(`<a class="page-link" onclick='nextStatsPage(this, ${start}, ${JSON.stringify(sort)});'></a>`).html("Next") );
					if (start + page_length > event_count) next_btn.prop("disabled", true);
					page_nav_ul.append( next_btn );

					page_nav.append(page_nav_ul);
					stats_block(el).find("#teamlinktStatsTable").parent().parent().append( page_nav );
				}
			}).always( function() {

			});
		}
	}).always( function() {
	});
	
	
}

async function nextStatsPage(el, start, sort) {
	start += page_length;
	getPlayerStatistics(jQuery(el).closest('wp-block-teamlinkt-stats-box')[0], JSON.parse(sort));
}

async function prevStatsPage(el, start, sort) {
	start -= page_length;
	if (start < 0) start = 0;
	getPlayerStatistcs(jQuery(el).closest('wp-block-teamlinkt-stats-box')[0], JSON.parse(sort));
}

function buildStatisticsTableHead(el, statistics, statistic_groups) {
	
	stats_block(el).find(".teamlinktStatisticGroupsFilter").empty();
	if (statistic_groups.length == 0) return;
	
	var sg_options = `<option value="all">All Groups</option>`;
	for (i in statistic_groups) {
		sg_options += `<option value=${statistic_groups[i].StatisticGroup.id}>${statistic_groups[i].StatisticGroup.name}</option>`;
	}
	stats_block(el).find(".teamlinktStatisticGroupsFilter").append(`
		<select id="teamlinktStatisticGroupsSelect">`+
			sg_options
		+`</select>
	`);
	
}

function buildPlayerStatisticRows(el, player_statistics, statistics, statistic_group_id) {
	stats_block(el).find("#teamlinktStatsTable").empty();
	el = stats_block(el).find("#teamlinktStatsTable");
	head = `<thead>
		<th onclick="setSortingColumn(this)" data-id="player_name" data-colType="player_name">Player</th>`;
	for (i in statistics) {
		if (statistic_group_id == "all" || statistic_group_id == statistics[i].Statistic.statistic_group_id) {
			head += `<th onclick="setSortingColumn(this)" data-highlighted=0 data-id=${statistics[i].Statistic.id} data-colType="${statistics[i].Statistic.id}">${statistics[i].Statistic.abbreviation}</th>`;
		}
	}
	head += `</thead>`;
	el.append(jQuery(head));
	
	
	body = `<tbody>`;
	for (p in player_statistics) {
		if (!player_statistics[p].PlayerStatistic) continue;
		body += `<tr>`;
		body += `<td>${player_statistics[p].Player.name}</td>`;
		//body += `<td>${ (player_statistics[p].Player.jersey_number ? player_statistics[p].Player.jersey_number : '') }</td>`;
		
		for (s in statistics) {
			if (statistic_group_id == "all" || statistic_group_id == statistics[s].Statistic.statistic_group_id) {
				body += `<td>${ (player_statistics[p].PlayerStatistic.hasOwnProperty(s) ?  player_statistics[p].PlayerStatistic[s].value : 0) }</td>`;
			}
		}

		body += `</tr>`;
	}
	body += `</tbody>`;
	return el.append(jQuery(body));
}

function setSortingColumn(el) {
	//store the filters in the localStorage
	
	let current_filters = JSON.parse(localStorage.getItem('teamlinktStatisticFilters'));
	if (current_filters == null || current_filters.col == null || current_filters.col == undefined) {
		current_filters = {};
		current_filters.col = 'player_name';
		current_filters.dir = 'DESC';
	}
	
	if ( jQuery(el).data('id') == current_filters.col ) {
		current_filters.dir = (current_filters.dir == 'DESC' ? 'ASC' : 'DESC');
	}
	else {
		current_filters.dir = 'DESC';
		current_filters.col = (jQuery(el).data('id') == 'player_name' ? jQuery(el).data('id') : parseInt(jQuery(el).data('id')));
	}
	
	//save the filters to localStorage
	localStorage.setItem('teamlinktStatisticFilters', JSON.stringify(current_filters));
	getPlayerStatistics(el, current_filters);
}