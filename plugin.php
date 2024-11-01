<?php
/**
 * Plugin Name: TeamLinkt - Sports League, Club, and Association Manager
 * Description: Transform any WordPress Site into a data-driven Sports League, Club or Association Website - complete with schedules/fixtures, standings, scores, statistics and more.
 * Author: TeamLinkt
 * Version: 1.1.5 
 * Author URI: https://developer.wordpress.org/
 * License: GPL3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.txt
*/

/*
TeamLinkt - Sports League, Club, and Association Manager is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
any later version.
 
TeamLinkt - Sports League, Club, and Association Manager is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
 
You should have received a copy of the GNU General Public License
along with TeamLinkt - Sports League, Club, and Association Manager. If not, see https://www.gnu.org/licenses/gpl-3.0.txt.
*/

define ('TEAMLINKT_PLUGIN_VERSION', '1.1.5');
register_activation_hook(__FILE__, 'teamlinkt_plugin_activation');
register_deactivation_hook(__FILE__, 'teamlinkt_plugin_deactivation');

add_action('plugins_loaded', 'teamlinkt_check_current_version');

function teamlinkt_check_current_version() {
	if (TEAMLINKT_PLUGIN_VERSION !== get_option('teamlinkt_plugin_version')) {
		teamlinkt_plugin_activation();
	}
}

// Our plugin has been activated for the first time
// Init options for new users and update keys for options
function teamlinkt_plugin_activation() {
	$schedule_options = array(
		'date_format' => "med",
		'gameday_links' => 0,
		'schedule_type' => "schedule",
		'show_games_only' => 1,
		'status' => "all",
		'team_site_links' => 0,
		'time_format' => "12hr"
	);
	
	$scores_options = array(
		'date_format' => "med",
		'gameday_links' => 0,
		'schedule_type' => "scores",
		'team_site_links' => 0,
		'time_format' => "12hr"
	);
	
	$locations_options = array();
	
	$stats_options = array();
	
	//get the users settings for each block
	$user_schedule = get_option('teamlinkt_schedule', array());
	$user_scores = get_option('teamlinkt_scores', array());
	$user_locations = get_option('teamlinkt_locations', array());
	$user_stats = get_option('teamlinkt_stats', array());
	
	update_option('teamlinkt_schedule', array_merge($schedule_options, $user_schedule));
	update_option('teamlinkt_scores', array_merge($scores_options, $user_scores));
	update_option('teamlinkt_locations', array_merge($locations_options, $user_locations));
	update_option('teamlinkt_stats', array_merge($stats_options, $user_stats));
	
	//We've updated our options and plugin defaults - update our version number to recent
	update_option('teamlinkt_plugin_version', TEAMLINKT_PLUGIN_VERSION);
	
}
function teamlinkt_plugin_deactivation() {
	// We've been deactivated - is there anything to clean up?
}

add_action( 'enqueue_block_editor_assets', 'teamlinkt_schedule_block_assets' );
add_action( 'enqueue_block_editor_assets', 'teamlinkt_scores_block_assets' );
add_action( 'enqueue_block_editor_assets', 'teamlinkt_stats_block_assets' );
add_action( 'enqueue_block_editor_assets', 'teamlinkt_standings_block_assets' );
add_action( 'enqueue_block_editor_assets', 'teamlinkt_locations_block_assets' );

add_action( 'wp_head', 'teamlinkt_filters_assets'); //The env variable for the blocks on admin are stored in this script


/*
An improvement is to only call these add actions below when the block is present in the post/page
*/
add_action( 'wp_head', 'teamlinkt_stats_api_assets' );
add_action( 'wp_head', 'bootstrap_engueue' );
add_action( 'wp_head', 'teamlinkt_schedule_api_assets' );
add_action( 'wp_head', 'teamlinkt_scores_api_assets' );
add_action( 'wp_head', 'teamlinkt_standings_api_assets' );
add_action( 'wp_head', 'teamlinkt_locations_api_assets' );

function teamlinkt_bootstrap_enqueue() {
	//wp_register_script('prefix_bootstrap', 'bootstrap_js_path'); // This needs to be the path to a file in the plugin
	//wp_enqueue_script('prefix_bootstrap');
	//wp_register_style('prefix_bootstrap', 'bootstrap_css_path');
	//wp_enqueue_style('prefix_bootstrap');
}

//Initialize the filters scripts on the front end for all blocks
function teamlinkt_filters_assets() {
	wp_enqueue_script(
		'teamlinkt_filters',
		plugin_dir_url( __FILE__ ) . 'assets/teamlinkt_filters.js',
		array( ),
		filemtime( dirname( __FILE__ ) . '/assets/teamlinkt_filters.js' )
   	);
	
	//add styling to filters
	wp_enqueue_style(
		'teamlinkt_filters-css',
		plugin_dir_url( __FILE__ ) . 'assets/teamlinkt_filters.css',
		array( 'wp-edit-blocks' ),
		filemtime( dirname( __FILE__ ) . '/assets/teamlinkt_filters.css' )
   	);
	
	// Pass variables into filters script
	wp_localize_script(
		'teamlinkt_filters',
		'teamlinkt_api_object',
		array(
			'general_settings' => get_option("teamlinkt_general")
		)
	);
}

/*
SCHEDULE BACK END LOAD ASSETS
*/
function teamlinkt_schedule_block_assets(){
	//load scripts for the block on admin side
	wp_enqueue_script(
 		'schedule-block',
		plugin_dir_url( __FILE__ ) . 'assets/schedule-block.js',
		array( 'wp-blocks', 'wp-element' ),
		filemtime( dirname( __FILE__ ) . '/assets/schedule-block.js' )
	);

	wp_enqueue_style(
		'schedule-block-css',
		plugin_dir_url( __FILE__ ) . 'assets/schedule-block.css',
		array( 'wp-edit-blocks' ),
		filemtime( dirname( __FILE__ ) . '/assets/schedule-block.css' )
	);

}

/*
SCHEDULE FRONT END LOAD ASSETS
*/
function teamlinkt_schedule_api_assets(){
	//load script on front end
	wp_enqueue_script(
		'schedule-api',
		plugin_dir_url( __FILE__ ) . 'assets/schedule-api.js',
		array( ),
		filemtime( dirname( __FILE__ ) . '/assets/schedule-api.js' )
   	);
	
	// Pass variables into schedule script
	wp_localize_script(
		'schedule-api',
		'schedule_api_object',
		array(
			'schedule_settings' => get_option("teamlinkt_schedule")
		)
	);

	wp_enqueue_style(
		'schedule-block-css',
		plugin_dir_url( __FILE__ ) . 'assets/schedule-block.css',
		array( 'wp-edit-blocks' ),
		filemtime( dirname( __FILE__ ) . '/assets/schedule-block.css' )
   	);
}

/*
SCORES BACK END LOAD ASSETS
*/
function teamlinkt_scores_block_assets(){
	//load scripts for the block on admin side
	wp_enqueue_script(
 		'scores-block',
		plugin_dir_url( __FILE__ ) . 'assets/scores-block.js',
		array( 'wp-blocks', 'wp-element' ),
		filemtime( dirname( __FILE__ ) . '/assets/scores-block.js' )
	);

}

/*
SCORES FRONT END LOAD ASSETS
*/
function teamlinkt_scores_api_assets(){
	//load script on front end
	wp_enqueue_script(
		'scores-api',
		plugin_dir_url( __FILE__ ) . 'assets/scores-api.js',
		array( ),
		filemtime( dirname( __FILE__ ) . '/assets/scores-api.js' )
   	);
	
	// Pass variables into scores script
	wp_localize_script(
		'scores-api',
		'scores_api_object',
		array(
			'scores_settings' => get_option("teamlinkt_scores")
		)
	);
}

/*
STATS BACK END LOAD ASSETS
*/
function teamlinkt_stats_block_assets(){
	//load scripts for the block on admin side
	wp_enqueue_script(
 		'stats-block',
		plugin_dir_url( __FILE__ ) . 'assets/stats-block.js',
		array( 'wp-blocks', 'wp-element' ),
		filemtime( dirname( __FILE__ ) . '/assets/stats-block.js' )
	);

}

/*
STATS FRONT END LOAD ASSETS
*/
function teamlinkt_stats_api_assets(){
	//load script on front end
	wp_enqueue_script(
		'stats-api',
		plugin_dir_url( __FILE__ ) . 'assets/stats-api.js',
		array( ),
		filemtime( dirname( __FILE__ ) . '/assets/stats-api.js' )
   	);
	
	// Pass variables into stats script
	wp_localize_script(
		'stats-api',
		'stats_api_object',
		array(
			'stats_settings' => get_option("teamlinkt_stats")
		)
	);
}

/*
STANDINGS BACK END LOAD ASSETS
*/
function teamlinkt_standings_block_assets(){
	//load scripts for the block on admin side
	wp_enqueue_script(
 		'standings-block',
		plugin_dir_url( __FILE__ ) . 'assets/standings-block.js',
		array( 'wp-blocks', 'wp-element' ),
		filemtime( dirname( __FILE__ ) . '/assets/standings-block.js' )
	);

	wp_enqueue_style(
		'standings-block-css',
		plugin_dir_url( __FILE__ ) . 'assets/standings-block.css',
		array( 'wp-edit-blocks' ),
		filemtime( dirname( __FILE__ ) . '/assets/standings-block.css' )
	);

}

/*
STANDINGS FRONT END LOAD ASSETS
*/
function teamlinkt_standings_api_assets(){
	//load script on front end
	wp_enqueue_script(
		'standings-api',
		plugin_dir_url( __FILE__ ) . 'assets/standings-api.js',
		array( ),
		filemtime( dirname( __FILE__ ) . '/assets/standings-api.js' )
   	);
	
	// Pass variables into schedule script
	wp_localize_script(
		'standings-api',
		'standings_api_object',
		array(
			'standings_settings' => get_option("teamlinkt_standings")
		)
	);

	wp_enqueue_style(
		'standings-block-css',
		plugin_dir_url( __FILE__ ) . 'assets/standings-block.css',
		array( 'wp-edit-blocks' ),
		filemtime( dirname( __FILE__ ) . '/assets/standings-block.css' )
   	);
}

/*
LOCATIONS BACK END LOAD ASSETS
*/
function teamlinkt_locations_block_assets(){
	//load scripts for the block on admin side
	wp_enqueue_script(
 		'locations-block',
		plugin_dir_url( __FILE__ ) . 'assets/locations-block.js',
		array( 'wp-blocks', 'wp-element' ),
		filemtime( dirname( __FILE__ ) . '/assets/locations-block.js' )
	);

	wp_enqueue_style(
		'locations-block-css',
		plugin_dir_url( __FILE__ ) . 'assets/locations-block.css',
		array( 'wp-edit-blocks' ),
		filemtime( dirname( __FILE__ ) . '/assets/locations-block.css' )
	);

}

/*
LOCATIONS FRONT END LOAD ASSETS
*/
function teamlinkt_locations_api_assets(){
	//load script on front end
	wp_enqueue_script(
		'locations-api',
		plugin_dir_url( __FILE__ ) . 'assets/locations-api.js',
		array( ),
		filemtime( dirname( __FILE__ ) . '/assets/locations-api.js' )
   	);
	
	// Pass variables into schedule script
	wp_localize_script(
		'locations-api',
		'locations_api_object',
		array(
			'locations_settings' => get_option("teamlinkt_locations")
		)
	);

	wp_enqueue_style(
		'locations-block-css',
		plugin_dir_url( __FILE__ ) . 'assets/locations-block.css',
		array( 'wp-edit-blocks' ),
		filemtime( dirname( __FILE__ ) . '/assets/locations-block.css' )
   	);
}

/** 
 * 
 * 
 * 
 * This is the code for the settings part of the plugin
 * 
 * 
 * 
*/
// Make sure we don't expose any info if called directly
if ( !function_exists( 'add_action' ) ) {
	echo 'Hi there!  I\'m just a plugin, not much I can do when called directly.';
	exit;
}

define( 'TEAMLINKT_VERSION', '4.1.9' );
define( 'TEAMLINKT__MINIMUM_WP_VERSION', '4.0' );
define( 'TEAMLINKT__PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'TEAMLINKT_DELETE_LIMIT', 100000 );


function teamlinkt_setup() {
	
}

function teamlinkt_activate() {
	
}

function teamlinkt_deactivate() {
	
}

function teamlinkt_create_menu() {
	//create new top-level menu
	add_menu_page('TeamLinkt Options', 'TeamLinkt', 'manage_options',  'teamlinkt_general', 'teamlinkt_options_page_html' , plugins_url('/assets/images/menu_icon.png', __FILE__) );
}


// General section content cb
function teamlinkt_api_settings_callback($args) {
	echo '<p>Adjust settings for all of your TeamLinkt Blocks.</p>';
}

// Schedule section content cb
function teamlinkt_schedule_settings_callback($args) {
	echo '<p>Settings for schedule blocks.</p>';
}

// Scores section content cb
function teamlinkt_scores_settings_callback($args) {
	echo '<p>Settings for scores blocks.</p>';
}

// Stats section content cb
function teamlinkt_stats_settings_callback($args) {
	echo "<p>There aren't any custom settings for Stats, yet!</p>";
}

// Standings section content cb
function teamlinkt_standings_settings_callback($args) {
	echo "<p>There aren't any custom settings for Standings, yet!</p>";
}

// Locations section content cb
function teamlinkt_locations_settings_callback($args) {
	echo "<p>There aren't any custom settings for Locations, yet!</p>";
}
 
function teamlinkt_about_tab_callback() {
	echo 
	'<div style="margin-top:10px; margin-left:10px; margin-right:10px;">'.
		'<div>'.
			'<h3>Transform any WordPress Site into a data-driven Sports League, Club or Association Website - complete with schedules/fixtures, standings, scores, statistics and more. <a target="_blank" href="https://www.teamlinkt.com">Go to TeamLinkt</a></h3>'.
		'</div>'.
		'<div class="" style="text-align:center; margin-top:20px;">'.
			'<iframe width="640" height="360" src="https://www.youtube.com/embed/-kZEHTGfBKw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'.
		'</div>'.
		'<div>'.
			'<p>Simply create and manage your season and registration through the Free TeamLinkt Management Platform (<a target="_blank" href="https://www.teamlinkt.com">www.teamlinkt.com</a>) and use this plugin to easily embed your dynamic content. </p>'.
			'<p>Additionally, TeamLinkt includes a free, full-featured Team Management Smartphone App, enabling your teams to organize and connect by accessing their schedule, roster, chat, photo sharing and more. Teams can self-report scores back to your league and you can communicate schedule changes and other updates in real-time via the TeamLinkt App.</p>'.
			'<p>TeamLinkt is used by thousands of leagues, clubs and associations. It’s fully supported and built for team sports organizations, like Soccer, Football, Basketball, Volleyball, Hockey, etc.</p>'.
		'</div>'.
	'</div>';
}

function teamlinkt_setup_tab_callback() {
	echo  
	'<div style="margin-top:10px; margin-left:10px; margin-right:10px;">'.
		'<div>'.
			'<h2>Get started using our Free and Powerful tools!</h2>'.
		'</div>'.
		'<div>'.
			'Follow our instructions on how to get your API Key <a target="_blank" href="https://help.teamlinkt.com/en/articles/5847437-wordpress-plugin-api-key">here</a>'.
			'<div class="card">'.
				'<ol>'.
					'<li>Login/Signup at <a target="_blank" href="https://app.teamlinkt.com/association_sites/edit_settings">www.teamlinkt.com</a> and get your API Key. '.
					'Follow our instructions on how to get your API Key <a target="_blank" href="https://help.teamlinkt.com/en/articles/5847437-wordpress-plugin-api-key">here</a></li>'.
					'<li>Go to the General Tab above, and paste the API Key there</li>'.
					'<li>Done! Checkout the other tabs to customize each blocks settings.</li>'.
				'</ol>'.
				'<p>When you edit a page or post you will now be able to add each block and display your leagues content live!</p>'.
			'</div>'.
		'</div>'.
	'</div>';
}
 
// field content cb
function teamlinkt_settings_field_callback() {
	// get the value of the setting we've registered with register_setting()
    $setting = get_option('teamlinkt_setting_name');
    // output the field
    
	//print_r(setting);
	?>
    <input type="text" name="teamlinkt_setting_name" value="<?php echo isset( $setting ) ? esc_attr( $setting ) : ''; ?>">
    <?php
}

function teamlinkt_form_validate($input) {
    $newinput['api_key'] = trim( $input['api_key'] );
    //if ( ! preg_match( '/^[a-z0-9]{32}$/i', $newinput['api_key'] ) ) {
    //    $newinput['api_key'] = '';
    //}
    return $newinput;
}

function teamlinkt_options_page_html() {
	// check user capabilities
  if ( ! current_user_can( 'manage_options' ) ) {
    return;
  }
  //Get the active tab from the $_GET param
  $tab = null;
  $selected_tab = sanitize_text_field($_GET['tab']);
  if (isset($selected_tab) && in_array($selected_tab, ['schedule','scores','stats','standings','locations','about','setup'])) {
	$tab = $selected_tab;
  }
  
?>
<div class="wrap">
	<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
	<!-- Here are our tabs -->
    <nav class="nav-tab-wrapper">
      <a href="?page=teamlinkt_general" class="nav-tab <?php if($tab===null):?>nav-tab-active<?php endif; ?>">General</a>
      <a href="?page=teamlinkt_general&tab=schedule" class="nav-tab <?php if($tab==='schedule'):?>nav-tab-active<?php endif; ?>">Schedule</a>
      <a href="?page=teamlinkt_general&tab=scores" class="nav-tab <?php if($tab==='scores'):?>nav-tab-active<?php endif; ?>">Scores</a>
      <a href="?page=teamlinkt_general&tab=stats" class="nav-tab <?php if($tab==='stats'):?>nav-tab-active<?php endif; ?>">Stats</a>
      <a href="?page=teamlinkt_general&tab=standings" class="nav-tab <?php if($tab==='standings'):?>nav-tab-active<?php endif; ?>">Standings</a>
      <a href="?page=teamlinkt_general&tab=locations" class="nav-tab <?php if($tab==='locations'):?>nav-tab-active<?php endif; ?>">Locations</a>
      <a href="?page=teamlinkt_general&tab=about" class="nav-tab <?php if($tab==='about'):?>nav-tab-active<?php endif; ?>">About</a>
      <!-- <a href="?page=teamlinkt_general&tab=setup" class="nav-tab <?php if($tab==='setup'):?>nav-tab-active<?php endif; ?>">Setup</a>
	  -->
	</nav>
	<div class="tab-content">
		<form action="options.php" method="post">
    <?php switch($tab) :
      case 'schedule':
        echo
		// output security fields for the registered setting "teamlinkt_options"
		settings_fields( 'teamlinkt_schedule' ).
		// output setting sections and their fields
		// (sections are registered for "wporg", each field is registered to a specific section)
		do_settings_sections( 'teamlinkt_schedule' ).
		// output save settings button
		submit_button( __( 'Save Settings', 'textdomain' ) ).
		'</form>';
        break;
      case 'scores':
        echo
		// output security fields for the registered setting "teamlinkt_options"
		settings_fields( 'teamlinkt_scores' ).
		// output setting sections and their fields
		// (sections are registered for "wporg", each field is registered to a specific section)
		do_settings_sections( 'teamlinkt_scores' ).
		// output save settings button
		submit_button( __( 'Save Settings', 'textdomain' ) ).
		'</form>';
        break;
      case 'stats':
        echo
		// output security fields for the registered setting "teamlinkt_options"
		settings_fields( 'teamlinkt_stats' ).
		// output setting sections and their fields
		// (sections are registered for "wporg", each field is registered to a specific section)
		do_settings_sections( 'teamlinkt_stats' ).
		// output save settings button
		//submit_button( __( 'Save Settings', 'textdomain' ) ).
		'</form>';
        break;
      case 'standings':
        echo
		// output security fields for the registered setting "teamlinkt_options"
		settings_fields( 'teamlinkt_standings' ).
		// output setting sections and their fields
		// (sections are registered for "wporg", each field is registered to a specific section)
		do_settings_sections( 'teamlinkt_standings' ).
		// output save settings button
		//submit_button( __( 'Save Settings', 'textdomain' ) ).
		'</form>';
        break;
      case 'locations':
        echo
		// output security fields for the registered setting "teamlinkt_options"
		settings_fields( 'teamlinkt_locations' ).
		// output setting sections and their fields
		// (sections are registered for "wporg", each field is registered to a specific section)
		do_settings_sections( 'teamlinkt_locations' ).
		// output save settings button
		//submit_button( __( 'Save Settings', 'textdomain' ) ).
		'</form>';
        break;
      case 'about':
		// (sections are registered for "wporg", each field is registered to a specific section)
		teamlinkt_about_tab_callback();
        break;
      case 'setup':
		// (sections are registered for "wporg", each field is registered to a specific section)
		teamlinkt_setup_tab_callback();
        break;
      default:
        echo '<form action="options.php" method="post">'.
		// output security fields for the registered setting "teamlinkt_options"
		settings_fields( 'teamlinkt_general' ).
		// output setting sections and their fields
		// (sections are registered for "wporg", each field is registered to a specific section)
		do_settings_sections( 'teamlinkt_general' ).
		// output save settings button
		submit_button( __( 'Save Settings', 'textdomain' ) );
		teamlinkt_setup_tab_callback();
        break;
    endswitch; ?>
		</form>
    </div>
	
</div>
<?php
}

/*
GENERAL CALLBACK FUNCTIONS FOR ADMIN SETTINGS
*/
function teamlinkt_settings_display_api_key_callback() {
	$options = get_option( 'teamlinkt_general' );
    echo "<input id='teamlinkt_association_key' name='teamlinkt_general[api_key]' type='text' value='" . esc_attr( $options['api_key'] ) . "' />";
}

function teamlinkt_settings_display_preferred_season_callback() {
	$options = get_option( 'teamlinkt_general' );
    echo "<select id='teamlinkt_plugin_preferred_season' name='teamlinkt_general[preferred_season]' value='" . esc_attr( $options['preferred_season'] ) . "'></select>";
}
/*
END OF GENERAL CALLBACK FUNCTIONS FOR ADMIN SETTINGS
*/

/*
SCHEDULE CALLBACK FUNCTIONS FOR ADMIN SETTINGS
*/
function teamlinkt_schedule_display_show_games_only_callback() {
	$options = get_option( 'teamlinkt_schedule' );
    echo "<select id='teamlinkt_plugin_show_games_only' name='teamlinkt_schedule[show_games_only]' value='" . esc_attr( $options['show_games_only'] ) . "'>".
		"<option ".($options['show_games_only'] ? "selected" : "")." value='1'>Yes</option>".
		"<option ".(!$options['show_games_only'] ? "selected" : "")." value='0'>No</option>".
	"</select>";
}

function teamlinkt_settings_display_schedule_type_callback() {
	$options = get_option( 'teamlinkt_schedule' );
    echo "<select id='teamlinkt_plugin_schedule_type' name='teamlinkt_schedule[schedule_type]' value='" . esc_attr( $options['schedule_type'] ) . "'>".
		"<option ".($options['schedule_type']=='scores' ? "selected" : "")." value='scores'>Yes</option>".
		"<option ".($options['schedule_type']=='schedule' ? "selected" : "")." value='schedule'>No</option>".
	"</select>";
}

function teamlinkt_settings_display_schedule_status_callback() {
	$options = get_option( 'teamlinkt_schedule' );
    echo "<select id='teamlinkt_plugin_schedule_status' name='teamlinkt_schedule[status]' value='" . esc_attr( $options['status'] ) . "'>".
		"<option ".($options['status']=='all' ? "selected" : "")." value='all'>All</option>".
		"<option ".($options['status']=='past' ? "selected" : "")." value='past'>Past</option>".
		"<option ".($options['status']=='current' ? "selected" : "")." value='current'>Upcoming</option>".
	"</select>";
}

function teamlinkt_settings_display_schedule_gameday_links_callback() {
	$options = get_option( 'teamlinkt_schedule' );
    echo "<select id='teamlinkt_plugin_schedule_gameday_links' name='teamlinkt_schedule[gameday_links]' value='" . esc_attr( $options['gameday_links'] ) . "'>".
		"<option ".($options['gameday_links']==0 ? "selected" : "")." value=0>No</option>".
		"<option ".($options['gameday_links']==1 ? "selected" : "")." value=1>Yes</option>".
	"</select>";
}

function teamlinkt_settings_display_schedule_team_site_links_callback() {
	$options = get_option( 'teamlinkt_schedule' );
    echo "<select id='teamlinkt_plugin_schedule_status' name='teamlinkt_schedule[team_site_links]' value='" . esc_attr( $options['team_site_links'] ) . "'>".
		"<option ".($options['team_site_links']==0 ? "selected" : "")." value=0>No</option>".
		"<option ".($options['team_site_links']==1 ? "selected" : "")." value=1>Yes</option>".
	"</select>";
}

function teamlinkt_settings_display_schedule_date_format_callback() {
	$options = get_option( 'teamlinkt_schedule' );
    echo "<select id='teamlinkt_plugin_schedule_date_format' name='teamlinkt_schedule[date_format]' value='" . esc_attr( $options['date_format'] ) . "'>".
		"<option ".($options['date_format']=="short" ? "selected" : "")." value='short'>2021-01-31</option>".
		"<option ".($options['date_format']=="long" ? "selected" : "")." value='long'>Wednesday, January 31, 2021</option>".
		"<option ".($options['date_format']=="med" ? "selected" : "")." value='med'>Wed, Jan 31</option>".
	"</select>";
}

function teamlinkt_settings_display_schedule_time_format_callback() {
	$options = get_option( 'teamlinkt_schedule' );
    echo "<select id='teamlinkt_plugin_schedule_time_format' name='teamlinkt_schedule[time_format]' value='" . esc_attr( $options['time_format'] ) . "'>".
		"<option ".($options['time_format']=="12hr" ? "selected" : "")." value='12hr'>1:00 PM</option>".
		"<option ".($options['time_format']=="24hr" ? "selected" : "")." value='24hr'>13:00</option>".
	"</select>";
}
/*
END OF SCHEDULE CALLBACK FUNCTIONS
*/

/*
SCORES CALLBACK FUNCTIONS FOR ADMIN SETTINGS
*/
function teamlinkt_settings_display_scores_type_callback() {
	$options = get_option( 'teamlinkt_scores' );
    echo "<select id='teamlinkt_plugin_scores_type' name='teamlinkt_scores[schedule_type]' value='" . esc_attr( $options['schedule_type'] ) . "'>".
		"<option ".($options['schedule_type']=='scores' ? "selected" : "")." value='scores'>Yes</option>".
		"<option ".($options['schedule_type']=='schedule' ? "selected" : "")." value='schedule'>No</option>".
	"</select>";
}

function teamlinkt_settings_display_scores_gameday_links_callback() {
	$options = get_option( 'teamlinkt_scores' );
    echo "<select id='teamlinkt_plugin_scores_gameday_links' name='teamlinkt_scores[gameday_links]' value='" . esc_attr( $options['gameday_links'] ) . "'>".
		"<option ".($options['gameday_links']==0 ? "selected" : "")." value=0>No</option>".
		"<option ".($options['gameday_links']==1 ? "selected" : "")." value=1>Yes</option>".
	"</select>";
}

function teamlinkt_settings_display_scores_team_site_links_callback() {
	$options = get_option( 'teamlinkt_scores' );
    echo "<select id='teamlinkt_plugin_scores_status' name='teamlinkt_scores[team_site_links]' value='" . esc_attr( $options['team_site_links'] ) . "'>".
		"<option ".($options['team_site_links']==0 ? "selected" : "")." value=0>No</option>".
		"<option ".($options['team_site_links']==1 ? "selected" : "")." value=1>Yes</option>".
	"</select>";
}

function teamlinkt_settings_display_scores_date_format_callback() {
	$options = get_option( 'teamlinkt_scores' );
    echo "<select id='teamlinkt_plugin_scores_date_format' name='teamlinkt_scores[date_format]' value='" . esc_attr( $options['date_format'] ) . "'>".
		"<option ".($options['date_format']=="short" ? "selected" : "")." value='short'>2021-01-31</option>".
		"<option ".($options['date_format']=="long" ? "selected" : "")." value='long'>Wednesday, January 31, 2021</option>".
		"<option ".($options['date_format']=="med" ? "selected" : "")." value='med'>Wed, Jan 31</option>".
	"</select>";
}

function teamlinkt_settings_display_scores_time_format_callback() {
	$options = get_option( 'teamlinkt_scores' );
    echo "<select id='teamlinkt_plugin_scores_time_format' name='teamlinkt_scores[time_format]' value='" . esc_attr( $options['time_format'] ) . "'>".
		"<option ".($options['time_format']=="12hr" ? "selected" : "")." value='12hr'>1:00 PM</option>".
		"<option ".($options['time_format']=="24hr" ? "selected" : "")." value='24hr'>13:00</option>".
	"</select>";
}
/*
END OF SCORES CALLBACK FUNCTIONS
*/

function teamlinkt_register_settings() { // whitelist options

	/*
	General Settings for all TeamLinkt Blocks
	*/
	register_setting('teamlinkt_general', 'teamlinkt_general', ['type'=>'string', 'default'=>NULL, 'description'=>'Settings for the TeamLinkt Plugin']);
	//register_setting('general', 'account_email', ['type'=>'string', 'default'=>NULL, 'description'=>'Your TeamLinkt account email']);

    add_settings_section(
        'teamlinkt_api_settings',
        'API Settings', 
		'teamlinkt_api_settings_callback',
        'teamlinkt_general'
    );
 
    add_settings_field(
        'api_key',
        'API Key', 
		'teamlinkt_settings_display_api_key_callback',
        'teamlinkt_general',
        'teamlinkt_api_settings'
    );

	add_settings_field(
        'preferred_season',
        'Default Season', 
		'teamlinkt_settings_display_preferred_season_callback',
        'teamlinkt_general',
        'teamlinkt_api_settings'
    );
	
	/*
	Settings for the Schedule Block
	*/
	register_setting('teamlinkt_schedule', 'teamlinkt_schedule', ['type'=>'string', 'default'=>NULL, 'description'=>'Settings for the Schedule Blocks']);
	
	add_settings_section(
        'teamlinkt_schedule_settings',
        'Schedule Settings', 
		'teamlinkt_schedule_settings_callback',
        'teamlinkt_schedule'
    );
	
	add_settings_field(
        'show_games_only',
        'Show Games Only', 
		'teamlinkt_schedule_display_show_games_only_callback',
        'teamlinkt_schedule',
        'teamlinkt_schedule_settings'
    );
	
	add_settings_field(
        'status',
        'Show All/Past/Upcoming Events', 
		'teamlinkt_settings_display_schedule_status_callback',
        'teamlinkt_schedule',
        'teamlinkt_schedule_settings'
    );
	
	add_settings_field(
        'schedule_type',
        'Only Show Games with Scores', 
		'teamlinkt_settings_display_schedule_type_callback',
        'teamlinkt_schedule',
        'teamlinkt_schedule_settings'
    );
	
	add_settings_field(
        'gameday_links',
        'Include Links to Gameday Summary', 
		'teamlinkt_settings_display_schedule_gameday_links_callback',
        'teamlinkt_schedule',
        'teamlinkt_schedule_settings'
    );
	
	add_settings_field(
        'team_site_links',
        'Include Links to Team Sites', 
		'teamlinkt_settings_display_schedule_team_site_links_callback',
        'teamlinkt_schedule',
        'teamlinkt_schedule_settings'
    );
	
	add_settings_field(
        'date_format',
        'Preferred Date Format', 
		'teamlinkt_settings_display_schedule_date_format_callback',
        'teamlinkt_schedule',
        'teamlinkt_schedule_settings'
    );
	
	add_settings_field(
        'time_format',
        'Preferred Time Format', 
		'teamlinkt_settings_display_schedule_time_format_callback',
        'teamlinkt_schedule',
        'teamlinkt_schedule_settings'
    );
		
	/*
	Settings for the Scores Block
	*/
	register_setting('teamlinkt_scores', 'teamlinkt_scores', ['type'=>'string', 'default'=>NULL, 'description'=>'Settings for the Scores Blocks']);
	
	add_settings_section(
        'teamlinkt_scores_settings',
        'Scores Settings', 
		'teamlinkt_scores_settings_callback',
        'teamlinkt_scores'
    );
	
	add_settings_field(
        'scores_type',
        'Only Show Games with Scores', 
		'teamlinkt_settings_display_scores_type_callback',	
        'teamlinkt_scores',
        'teamlinkt_scores_settings'
    );
	
	add_settings_field(
        'gameday_links',
        'Include Links to Gameday Summary', 
		'teamlinkt_settings_display_scores_gameday_links_callback',
        'teamlinkt_scores',
        'teamlinkt_scores_settings'
    );
	
	add_settings_field(
        'team_site_links',
        'Include Links to Team Sites', 
		'teamlinkt_settings_display_scores_team_site_links_callback',
        'teamlinkt_scores',
        'teamlinkt_scores_settings'
    );
	
	add_settings_field(
        'date_format',
        'Preferred Date Format', 
		'teamlinkt_settings_display_scores_date_format_callback',
        'teamlinkt_scores',
        'teamlinkt_scores_settings'
    );
	
	add_settings_field(
        'time_format',
        'Preferred Time Format', 
		'teamlinkt_settings_display_scores_time_format_callback',
        'teamlinkt_scores',
        'teamlinkt_scores_settings'
    );
	
	/*
	Settings for the Stats Block
	*/
	register_setting('teamlinkt_stats', 'teamlinkt_stats', ['type'=>'string', 'default'=>NULL, 'description'=>'Settings for the Stats Blocks']);
	
	add_settings_section(
        'teamlinkt_stats_settings',
        'Stats Settings', 
		'teamlinkt_stats_settings_callback',
        'teamlinkt_stats'
    );

	/*
	Settings for the Standings Block
	*/
	register_setting('teamlinkt_standings', 'teamlinkt_standings', ['type'=>'string', 'default'=>NULL, 'description'=>'Settings for the Standings Blocks']);
	
	add_settings_section(
        'teamlinkt_standings_settings',
        'Standings Settings', 
		'teamlinkt_standings_settings_callback',
        'teamlinkt_standings'
    );
	
	/*
	Settings for the Locations Block
	*/
	register_setting('teamlinkt_locations', 'teamlinkt_locations', ['type'=>'string', 'default'=>NULL, 'description'=>'Settings for the Locations Blocks']);
	
	add_settings_section(
        'teamlinkt_locations_settings',
        'Locations Settings', 
		'teamlinkt_locations_settings_callback',
        'teamlinkt_locations'
    );

	//load script on settings page
	wp_enqueue_script(
		'teamlinkt-settings',
		plugin_dir_url( __FILE__ ) . 'assets/teamlinkt-settings.js', //The env variable for admin settings is stored in this script
		array( ),
		filemtime( dirname( __FILE__ ) . '/assets/teamlinkt-settings.js' )
   	);
	// Pass variables into the script
	wp_localize_script(
		'teamlinkt-settings',
		'teamlinkt_settings',
		array(
			'general_settings' => get_option("teamlinkt_general"),
			'schedule_settings' => get_option("teamlinkt_schedule"),
			'scores_settings' => get_option("teamlinkt_scores"),
		)
	);


}

add_action( 'init', 'teamlinkt_setup' );

register_activation_hook( __FILE__, 'teamlinkt_activate' );
register_deactivation_hook( __FILE__, 'teamlinkt_deactivate' );

if ( is_admin() ){ // admin actions
  add_action( 'admin_menu', 'teamlinkt_create_menu' );
  add_action( 'admin_init', 'teamlinkt_register_settings' );
} else {
  // non-admin enqueues, actions, and filters
}


//include("src/TL_Schedule_Widget.php");