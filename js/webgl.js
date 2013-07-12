var ReeaWebGlScene = ReeaWebGlScene || function(){
	var GlContext = null;
	var Canvas = null;
	var renderCallback = null;
	var inputHandler = null;
	var animHandler = null;
	var doAnimate = false;
	var targetFps = 30;
	var animPrevframeTime = 0;
	var curFps = 0;
	var sceneObjects = [];
	
	function _debug(msg){
		var dbg = document.getElementById("debug");
		dbg.innerHTML = msg;
	}
	
	function _render(){
		
		if(doAnimate){
			animHandler = requestAnimationFrame(_render);
		}
		var timedelta = arguments[0];
		if(typeof(timedelta) == 'undefined'){
			timedelta = animPrevframeTime;
		}
		
		
		if(timedelta != animPrevframeTime){
			curFps = parseInt(1000 / (timedelta - animPrevframeTime));
		}
		if(curFps > targetFps) return false;
		
		animPrevframeTime = timedelta;
		if(renderCallback){
			renderCallback(GlContext,timedelta);
		}
		
		_debug('fps: '+curFps); //+' ('+timedelta+' - '+animPrevframeTime+')';
		GlContext.clearColor(0.0, 0.0, 0.0, 1.0);
	    GlContext.enable(GlContext.DEPTH_TEST);
	
	    GlContext.clear(GlContext.COLOR_BUFFER_BIT | GlContext.DEPTH_BUFFER_BIT);
	    GlContext.viewport(0,0,Canvas.width, Canvas.height);
	    
		for(var i=0;  i < sceneObjects.length; i++){
			sceneObjects[i].render(GlContext);
		}
		return false;
	}
	
	function _inputhandler(evt){
		
		if(inputHandler){
			inputHandler(GlContext, evt);
		}
		evt.preventDefault();
		return false;
	}
	return {
		Init : function(canvasId){
			Canvas = document.getElementById(canvasId);
			if(Canvas == null){
				alert("Can not find the required canvas element.");
				return false;
			}
			
			var contextnames = ["webgl", "webkit-3d", "moz-webgl", "experimental-webgl"];
			for(var i in contextnames){
				try{
					GlContext = Canvas.getContext(contextnames[i]);
					if(GlContext) break;
				}catch(e){
					console.log(e.Message());
					if(GlContext) break;
				}
			}
			
			if(GlContext == null){
				alert("WebGl is not available");
				return false;
			}
			
			//setup teh request animationframe global function
			window.requestAnimationFrame = (function()
			  {
				  return window.webkitRequestAnimationFrame ||
				  window.mozRequestAnimationFrame ||
				  window.oRequestAnimationFrame ||
				  window.msRequestAnimationFrame ||
				  function(callback, element) { return window.setTimeout(function(){callback(element);}, 1000 / targetFps); };
			  })();
			  
			window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || function(){clearTimeout(arguments);};
			
			//console.log(GlContext);
			//console.log(GlContext.getParameter(GlContext.COLOR_CLEAR_VALUE));
			
			Canvas.onkeydown = _inputhandler;
			Canvas.onmousemove = _inputhandler;
			Canvas.onmousedown = _inputhandler;
			Canvas.onmouseup = _inputhandler;
			Canvas.oncontextmenu = _inputhandler;
			if (document.attachEvent) //if IE (and Opera depending on user setting)
    				Canvas.attachEvent("onmousewheel", _inputhandler);
			else if (document.addEventListener) //WC3 browsers
    				Canvas.addEventListener('DOMMouseScroll', _inputhandler, false);
			Canvas.focus();
		},
		
		setRenderFunc : function(myrenderfunc){
			if(typeof myrenderfunc == 'function'){
				renderCallback = myrenderfunc;
				return true;
			}
			
			return false;
		},
		setInputHandlerFunc : function(myinputhandler){
			if(typeof myinputhandler == 'function'){
				inputHandler = myinputhandler;
				return true;
			}
			
			return false;
		},
		
		startAnimation : function(){
			doAnimate = true;
			animStartTime = new Date().getTime();
			_render();
		},
		
		stopAnimation : function(){
			if(animHandler){
				cancelAnimationFrame(animHandler);
				animHandler = null;
			}
			doAnimate = false;
			curFps = 0;
		},
		
		render : function(){
			_render();
		},
		
		getContext : function(){
			return GlContext;
		},
		
		addObject : function(GlObject){
			sceneObjects.push(GlObject);
		}
	};
}();

/**
 * 
 */
var ReeaGlObj = function(_vertexdata, _indexdata){ 
	if(typeof(_vertexdata) == 'undefined'){
		_vertexdata = [];
	}
	if(typeof(_indexdata) == 'undefined'){
		_indexdata = [];
	}
	var vertexdata = new Float32Array(_vertexdata);
	var vertexidx = new Uint16Array(_indexdata);
	var objname = 'ReeaGlObject';
	
	var position = new Float32Array([0,0,0]);
	
	this.setGeometryData = function(_vertexdata, _indexdata){
		vertexdata.length = 0;
		vertexidx.length = 0;
		vertexdata = null;
		vertexidx = null;
		
		vertexdata = new Float32Array(_vertexdata);
		vertexidx = new Uint16Array(_indexdata);
	};
	
	this.getGeometryData = function(){
		return [vertexdata,vertexidx];
	};
	
	this.setPosition = function(x,y,z){
		position.length = 0;
		position = null;
		position = new Float32Array([x,y,z]);
	};
	
	this.getPosition = function(){
		return position;
	};
	
	this.setName = function(_name){
		if(typeof(_name) == 'string'){
			objname = _name;
		}
	};
	
	this.getName = function(){
		return objname;
	};
	
	this.jsonData = function(){
		var tempdata = {
			objname : objname,
			vertices : vertexdata,
			indices : vertexidx,
			position: position
		};
		
		return JSON.stringify(tempdata);
	};
	
	this.render = function(ctx){
		var objBuff = ctx.createBuffer();
		ctx.bindBuffer(ctx.ARRAY_BUFFER, objBuff);
		ctx.bufferData(ctx.ARRAY_BUFFER, vertexdata, ctx.STATIC_DRAW);
		ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
		
		var idxBuff = ctx.createBuffer();
		ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, idxBuff);
		ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, vertexidx, ctx.STATIC_DRAW);
		ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null);
		
		ctx.drawElements(ctx.LINE_LOOP, vertexidx.length, ctx.UNSIGNED_SHORT,0);
	};
};

/**
 * 
 */
var ReeaGlCube = function(width){
	var half = width / 2;
	var vertexes = [
		half, half, half,
		half, half, -1*half,
		half, -1*half, -1*half,
		half, -1*half, half,
		-1*half, -1*half, half,
		-1*half, half, half,
		-1*half, half, -1*half,
		-1*half, -1*half, -1*half
	];
	ReeaGlObj.apply(this,[vertexes,[1,2,3]]);
};

ReeaGlCube.prototype = new ReeaGlObj();

/**
 * 
 */
var ReeaGlCone = function(radius, height){
	var vertexes = [1.5, 0, 0,
					-1.5, 1, 0,
					-1.5, 0.809017, 0.587785,
					-1.5, 0.309017, 0.951057,
					-1.5, -0.309017, 0.951057,
					-1.5, -0.809017, 0.587785,
					-1.5, -1, 0.0,
					-1.5, -0.809017, -0.587785,
					-1.5, -0.309017, -0.951057,
					-1.5, 0.309017, -0.951057,
					-1.5, 0.809017, -0.587785
					];
	var indexes = [
		0, 1, 2,
		0, 2, 3,
		0, 3, 4,
		0, 4, 5,
		0, 5, 6,
		0, 6, 7,
		0, 7, 8,
		0, 8, 9,
		0, 9, 10,
		0, 10, 1
	];
	
	ReeaGlObj.apply(this,[vertexes,indexes]);
} ;
ReeaGlCone.prototype = new ReeaGlObj();

/**
 * 
 */
var ReeaGlShader = {
	FromScriptTag : function(ctx, scriptid){
		var script = document.getElementById(scriptid);
       if (!script) {
           return null;
       }

		var str = "";
		var k = script.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (script.type == "x-shader/x-fragment") {
            shader = ctx.createShader(gl.FRAGMENT_SHADER);
        } else if (script.type == "x-shader/x-vertex") {
            shader = ctx.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        ctx.shaderSource(shader, str);
        ctx.compileShader(shader);

        if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
            alert(ctx.getShaderInfoLog(shader));
            return null;
        }
        return shader;
	},
	
	FromString : function(source, type, ctx){
		var shader = null;
		switch(type){
			case 'vertex':
            	shader = ctx.createShader(ctx.VERTEX_SHADER);
				break;
			case 'fragment':
				shader = ctx.createShader(ctx.FRAGMENT_SHADER);
				break;
		}
		
		if(shader){
			ctx.shaderSource(shader, source);
        	ctx.compileShader(shader);
        	if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
	            alert(ctx.getShaderInfoLog(shader));
	            return null;
	        }
		}
	},
	Load : function(filename,type, ctx){
		var request = new XMLHttpRequest();
	    //var resource = document.location.protocol.replace(/\:/gi, '')+ "://"+document.domain+document.location.pathname+'assets/shaders/'+filename;
	    var resource = 'assets/shaders/'+type+'/'+filename;
	    request.open("GET",resource);
	    request.onreadystatechange = function() {
	        console.info(request.readyState +' - '+request.status); 
	      if (request.readyState == 4) {
		    if(request.status == 200 || (document.domain.length == 0 && request.status == 0)) { //OK
				ReeaGlShader.FromString(request.responseText, type, ctx);
			}
	        else{
	            alert ('There was a problem loading the shader :' + filename+'\nHTML error code: ' + request.status);
			}
		  }
	    };
	    request.send();
	}
};


/**
 * 
 */
function myrender(ctx, delta){
	//ctx.clearColor(Math.random(),Math.random(),Math.random(),1.0);
	//ctx.clear(ctx.COLOR_BUFFER_BIT);
}

function myinput(ctx, evt){
	//ctx.clearColor(Math.random(),Math.random(),Math.random(),1.0);
	//ctx.clear(ctx.COLOR_BUFFER_BIT);
	
	switch(evt.type){
		case 'mousemove':
			break;
		case 'mousedown':
			break;
		case 'keydown':
			break;
		case 'mousewheel':
		case 'DOMMouseScroll':
			break;
	}
}