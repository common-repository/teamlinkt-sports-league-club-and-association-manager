/* This section of the code registers a new block, sets an icon and a category, and indicates what type of fields it'll include. */
  
wp.blocks.registerBlockType('teamlinkt/standings-box', {
	title: 'TeamLinkt Standings',
	icon: 'awards',
	category: 'common',
	attributes: {
	},
  
/* This configures how the content and color fields will work, and sets up the necessary elements */
  
	edit: function(props) {
		function updateAssociationId(event) {
			props.setAttributes({association_id: event.target.value})
		}
		function updateColor(value) {
			props.setAttributes({color: value.hex})
		}
		return React.createElement(
			"div",
			{style: {padding: "10px", textAlign: "center",	background: "white"}},
			React.createElement(
				"h3",
				null,
				"TeamLinkt Standings"
			),
			React.createElement(
				"p",
				null,
				"Nicely done. Your standings will appear here."
			)
		);
	},
	save: function(props) {
		

		return wp.element.createElement(
			"div",
			{ style: { border: "3px solid " + props.attributes.color } },
				wp.element.createElement("input",{type:"hidden", id:"teamlinktStandingsAssociationId", value:props.attributes.association_id}, null),
				wp.element.createElement("div",{style:{"text-align":"center;"}},
					wp.element.createElement("h2",{id:"message", style:{display:"none;"}},null)
				),
				wp.element.createElement("div",{class:"teamlinktFilterContainer"}, null),
				wp.element.createElement("div",{style:{"overflow-x":"scroll"}}, 
					wp.element.createElement("table",{id:"teamlinktStandingsTable", class:"table-borderless"},null)
				)
		);
	}
})