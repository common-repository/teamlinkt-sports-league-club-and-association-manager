var locations_page_length = 25, recordsTotal = 0, event_count = 0;

jQuery(document).ready(function(){
	jQuery(".wp-block-teamlinkt-locations-box").each(function(index) {
		jQuery(this).find("#teamlinktFilterBtn").click(function() {
			loadLocationsTable(this);
		});
		
		jQuery(this).find("#teamlinktSeasonSelect")[0].setAttribute("onchange", "changeSeason(this, false)");
		updateSeasonDropdown(this, loadLocationsTable, this, false);
	} );
});

function locations_block(el) {
	return jQuery(el).closest(".wp-block-teamlinkt-locations-box");
}

function loadLocationsTable (el, start=0) {
	if (!association_key || !season_id) return;

	locations_block(el).find("#teamlinktLocationsTable").empty().append( jQuery('<p class="text-center"></p>').html("Loading...") );

	jQuery.ajax({
		type: "POST",
		url: `https://${teamlinkt_env}.teamlinkt.com/wordpress_api/getLocations`,
		data: {
			association_key: getAssociationKey(),
			season_id: season_id,
			limit: locations_page_length,
			offset: start,
			is_league_site: 0, 
		},
		cache: false,
		dataType: "json",
		success: function(data){
			var locations_result = data.payload.Locations;
			locations_block(el).find("#teamlinktLocationsTable").empty(); //clear table
			locations_block(el).find("nav").remove(); //remove old nav buttons
			if (locations_result.length == 0) {
				locations_block(el).find("#teamlinktLocationsTable").append(`<p>There are no Locations for this season.</p>`);
			}
			else {
				var locations_head = `<thead style="text-align:left;">
					<th>Location</th>
					<th>Address</th>
					<th>Map</th>
				</thead>`;
				
				var locations_body = `<tbody>`;
				for (i in locations_result) {
					locations_body += `<tr>
						<td>${locations_result[i].Location.name}</td>
						<td>${locations_result[i].Location.full_address}</td>
						<td><a target="_blank" href="https://maps.google.com/?q=${locations_result[i].Location.lat+","+locations_result[i].Location.lng}">See Map</a></td>
					</tr>`;
				}
				locations_body += `</tbody>`;
				
				locations_block(el).find("#teamlinktLocationsTable").append(locations_head);
				locations_block(el).find("#teamlinktLocationsTable").append(locations_body);
				
				let page_count = Math.ceil(locations_result.length / locations_page_length);
				
				let page_nav = jQuery('<nav aria-label="pagination" style="text-align:center;"></nav>');
				let page_nav_ul = jQuery('<div class="pagination justify-content-center"></div>');
				
				let prev_btn = jQuery('<button class="page-item"></button>').append( jQuery('<a class="page-link" onclick="prevLocationsPage(this, '+start+');"></a>').html("Prev") );
				if (start == 0) prev_btn.prop('disabled');
				page_nav_ul.append( prev_btn );

				let next_btn = jQuery('<button class="page-item"></button>').append( jQuery('<a class="page-link" onclick="nextLocationsPage(this, '+start+');"></a>').html("Next") );
				if (start + page_length > locations_result.length) next_btn.prop('disabled');
				page_nav_ul.append( next_btn );

				page_nav.append(page_nav_ul);
				locations_block(el).find("#teamlinktLocationsTable").parent().append( page_nav );
			}
			
		}
	}).always( function() {

	});
}

async function nextLocationsPage(el, start) {
	start += locations_page_length;
	loadLocationsTable(locations_block(el), start);
}

async function prevLocationsPage(el, start) {
	start -= locations_page_length;
	if (start < 0) start = 0;
	loadLocationsTable(locations_block(el), start);
}