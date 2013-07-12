var GlShader = {
	FromScriptTag : function(scriptid, ctx){
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
            shader = ctx.createShader(ctx.FRAGMENT_SHADER);
        } else if (script.type == "x-shader/x-vertex") {
            shader = ctx.createShader(ctx.VERTEX_SHADER);
        } else {
            return null;
        }

        ctx.shaderSource(shader, str);
        ctx.compileShader(shader);

        if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
            console.log(ctx.getShaderInfoLog(shader));
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
	            console.log(ctx.getShaderInfoLog(shader));
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
	            console.log ('There was a problem loading the shader :' + filename+'\nHTML error code: ' + request.status);
			}
		  }
	    };
	    request.send();
	}
};