var GlScene = function(canvasId){
	var ctx = null;
	var Canvas = null;
	var animPrevframeTime = new Date().getTime();
	var doAnimation = false;
	var animId = null;
	var self = this;
	var curFps = 0;
	var	targetFps = 60;
	var shaderPrg = null;
	var curShaderPrg = null;
	var sceneObjects = [];
	var bgColor = [0.0, 0.0, 0.0, 1.0];
	
	Canvas = document.getElementById(canvasId);
	
	if(Canvas == null){
		alert("Can not find the required canvas element.");
		return false;
	}
			
	var contextnames = ["webgl", "webkit-3d", "moz-webgl", "experimental-webgl"];
	
	for(var i in contextnames){
		try{
			ctx = Canvas.getContext(contextnames[i]);
			if(ctx) break;
		}catch(e){
			console.log(e.message);
			if(ctx) break;
		}
	}
			
	if(ctx == null){
		alert("WebGl is not available");
		return false;
	}
	
	// init the shader 
	_initShaderProgram();
	
	function _initShaderProgram(){
		shaderPrg = ctx.createProgram();
		vxShader = GlShader.FromScriptTag('shader-vs', ctx);
		fgShader = GlShader.FromScriptTag('shader-fs', ctx);
		ctx.attachShader(shaderPrg, vxShader);
		ctx.attachShader(shaderPrg, fgShader);
		ctx.linkProgram(shaderPrg);
	
		if (!ctx.getProgramParameter(shaderPrg, ctx.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}
	
		ctx.useProgram(shaderPrg);
		
	}
	/**
	 * private _render
	 */
	function _render(timedelta){
		if(doAnimation){
			animId = requestAnimationFrame(_render);
		}
		
		if(typeof(timedelta) == 'undefined'){
			timedelta = animPrevframeTime;
		}
		
		
		if(timedelta != animPrevframeTime){
			curFps = parseInt(1000 / (timedelta - animPrevframeTime));
		}
		if(curFps > targetFps) return false;
		
		animPrevframeTime = timedelta;
		
		ctx.clearColor(bgColor[0], bgColor[1], bgColor[0], bgColor[3]);
		ctx.enable(ctx.DEPTH_TEST);
		ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
		ctx.viewport(0,0, Canvas.width, Canvas.height);
		
		//do the scene rendering from here
		for (var i in sceneObjects){
			sceneObjects[i].useProgram(shaderPrg);
			sceneObjects[i].render();
		}
	}
	
	/**
	 * returns the scenes gl context 
	 */
	this.getContext = function(){
		return ctx;
	};
	
	/**
	 * render the scene
	 */
	this.render = function(){
		_render(new Date().getTime());
	};
	
	/**
	 * set the animation flag
	 */
	this.setAnimate = function(animate){
		if(typeof(animate) != 'boolean'){
			animate = true;
		}
		doAnimation = animate;
		
		if(!doAnimation && animId){
				cancelAnimationFrame(animId);
				animId = null;
		}
	};
	
	/**
	 * sets the scene's target FPS 
	 */
	this.setTargetFps = function(val){
		val = parseInt(val, 10);
		if(!isNaN(val)){
			targetFps = val;
		}
	};
	
	this.addObject = function(gl_obj){
		if(gl_obj instanceof GlObject){
			sceneObjects.push(gl_obj);
			gl_obj.setContext(ctx);
			return true;
		}
		
		return false;
	};
	
	this.setBgColor = function(r,g,b,a){
		for(var i in arguments){
			arguments[i] = parseFloat(arguments[i]);
			if(isNaN(arguments[i])){
				console.error('Invalid color value');
				return false;
			}
		}
		
		bgColor = [r,g,b,a];
	};
	
	this.getBgColor = function(){
		return bgColor;
	};
};