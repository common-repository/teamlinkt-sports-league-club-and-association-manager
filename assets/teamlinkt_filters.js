const teamlinkt_env = `app`;

var group_ids = {};
var team_id = 'all';
var filters = {};
var filter_data = {}; //<?= json_encode($filter_data['filter_fields']); ?>
var season_id = {};
const association_key = teamlinkt_api_object.general_settings.api_key;

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const date_format = {
	"long": ['en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }],
	"short": ['en-CA', { year: 'numeric', month: 'numeric', day: 'numeric' }],
	"med": ['en-US', { weekday: 'short', month: 'short', day: 'numeric' }]
};

const time_format = {
	"12hr": ['en-US', { hour: '2-digit', minute: '2-digit' }],
	"24hr": ['en-GB', { hour: '2-digit', minute: '2-digit' }],
};



jQuery(document).ready(function(){
	jQuery(".teamlinktFilterContainer").each(function (index) {
		jQuery(this).append(`
			<div>
				<select style="margin-bottom:4px;" id="teamlinktSeasonSelect" onchange="changeSeason(this);"></select>
			</div>
			<div id="teamlinktGroupSelect">
			</div>
			<div class="teamlinktFilterBtnHolder">
				<button class="" style="height:100%; margin-bottom: 0.2em;" id="teamlinktFilterBtn">Filter</button>
			</div>
		`);
	});
	
	//updateSeasonDropdown();
});
/*
Get Filters for association
*/
function getFilters(el, association_key, cb_function, cbf_params) {
	jQuery(el).closest(".teamlinktFilterContainer").find("#teamlinktFilterBtn").hide();
	//jQuery(el).closest(".teamlinktFilterContainer").find("#teamlinktFilterBtn").detach().appendTo(jQuery(el).closest(".teamlinktFilterContainer"));
	jQuery.ajax({
		type: "POST",
		url: `https://${teamlinkt_env}.teamlinkt.com/wordpress_api/getFilters`,
		data: {
			association_key: association_key,
			season_id: jQuery(el).find("#teamlinktSeasonSelect").val()
		},
		cache: false,
		dataType: "json",
		success: function(data){
			jQuery(el).closest(".teamlinktFilterContainer").find("#teamlinktGroupSelect").empty();
			filter_data = data.payload;
			filter_fields = data.payload.filter_fields;

			generateFilters(el);
			if (typeof cb_function === 'function') cb_function(cbf_params);
		}
	}).always(function() {
		jQuery(el).closest(".teamlinktFilterContainer").find("#teamlinktFilterBtn").show();
	});
}

/**
	Update the Group dropdowns and edit the available teams based on selected groups
	we can have up to 4 dropdowns indexed teamlinktGroupSelect${0:3}
	THIS FUNCTION ASSUMES A MAX DEPTH OF 3
	int group_num:- the index of the filter that was changed
 */
function updateFilters(el, group_num=0) {
	
	var n_dropdowns = jQuery(el).closest(".teamlinktFilterContainer").find("#teamlinktGroupSelect").children().length-1; //-1 excludes the team filter
	filters = {};
	//get group ids for conference / div / tier filters
	var get_all = 1;
	var n = 0;

	while ( n < n_dropdowns ) { // && !parseInt(jQuery(`#teamlinktGroupSelect${n_dropdowns}`).val())
		if (parseInt(jQuery(el).closest(".teamlinktFilterContainer").find(`#teamlinktGroupSelect${n}`).val()) > 0) {
			filters[filter_data.all_filter_fields[n].substring(4)] = parseInt(jQuery(el).closest(".teamlinktFilterContainer").find(`#teamlinktGroupSelect${n}`).val());
			
		} else {
			filters[filter_data.all_filter_fields[n].substring(4)] = null;
		}
		n++;
	}
	
	if (group_num == n_dropdowns) { //only the team filter changed, don't need to update the rest of the filters
		localStorage.setItem( 'teamlinkt_filters', JSON.stringify( {filters: filters, team_id: jQuery(el).closest(".teamlinktFilterContainer").find(`#teamlinktGroupSelect${n_dropdowns}`).val()} ) );
		return;
	}
	//refresh the filters after the changed select
	while (group_num <= n_dropdowns) {
		group_num ++;
		jQuery(el).closest(".teamlinktFilterContainer").find(`#teamlinktGroupSelect${group_num}`).children().slice(1).remove();
	}

	//Get the team id filter
	if (parseInt(jQuery(el).closest(".teamlinktFilterContainer").find(`#teamlinktGroupSelect${n_dropdowns}`).val()) > 0) {
		team_id = parseInt(jQuery(el).closest(".teamlinktFilterContainer").find(`#teamlinktGroupSelect${n_dropdowns}`).val());
	} else {
		team_id = 'all';
	}
	var teamlinkt_filters = {filters: filters, team_id:team_id};
	localStorage.setItem('teamlinkt_filters', JSON.stringify(teamlinkt_filters));
	f_vals=[];
	//create a list of the filter values
	for (key in filter_data.all_filter_fields) {
		f_vals.push( filters[ filter_data.all_filter_fields[key].substring(4) ] );
	}
	
	//Reset our selects (and maybe set them to filters), we should never rebuild our first select
	if (f_vals[1] == null) jQuery(el).closest(".teamlinktFilterContainer").find(`#teamlinktGroupSelect${1}`).children().slice(1).remove();
	if (f_vals[2] == null) jQuery(el).closest(".teamlinktFilterContainer").find(`#teamlinktGroupSelect${2}`).children().slice(1).remove();
	//populate the selects with children from the tree, max depth = 3
	for (child in filter_data.tree) {
		
		if (f_vals[0] != null && f_vals[0] != child) {
			continue; //if this tree branch doesn't match our filter, don't append its children.
		}

		if (!jQuery.isEmptyObject(filter_data.tree[child].children)) {
			var children = filter_data.tree[child].children;

			
			
			for (gchild in children) {
				if (f_vals[1] != null && f_vals[1] != gchild) {
					continue; //if this tree branch doesn't match our filter, don't append its children.
				}
				if (f_vals[1] == null) {
					jQuery(el).closest(".teamlinktFilterContainer").find(`#teamlinktGroupSelect${1}`).append(`
						<option value="${gchild}">
							${filter_data.all_tree[filter_data.all_filter_fields[0]][gchild]}
						</option>
					`);
				}
				
				if (!jQuery.isEmptyObject(children[gchild].children)) {
					var gchildren = children[gchild].children;
					
					for (ggchild in gchildren) {
						if (f_vals[2] != null && f_vals[2] != ggchild) {
							continue; //if this tree branch doesn't match our filter, don't append its children.
						}
						if (f_vals[2] == null) {
							jQuery(el).closest(".teamlinktFilterContainer").find(`#teamlinktGroupSelect${2}`).append(`
								<option value="${ggchild}">
								${filter_data.all_tree[filter_data.all_filter_fields[1]][ggchild]}
								</option>
							`);
						}
						
					}
				}
			}
		}
	}
	
	//We now have all the groups that can possess teams in the last group select
	//Build team select based on the last group's values
	var team_groups = [];
	jQuery(el).closest(".teamlinktFilterContainer").find(`#teamlinktGroupSelect${n_dropdowns-1} option`).each(function ()
		{
			if (jQuery(this).val() != 0) team_groups.push(jQuery(this).val());
		}	
	);

	//clear the team select except the all option
	jQuery(el).closest(".teamlinktFilterContainer").find(`#teamlinktGroupSelect${n_dropdowns}`).children().slice(1).remove();
	for (i in team_groups) {
		for (t in filter_data.teams[ team_groups[i] ].teams) {
			var team = filter_data.teams[ team_groups[i] ].teams[t]; // team we want to add to select
			jQuery(el).closest(".teamlinktFilterContainer").find(`#teamlinktGroupSelect${n_dropdowns}`).append(`
				<option value="${team.Team.id}">${team.Team.original_team_name}</option>
			`);
		}
		
	}
	//jQuery(el).closest(".teamlinktFilterContainer").find("#teamlinktFilterBtn").detach().appendTo(jQuery(el).closest(".teamlinktFilterContainer").find("#teamlinktGroupSelect"));
}

function generateFilters(el) {
	// el can be different depending if the page is being initialized or if were using the season dropdown
	// so we standardize it here
	el = jQuery(el).find('#teamlinktSeasonSelect')[0];
	//generate each group select
	var s = 0;
	var tree_filters = JSON.parse(localStorage.getItem('teamlinkt_filters'));
	for (f in filter_data.all_filter_type) {
		jQuery(el).closest(".teamlinktFilterContainer").find("#teamlinktGroupSelect").append(
			`<select style="margin-bottom:4px;" id="teamlinktGroupSelect${s}" onchange="updateFilters(this,${s})">
				<option value="0">${filter_data.all_filter_text[s]}</option>
			</select>`
		);
		s++;
	}
	//populate the selects with children from the tree
	for (child in filter_data.tree) {
		
		jQuery(el).closest(".teamlinktFilterContainer").find(`#teamlinktGroupSelect${0}`).append(`
			<option value="${child}">${filter_data.tree[child].parent_name}</option>
		`);

		if (!jQuery.isEmptyObject(filter_data.tree[child].children)) {
			var children = filter_data.tree[child].children;

			for (gchild in children) {
				jQuery(el).closest(".teamlinktFilterContainer").find(`#teamlinktGroupSelect${1}`).append(`
					<option value="${gchild}">
					${filter_data.all_tree[filter_data.all_filter_fields[0]][gchild]}
					</option>
				`);
				if (!jQuery.isEmptyObject(children[gchild].children)) {
					var gchildren = children[gchild].children;
					
					for (ggchild in gchildren) {
						jQuery(el).closest(".teamlinktFilterContainer").find(`#teamlinktGroupSelect${2}`).append(`
							<option value="${ggchild}">
							${filter_data.all_tree[filter_data.all_filter_fields[1]][ggchild]}
							</option>
						`);
					}
				}
			}
		}
	}
	// Add the team select filter
	jQuery(el).closest(".teamlinktFilterContainer").find("#teamlinktGroupSelect").append(
		`<select style="margin-bottom:4px;" id="teamlinktGroupSelect${s}" onchange="updateFilters(this, ${s})">
			<option value="all">All Teams</option>
		</select>`
	);
	//for each group in bottom of structure check if it has teams
	for (i in filter_data.teams) {
		for (team in filter_data.teams[i].teams) {
			jQuery(el).closest(".teamlinktFilterContainer").find(`#teamlinktGroupSelect${s}`).append(`
				<option value="${filter_data.teams[i].teams[team].Team.id}">${filter_data.teams[i].teams[team].Team.original_team_name}</option>
			`);
		}
	}

	//get the value for each filter
	for (g in filter_data.filter_fields){
		filters[g] = null;
	}
	updateFilters(el);
}

function getFilterObject() {
	return filters;
}

function getAssociationKey() {
	return association_key;
}

//populate seasons dropdown
async function updateSeasonDropdown(el, cb_function, cbf_params, build_groups=true) {
	jQuery.ajax({
		type: "POST",
		url: `https://${teamlinkt_env}.teamlinkt.com/wordpress_api/getSeasons`,
		data: {
			association_key: association_key
		},
		cache: false,
		dataType: "json",
		success: function(data){
			jQuery(el).find("#teamlinktSeasonSelect").empty();
			if (!data) {
				alert("Problem getting events. There are no active seasons.");
				return;
			}
			for (i in data) {
				jQuery(el).find("#teamlinktSeasonSelect").append(
					jQuery(`<option value="${data[i].AssociationSeason.id}">${data[i].AssociationSeason.name}</option>`)
				);
				
			}
			season_id = jQuery(el).find("#teamlinktSeasonSelect").val(teamlinkt_api_object.general_settings.preferred_season).val();
			
			if (build_groups) getFilters(el, association_key, cb_function, cbf_params);
			else cb_function(cbf_params); //call our callback function now
		}
	});
}

//refresh the table and filters after getting the new season
async function changeSeason(el, build_filters=true) {
	el = jQuery(el).closest('.teamlinktFilterContainer')[0];
	season_id = jQuery(el).find("#teamlinktSeasonSelect :selected").val();
	start = 0;
	if (build_filters) getFilters(el, association_key);
}