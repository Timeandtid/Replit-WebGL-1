
(function scene() {
	
	var ms = (new Date).getTime()

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        
    gl.uniformMatrix4fv(l_all, false, all)
    gl.uniform3fv(l_cam, cam)
	
	object[0].forEach(i => i())
	
	//console.log((new Date).getTime()-ms)
	
    window.requestAnimationFrame(scene)
})()