/*PolygonNode.js
 * path object
 * extends GeometryNode
 * node with actual path in it
 */


define([
  'underscore',
  'models/data/PathNode',
  'models/data/Instance',
  'models/PaperManager'


], function(_, PathNode, Instance, PaperManager) {
  //drawable paper.js path object that is stored in the pathnode
  var paper = PaperManager.getPaperInstance();
  var EllipseNode = PathNode.extend({

    type: 'ellipse',
    name: 'none',

    constructor: function() {
      PathNode.apply(this, arguments);
    },

    initialize: function(data) {
        PathNode.prototype.initialize.apply(this, arguments);
    },

   //called when path points are modified
   updateParams: function(sideNum) {
    console.log("update params to",sideNum);
      this.resetObjects();
      //update the path
      for(var j=0;j<this.instance_literals.length;j++){
         var instance = this.instance_literals[j];
          var matrix = instance.data.tmatrix;

          var radX = instance.bounds.width/2;
          var radY = instance.bounds.height/2;
          var center = new paper.Point(0,0);
          console.log("center",center);
          console.log("rad",radX, radY);
          var width = instance.bounds.width;
        instance.remove();
        instance = null;
        // var boundingRectangle = new paper.Rectangle(center, new paper.Size(1, 1));
        // var newInstance = new paper.Path.Ellipse(boundingRectangle);
        var newInstance = new paper.Path.Ellipse({center:[0,0], radius:[1,1]});
        var scale = width/newInstance.bounds.width;
        newInstance.scale(scale);
        newInstance.reset= true;
        this.instance_literals[j] = newInstance;
      }
    }

   });

  return EllipseNode;
});