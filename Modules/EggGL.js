
/* EggGL.js */

export class EggGL {

	constructor(name, config) {

		name ||= "canvas"
		config ||= {}

		config.width ||= window.innerWidth
		config.height ||= window.innerHeight

		config.color ||= [0, 0, 0, 1]
		config.gl ||= {antialias : false}

		this.canvas = document.createElement(name)

		this.canvas.width = config.width
		this.canvas.height = config.width

		this.width = config.width
		this.height = config.height

        this.canvas.style.position = "absolute"
        this.canvas.style.left = "0px"
        this.canvas.style.top = "0px"

        document.body.append(this.canvas)

		this.gl = this.canvas.getContext("webgl2", config.gl)
		
		this.gl.clearColor(...config.color)

		this.gl.enable(this.gl.DEPTH_TEST)

		this.gl.enable(this.gl.CULL_FACE)

		this.gl.depthFunc(this.gl.LEQUAL)

		this.gl.clear(this.gl.COLOR_BUFFER_BIT)
	}

	createProgram(vcode, fcode) {

		const createShader = (type, code) => {
		
			const shader = this.gl.createShader(type)
		
			this.gl.shaderSource(shader, code)
			this.gl.compileShader(shader)
		
			return shader
		}

		const vshader = createShader(this.gl.VERTEX_SHADER, vcode)
		const fshader = createShader(this.gl.FRAGMENT_SHADER,fcode)
	
		const program = this.gl.createProgram()
	
		this.gl.attachShader(program, vshader)
		this.gl.attachShader(program, fshader)
	
		this.gl.linkProgram(program)
	
		this.gl.detachShader(program, vshader)
		this.gl.deleteShader(vshader)
	
		this.gl.detachShader(program, fshader)
		this.gl.deleteShader(fshader)
	
		return program
	}

	setAttrib(program, name, array, count, btype, dtype) {

		const buffer = this.gl.createBuffer()

		btype = this.gl[btype || "ARRAY_BUFFER"]
    	dtype = this.gl[dtype || "FLOAT"]
    	count ||= 3
 
    	program = [].concat(program)
 
    	this.gl.bindBuffer(btype, buffer)
    	this.gl.bufferData(btype, array, this.gl.STATIC_DRAW)
 
		program.forEach(i => {
	
			const loc = this.gl.getAttribLocation(i, name)
	
			this.gl.enableVertexAttribArray(loc)
			this.gl.vertexAttribPointer(loc, count, dtype, false, 0, 0)
		})
	}

	uniformSetter(program, name) {

		const loc = this.gl.getUniformLocation(program, name)

		return (type, arg0, arg1) => {
			
			this.gl[type](loc, arg0, arg1)
		}
	}

	allMatrix(fov, aspect, near, far) {
	
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

			return [
	
				cy * f2, -sy * sx * f1, -sy * cx * nf,  sy * cx,
				0,        cx * f1,      -sx * nf,       sx,
				sy * f2,  sx * cy * f1,  cx * cy * nf, -cx * cy,
				0,        0,             nf2,           0,
			]
		}
	}

	clear() {

		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
	}

	createVao(program, attribs) {

		const vao = this.gl.createVertexArray()
		this.gl.bind(vao)

		for(const attrib in attribs) {

			setAttrib(program, attrib, ...attribs[attrib])
		}

		
	}
}