var GlApp = function(){
	var targetFps = 60;
	var Scenes = {};
	
	//setup the request animationframe global function
	window.requestAnimationFrame = (function()
	{
	  return window.requestAnimationFrame ||  
			 window.mozRequestAnimationFrame ||
	  		 window.webkitRequestAnimationFrame ||
			 window.oRequestAnimationFrame ||
			 window.msRequestAnimationFrame ||
			function(callback) { return window.setTimeout(function(){
				callback(new Date().getTime());
			}, 1000 / targetFps); };
	})();
			  
	window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || function(requestId){clearTimeout(requestId);};
	
	this.addScene = function(canvasId){
		if(typeof(Scenes[canvasId]) == 'undefined'){
			Scenes[canvasId] = new GlScene(canvasId);
			Scenes[canvasId].setTargetFps(targetFps);
		}
		return Scenes[canvasId];
	};
	
	this.getScene = function(canvasId){
		if(typeof(canvasId) != 'undefined' && typeof(Scenes[canvasId]) != 'undefined' && Scenes[canvasId] instanceof GlScene){
			return Scenes[canvasId];
		}
		return false;		
	};
	
	this.render = function(canvasId){
		if(typeof(canvasId) != 'undefined' && typeof(Scenes[canvasId]) != 'undefined' && Scenes[canvasId] instanceof GlScene){
			Scenes[canvasId].render();
		}else{
			//render all scenes
			for(var i in Scenes){
				Scenes[i].render();
			}
		}
		
		return false;
	};
	
	this.setAnimate = function(canvasId, animate){
		if(typeof(canvasId) != 'undefined' && typeof(Scenes[canvasId]) != 'undefined' && Scenes[canvasId] instanceof GlScene){
			Scenes[canvasId].setAnimate(animate);
		}
		return animate;
	};
	
	this.setTargetFps = function(val){
		val = parseInt(val, 10);
		
		if(!isNaN(val)){
			targetFps = val;
			for( var i in Scenes){
				Scenes[i].setTargetFps(targetFps);
			}
		}
	};
	
	
};

