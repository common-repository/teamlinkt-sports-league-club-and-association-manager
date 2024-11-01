const teamlinkt_env = `app`;

jQuery(document).ready(function(){
	updateSeasonDropdown();
});

//populate seasons dropdown
function updateSeasonDropdown() {
	jQuery("#teamlinkt_plugin_preferred_season").empty().append(
		jQuery(`<option value="0">Loading</option>`)
	);
	if (!jQuery("#teamlinkt_association_key").val() && !teamlinkt_settings.general_settings.api_key) {
		jQuery("#teamlinkt_plugin_preferred_season").empty().append(
			jQuery(`<option value="0">Please Enter your API Key</option>`)
		);
		return;
	}

	jQuery.ajax({
		type: "POST",
		url: `https://${teamlinkt_env}.teamlinkt.com/wordpress_api/getSeasons`,
		data: {
			association_key: (jQuery("#teamlinkt_association_key").val() ? jQuery("#teamlinkt_association_key").val() : teamlinkt_settings.general_settings.api_key)
		},
		cache: false,
		dataType: "json",
		success: function(data){
			jQuery("#teamlinkt_plugin_preferred_season").empty();
			if (!data) {
				alert("Problem getting your seasons, it looks like you don't have any.");
				return;
			}
			for (i in data) {
				jQuery("#teamlinkt_plugin_preferred_season").append(
					jQuery(`<option value="${data[i].AssociationSeason.id}">${data[i].AssociationSeason.name}</option>`)
				);
				
			}

			if (teamlinkt_settings.general_settings.preferred_season) {
				jQuery("#teamlinkt_plugin_preferred_season").val(teamlinkt_settings.general_settings.preferred_season);
			}
		}
	});
}