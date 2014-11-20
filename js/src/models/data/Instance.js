/*Instance.js
 * used to store references of a shape object
 *
 */

define([
	'underscore',
	'jquery',
	'models/data/SceneNode',
	'models/PaperManager',
	'utils/PPoint'
], function(_, $, SceneNode, PaperManager, PPoint) {
	var paper = PaperManager.getPaperInstance();

	var Instance = SceneNode.extend({
		name: 'instance',
		type: 'geometry',

		defaults: {
			visible: true,
			selected: false,
			closed: false,
			width: 0,
			height: 0,
			order: 0,

			//point attributes
			position: null,
			translation_delta: null,
			center: null,
			scaling_origin: null,
			scaling_delta: 1,
			rotation_origin: null,
			rotation_delta: 0,

			//screen properies
			screen_position: null,
			screen_width: 0,
			screen_height: 0,

			stroke_color: null,
			stroke_width: 1,
			fill_color: 0,

			rmatrix: null,
			tmatrix: null,
			smatrix: null,
			reset: false,
			geom: null,
			bbox: null,

		},



		initialize: function() {
			this.set('position', new PPoint(0, 0));
			this.set('translation_delta', new PPoint(0, 0));
			this.set('center', new PPoint(0, 0));
			this.set('scaling_origin', new PPoint(0, 0));
			this.set('rotation_origin', new PPoint(0, 0));
			this.set('tmatrix', new paper.Matrix());
			this.set('smatrix', new paper.Matrix());
			this.set('rmatrix', new paper.Matrix());
			var bounds = new paper.Rectangle(0, 0, 1, 1);
			this.set('bbox', new paper.Path.Rectangle(bounds));
			SceneNode.prototype.initialize.apply(this, arguments);

		},

		reset: function() {
			this.set('rendered', false);
			this.set('visited', false);
			var rmatrix = this.get('rmatrix');
			var smatrix = this.get('smatrix');
			var tmatrix = this.get('tmatrix');

			rmatrix.reset();
			smatrix.reset();
			tmatrix.reset();

			this.set('rmatrix', rmatrix);
			this.set('smatrix', smatrix);
			this.set('tmatrix', tmatrix);
		},

		resetProperties: function() {
			this.clear().set(this.defaults);
			this.set('position', new PPoint(0, 0));
			this.set('translation_delta', new PPoint(0, 0));
			this.set('center', new PPoint(0, 0));
			this.set('scaling_origin', new PPoint(0, 0));
			this.set('rotation_origin', new PPoint(0, 0));
			this.set('matrix', new paper.Matrix());
		},

		exportJSON: function() {
			return this.toJSON();
		},

		parseJSON: function(data) {
			this.set(data.toJSON);
		},


		//only called on a update function- 
		//sets instances' properties to that of the data
		update: function(data) {
			//console.log('updating instance',data);
			this.set(data);
			//console.log("translation_delta",this.get('translation_delta'));

		},


		incrementDelta: function(data) {
			var matrix = this.get('matrix');
			var position = this.get('rotation_origin').toPaperPoint();
			console.log('inc position', position.x, ',', position.y);

			if (data.translation_delta) {
				var translation_delta = this.get('translation_delta');
				//console.log('orig delta', translation_delta.x, ',', translation_delta.y);
				translation_delta.add(data.translation_delta);
				this.set('translation_delta', translation_delta);
				
			}
			if (data.rotation_delta) {
				var rotation_delta = this.get('rotation_delta');
				rotation_delta += data.rotation_delta;
				this.set('rotation_delta', rotation_delta);
			}

		},

		getCenter: function() {
			return {
				x: this.get('position').x + this.get('delta').x,
				y: this.get('position').y + this.get('delta').y
			};
		},

		getUpperLeft: function() {
			return {
				x: this.get('position').x + this.get('delta').x - this.get('width') / 2,
				y: this.get('position').y + this.get('delta').y - this.get('height') / 2,
			};
		},

		getLowerRight: function() {
			return {
				x: this.get('position').x + this.get('delta').x + this.get('width') / 2,
				y: this.get('position').y + this.get('delta').y + this.get('height') / 2,
			};
		},

		/*inheritGeom
		 * moves up the prototype chain to find the
		 * relevant geometry for this node and return it
		 */
		inheritGeom: function() {
			if (this.has('proto_node')) {
				var proto = this.get('proto_node');
				return proto.inheritGeom();
			}
		},

		inheritRotation: function(rmatrix, target_rotation_origin) {
			if (this.has('proto_node')) {
				var protoNode = this.get('proto_node');
				rmatrix = protoNode.inheritRotation(rmatrix, target_rotation_origin);
			}


			
			var rotation_delta = this.get('rotation_delta');
			rmatrix.rotate(rotation_delta, target_rotation_origin);

			return rmatrix;
		},

		inheritTranslation: function(tmatrix, target_origin) {
			if (this.has('proto_node')) {
				var protoNode = this.get('proto_node');
				tmatrix = protoNode.inheritTranslation(tmatrix, target_origin);
			}
			
			var translation_delta = this.get('translation_delta');
			tmatrix.translate(translation_delta);

			return tmatrix;
		},

		inheritScaling: function(smatrix, target_scaling_origin) {
			if (this.has('proto_node')) {
				var protoNode = this.get('proto_node');
				smatrix = protoNode.inheritScaling(smatrix, target_scaling_origin);
			}

			var scaling_delta = this.get('scaling_delta');
			smatrix.scale(scaling_delta, target_scaling_origin);

			return smatrix;
		},



		/*updateGeom
		 * moves up the prototype chain to find the
		 * relevant geometry to increment points
		 * when user selects and moves points of an instance
		 */
		updateGeom: function(segment_index, data, rmatrix, smatrix, tmatrix) {
			if (this.has('proto_node')) {
				var proto = this.get('proto_node');
				proto.updateGeom(segment_index, data, rmatrix, smatrix, tmatrix);
			}
		},

		/*only called on a render function-
		propagates the instances' properties with that of the data*/
		render: function() {
			//console.log("rendering instance");

			var rmatrix = this.get('rmatrix');
			var smatrix = this.get('smatrix');
			var tmatrix = this.get('tmatrix');
			var selected = this.get('selected');
			var position = this.get('position').toPaperPoint();
			var translation_delta = this.get('translation_delta').toPaperPoint();
			var rotation_origin = this.get('rotation_origin').toPaperPoint();
			console.log('rotation_origin', rotation_origin);
			var rotation_delta = this.get('rotation_delta');
			var scaling_origin = this.get('scaling_origin').toPaperPoint();
			var scaling_delta = this.get('scaling_delta');

			//console.log('translation_delta for render', translation_delta);

			rmatrix.rotate(rotation_delta, rotation_origin);
			smatrix.scale(scaling_delta, scaling_origin);
			tmatrix.translate(translation_delta);
			
			var protoNode = this.get('proto_node');
			if (protoNode) {
				console.log('inheriting transform for', this.name, this.type);
				tmatrix = protoNode.inheritTranslation(tmatrix, position);
				rmatrix = protoNode.inheritRotation(rmatrix, rotation_origin);
				smatrix = protoNode.inheritScaling(smatrix, scaling_origin);
			}


			

			var geom = this.inheritGeom();
			if (geom) {
				geom.data.instance = this;
				geom.position = position;
				geom.transform(rmatrix);
				geom.transform(smatrix);
				geom.transform(tmatrix);
				console.log('geom position', geom.position);
				var screen_bounds = geom.bounds;
				var bbox = this.get('bbox');
				bbox.selected = selected;
				geom.selected = selected;
				//screen_bounds.selected = selected;
				this.set({
					screen_position: screen_bounds.topLeft,
					screen_width: screen_bounds.width,
					screen_height: screen_bounds.height,
				});
				//console.log('screen_position',this.get('screen_position'));
				this.set('geom', geom);
			}
			this.set('rendered', true);
		},

		getLinkedDimensions: function(data) {
			var top = data.top;
			var dimensions = {};
			var position = this.get('screen_position');
			var width = this.get('screen_width');
			var height = this.get('screen_height');
			if (data.dimensions) {
				var pdimensions = data.dimensions;

				var leftX = position.x < pdimensions.leftX ? position.x : pdimensions.leftX;
				var topY = position.y < pdimensions.topY ? position.y : pdimensions.topY;
				var rightX = position.x + width > pdimensions.rightX ? position.x + width : pdimensions.rightX;
				var bottomY = position.y + height > pdimensions.bottomY ? position.y + height : pdimensions.bottomY;

				data.dimensions = {
					leftX: leftX,
					topY: topY,
					rightX: rightX,
					bottomY: bottomY,
				};
			} else {
				data.dimensions = {
					leftX: position.x,
					topY: position.y,
					rightX: position.x + width,
					bottomY: position.y + height,
				};
			}
			console.log("dimensions", data.dimensions);
			console.log("getting dimensions for children", this.children.length);
			data.top = false;
			for (var i = 0; i < this.children.length; i++) {

				data = this.children[i].getLinkedDimensions(data);
			}
			console.log("post_dimensions", data.dimensions);
			//TODO: recycle bounding box rather than re-initializing it.
			if (top) {
				var bx = data.dimensions.leftX;
				var by = data.dimensions.topY;
				var bwidth = data.dimensions.rightX - bx;
				var bheight = data.dimensions.bottomY - by;
				var rectangle = new paper.Rectangle(bx, by, bwidth, bheight);
				data.bbox = this.get('bbox');

				data.bbox.position = rectangle.center;

				var scaleX = rectangle.width / data.bbox.bounds.width;
				var scaleY = rectangle.height / data.bbox.bounds.height;
				data.bbox.scale(scaleX, scaleY);

				data.bbox.selectedColor = 'red';
				data.bbox.visible = true;
				data.bbox.selected = true;
				data.bbox.instance = this;
				this.set('bbox', data.bbox);
			}

			return data;
		},

		cloneInstance: function() {
			var clone = this.clone();
			clone.set('position', this.get('position').clone());
			clone.set('translation_delta', this.get('translation_delta').clone());
			clone.set('center', this.get('center').clone());
			clone.set('scaling_origin', this.get('scaling_origin').clone());
			clone.set('rotation_origin', this.get('rotation_origin').clone());
			clone.set('matrix', this.get('matrix').clone());
			clone.set('bbox', this.get('bbox').clone());
			return clone;
		}
	});

	return Instance;



});