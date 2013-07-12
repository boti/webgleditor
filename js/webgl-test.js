var TestGlApp = TestGlApp || function(){
	var application = null;
	var scene = null;
	return {
		
		Init : function(){
			application = new GlApp();	
			var scene = application.addScene('glCanvas');
			//scene.setBgColor(1,0.5,-.5,1.0);
			var testObj = new GlObject();
			var vertices =  [
				-0.5,0.5,0.0, 	//Vertex 0
				-0.5,-0.5,0.0, 	//Vertex 1
				0.5,-0.5,0.0, 	//Vertex 2
				0.5,0.5,0.0]; 	//Vertex 3
		
			var indices = [3,2,1,3,1,0];
			
			scene.addObject(testObj);
			testObj.setData(vertices, indices); 
			//debugger;
			application.render();
		}
	};
}();

