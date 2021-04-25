 
const canvas = document.getElementById("canvas")
 
canvas.width = window.innerWidth
canvas.height = window.innerHeight
 
const gl = canvas.getContext("webgl2", {antialias : false})
 
/**
* Creates a program given the code of the vertex shader and fragment shader.
* @param {string} vcode - Vertex shader code
* @param {string} fcode - Fragment shader code
*/
createProgram = (vcode, fcode) => {
  
    createShader = (type, code) => {
      
        const shader = gl.createShader(type)
      
        gl.shaderSource(shader, code)
        gl.compileShader(shader)
      
        return shader
    }
  
    const vshader = createShader(gl.VERTEX_SHADER, vcode)
    const fshader = createShader(gl.FRAGMENT_SHADER,fcode)
  
    const program = gl.createProgram()
  
    gl.attachShader(program, vshader)
    gl.attachShader(program, fshader)
 
    gl.linkProgram(program)
 
    gl.detachShader(program, vshader)
    gl.deleteShader(vshader)
 
    gl.detachShader(program, fshader)
    gl.deleteShader(fshader)
 
    return program
}
 
/**
* Set attributes of 1 or more program.
* @param {program} program - gl program
* @param {string} name - Name of attribute
* @param {array} array - List containing attribute data
* @param {int} count - increment (Default: 3)
* @param {buffer} btype - buffer (Element/Array, Default : gl.ARRAY_BUFFER)
* @param {gl data type} dtype - data type of data (Defailt: gl.FLOAT)
*/
setAttrib = (program, name, array, count, btype, dtype) => {
 
    const buffer = gl.createBuffer()
 
    btype ||= gl.ARRAY_BUFFER
    dtype ||= gl.FLOAT
    count ||= 3
 
    program = [].concat(program)
 
    gl.bindBuffer(btype, buffer)
    gl.bufferData(btype, array, gl.STATIC_DRAW)
 
    program.forEach(i => {
 
        const loc = gl.getAttribLocation(i, name)
 
        gl.enableVertexAttribArray(loc)
        gl.vertexAttribPointer(loc, count, dtype, false, 0, 0)
    })
}
 
/**
* Returns a function that produces a pre-multiplied rotation and perspective matrix.
* @param {float} fov - Field of view of viewport
* @param {float} aspect - Aspect ratio of viewport
* @param {float} near - Near plane of viewport
* @param {float} far - Far plane of viewport
*/
allMatrix = (fov, aspect, near, far) => {
 
    const ir = 1 / (near - far)
    const f1 = 1 / Math.tan(fov * 0.5)
    const f2 = f1 / aspect
    const nf = (near + far) * ir
    const nf2 = 2 * near * far * ir
    
    return (rx, ry) => {
  
        const cx = Math.cos(ry)
        const sx = Math.sin(ry)
 
        const cy = Math.cos(rx)
        const sy = Math.sin(rx)
 
        /**
     	* Returns a pre-multiplied rotation and perspective matrix
     	* @param {float} rx - Rotation about the x-axis
     	* @param {float} ry - Rotation about the y-axis
     	*/
        return [
 
            cy * f2, -sy * sx * f1, -sy * cx * nf,  sy * cx,
            0,        cx * f1,      -sx * nf,       sx,
            sy * f2,  sx * cy * f1,  cx * cy * nf, -cx * cy,
            0,        0,             nf2,           0,
        ]
    }
}
 
/**
* Returns texture.
* @param {array} data - Pixel data of texture
* @param {int} width - width of texture
* @param {int} height - height of texture
* @param {gl color format} type - Color format of texture (Default: gl.RGB)
* @param {gl data type} dtype - data type of data (Default: gl.UNSIGNED_BYTE)
* @param {gl color format} itype - Internal color format of texture (Default: gl.RGB)
*/
createTex = (data, width, height, type, dtype, itype) => {
    
    dtype ||= gl.UNSIGNED_BYTE
    type ||= gl.RGB
    itype ||= type
    
    const tex = gl.createTexture()
 
    gl.bindTexture(gl.TEXTURE_2D, tex)
 
    gl.texImage2D(gl.TEXTURE_2D, 0, itype, width, height, 0, type, dtype, data)
 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    
    return tex
}
 

