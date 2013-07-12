var GlObject = function(){
	var shaderPrg = null;
	var curShaderPrg = null;
	var shaders = {vertex : null, fragment : null};	
	var vertices = [];
	var indices = [];
	var ctx = null;
	var vertexBuffer = null;
	var indexBuffer = null;
	var color = [];
	
	this.getShaderPrg = function(){
		return shaderPrg;
	};
	
	this.addShader = function(type, source_str){
		var _type = type;
		
		if(typeof(source_str) != 'string'){
			 throw "Shader source needs to be a string.";
		}
		
		type = type == 'fragment'? ctx.FRAGMENT_SHADER : (type == 'vertex'? ctx.VERTEX_SHADER : null);
		
		if(!type){
			 throw 'Invalid shader type. use "fragment" or "vertex"';
		}
		
		var shader = ctx.createShader(type); 	//create the shader
		ctx.shadeSource(shader, source_str); 	//set source
		ctx.compileShader(shader);  			//compile the shader
		
		//check the complile status
		if(!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)){
			throw ctx.getShaderInfoLog(shader);
		}
		
		if(!shaderPrg){
			shaderPrg = ctx.createProgram();  //create the shader program attached to the object
		}
		
		ctx.attachShader(shaderPrg, shader);
		
		ctx.linkProgram(shaderPrg);   //link the shader 
		
		//check for link errors
		if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
            throw ctx.getShaderInfoLog(shader);
        }
        
        shaders[_type] = shader;
        return shader;
	};
	
	this.useProgram = function(default_prg){
		if(shaderPrg){
			ctx.useProgram(shaderPrg);
			curShaderPrg = shaderPrg;
		}else if(default_prg){
			ctx.useProgram(default_prg);
			curShaderPrg = default_prg;
		}
	};
	
	this.setData = function(vertx, indx){
		if(!ctx){
			console.error('Please attach the object to a scene first.');
			return false;
		}
		vertices = vertx;
		indices = indx;
		//The following code snippet creates a vertex buffer and binds the vertices to it
		vertexBuffer = ctx.createBuffer();
		ctx.bindBuffer(ctx.ARRAY_BUFFER, vertexBuffer);
		ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(vertices), ctx.STATIC_DRAW);
		ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
		
		//The following code snippet creates a vertex buffer and binds the indices to it
		indexBuffer = ctx.createBuffer();
		ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, indexBuffer);
		ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), ctx.STATIC_DRAW);
		ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null);
		return true;
	};
	
	this.getData = function(){
		return {vertices : vertices , indices : indices};
	};
	
	this.setContext = function(_ctx){
		ctx = _ctx;
	};
	
	this.render = function(){
		ctx.bindBuffer(ctx.ARRAY_BUFFER, vertexBuffer);
		ctx.vertexAttribPointer(curShaderPrg.aVertexPosition, 3, ctx.FLOAT, false, 0, 0);
		ctx.enableVertexAttribArray(curShaderPrg.vertexPosition);
		
		ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, indexBuffer);
		ctx.drawElements(ctx.TRIANGLES, indices.length, ctx.UNSIGNED_SHORT,0);
	};
};