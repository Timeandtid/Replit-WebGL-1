
import {Mesh} from "./Modules/OBJ_Parser.js"
import {EggGL} from "./Modules/EggGL.js"

const egl = new EggGL()

const program = egl.createProgram(

	await fetch("./Shaders/vsh.glsl").then(r => r.text()),
	await fetch("./Shaders/fsh.glsl").then(r => r.text())
)

let rx = 0.2
let ry = -0.5
let down = 0

const aspect = egl.width / egl.height
const matrix = egl.allMatrix(Math.PI * 0.5, aspect, 0.01, 45)

let all = matrix(rx, ry)
let cam = [0.5, -2, -2]

const u_all = egl.uniformSetter(program, "u_all")
const u_cam = egl.uniformSetter(program, "u_cam")

u_all("uniformMatrix4fv", false, all)
u_cam("uniform3fv", cam)

egl.setAttrib(program, "a_position", new Float32Array([

	-1, -1, -1, // x
	-1, -1,  1,
	-1,  1, -1,

	-1,  1,  1,
	-1, -1,  1,
	-1,  1, -1,

	 1, -1, -1,
	 1, -1,  1,
	 1,  1, -1,

	 1,  1,  1,
	 1, -1,  1,
	 1,  1, -1,

	-1, -1, -1, // y
	-1, -1,  1,
	 1, -1, -1,

	 1, -1,  1,
	-1, -1,  1,
	 1, -1, -1,

	-1,  1, -1,
	-1,  1,  1,
	 1,  1, -1,

	 1,  1,  1,
	-1,  1,  1,
	 1,  1, -1,

	-1, -1, -1, // z
	 1, -1, -1,
	-1,  1, -1,

	 1,  1, -1,
	 1, -1, -1,
	-1,  1, -1,

	-1, -1,  1,
	 1, -1,  1,
	-1,  1,  1,

	 1,  1,  1,
	 1, -1,  1,
	-1,  1,  1
]))

egl.setAttrib(program, "a_normal", new Float32Array([

	-1,  0,  0,
	-1,  0,  0,
	-1,  0,  0,

	 1,  0,  0,
	 1,  0,  0,
	 1,  0,  0,
	
	 0, -1,  0,
	 0, -1,  0,
	 0, -1,  0,

	 0,  1,  0,
	 0,  1,  0,
	 0,  1,  0,

	 0,  0, -1,
	 0,  0, -1,
	 0,  0, -1,

	 0,  0,  1,
	 0,  0,  1,
	 0,  0,  1
]))

const scene = () => {
	
	var ms = (new Date).getTime()

	clear()
        
    u_all("uniformMatrix4fv", false, all)
	u_cam("uniform3fv", cam)
	
	//object[0].forEach(i => i())
	
	//console.log((new Date).getTime()-ms)
	
    window.requestAnimationFrame(scene)
}

window.requestAnimationFrame(scene)