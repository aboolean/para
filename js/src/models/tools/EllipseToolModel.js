/*PenToolModel.js
*base model class for all direct manipulation tool models*/

define([
  'underscore',
  'backbone',
  'models/tools/BaseToolModel',
  'models/data/EllipseNode',
  'models/PaperManager',
  'utils/analytics'


], function(_, Backbone, BaseToolModel, EllipseNode, PaperManager, analytics) {

  //types for bezier tool behavior
  var types = ['point', 'handleIn', 'handleOut'];
  var nameVal = 0;
  //segment being drawn, mode of current drawing, type
  var rotationAmt = 0;
  var scaleAmt = 0;
  var eventType = 'shapeAdded';



  var EllipseToolModel = BaseToolModel.extend({
  	  defaults:_.extend({},BaseToolModel.prototype.defaults,  {}),

  	initialize: function(){

  	},

    reset: function(){

      if(this.currentPath){
          this.trigger('rootChange',true);
      this.currentPath.selected = false;

        var pathNode  = new EllipseNode();
          pathNode.name = "Path_"+nameVal;
            nameVal++;
       this.currentPath.rotate(-rotationAmt);
           //console.log("rad=",this.currentPath.bounds.width/2);
        var instance = pathNode.createInstanceFromPath(this.currentPath.clone());
        instance.rotation.angle = rotationAmt;
        this.trigger('nodeAdded',pathNode);
         this.trigger('rootUpdate');
        this.trigger('rootRender');
        this.currentPath.remove();
        this.currentPath = null;
      }
        this.trigger('rootChange',false);
      this.trigger('rootRender');

      analytics.log(eventType,{type:eventType,id:'ellipse',action:'add'});

    },


      /*mousedown event- checks to see if current path has been initialized-
      *if it has not, create a new one and trigger a shapeAdded event
      */

      mouseDown : function(event) {
        //console.log("poly mouse down");
          if (!this.currentPath) {

          var paper = PaperManager.getPaperInstance();
          var boundingRectangle = new paper.Rectangle(event.point, new paper.Size(1, 1));
          this.currentPath =  new paper.Path.Ellipse(boundingRectangle);

          this.currentPath.selected = true;

          rotationAmt=0;
        }
      },



     //mouse up event
     mouseUp : function(event) {
      this.reset();

       },

     //mouse drag event
     mouseDrag: function(event){

       if (this.currentPath) {
        // scale to fit corner radius
        var deltaX = Math.abs(this.currentPath.position.x - event.point.x);
        var deltaY = Math.abs(this.currentPath.position.y - event.point.y);

        var radX = this.currentPath.bounds.width / 2;
        var radY = this.currentPath.bounds.height / 2;

        var scaleX = deltaX / radX;
        var scaleY = deltaY / radY;

        this.currentPath.scale(scaleX, scaleY);

        // stroke styling
        this.currentPath.strokeWidth = this.style.strokeWidth;
        this.currentPath.strokeColor = this.style.strokeColor;
        this.currentPath.fillColor = this.style.fillColor;
        if(this.fillColor==-1){
         this.currentPath.style.fillColor = null;

        }
        if(this.strokeColor==-1){
         this.currentPath.style.strokeColor = null;

        }
       }

     },

     //mouse move event
     mouseMove: function(event){

     }




  });

  return EllipseToolModel;

});