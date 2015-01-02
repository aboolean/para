/*ToolView.js
* master view for all drawing tools */

define([
  'jquery',
  'underscore',
  'backbone',
  'utils/analytics'

], function($, _, Backbone, analytics){

  var lastSelected;
  var eventType = 'toolChange';
  var ToolView = Backbone.View.extend({
    //

    initialize: function(){
      this.penToolClick();
    },

    render: function(){

    },

     events: {
    'click #selectTool': 'selectToolClick',
    'click #penTool': 'penToolClick',
    'click #polyTool': 'polyToolClick',
    'click #rotateTool': 'rotateToolClick',
    'click #followPathTool': 'followPathToolClick',
    'click #undoTool': 'undoToolClick',
    'click #redoTool': 'redoToolClick'
  	},

    undoToolClick: function(){
      this.model.undo();
      analytics.log(eventType,{type:eventType,id:'undo',action:'undo'});
    },

    redoToolClick: function(){
      this.model.redo();
      analytics.log(eventType,{type:eventType,id:'redo',action:'redo'});
    },

    setActive: function (tool) {
      this.clearActive();
      $('#' + tool).addClass('active');
      lastSelected = $('#' + tool);
      this.model.setState(tool);
      analytics.log(eventType,{type:eventType,id:tool,action:'toolSelected'});
    },

  	clearActive: function (){
  		if(lastSelected){
  			lastSelected.removeClass('active');
  		}
  	},

    selectToolClick: function () {
      this.setActive('selectTool');
    },

    followPathToolClick: function () {
      this.setActive('followPathTool');
    },

    penToolClick: function () {
      this.setActive('penTool');
    },

    polyToolClick: function () {
      this.setActive('polyTool');
    },

    rotateToolClick: function () {
      this.setActive('rotateTool');
    },

  });

  return ToolView;

});