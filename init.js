
// Setup

gl.clearColor(0, 0, 0, 1)
    
gl.enable(gl.DEPTH_TEST)
    
gl.depthFunc(gl.LEQUAL)
    
gl.enable(gl.CULL_FACE)

const program = createProgram(vsh, fsh)

gl.useProgram(program)

// Uniforms

const l_all = gl.getUniformLocation(program, "u_all")
const l_cam = gl.getUniformLocation(program, "u_cam")

// Interaction

let rx = 0.2
let ry = -0.5
let down = 0

const aspect = canvas.width / canvas.height
const matrix = allMatrix(Math.PI * 0.5, aspect, 0.01, 45)
let all = matrix(rx, ry)
let cam = [0.5, -2, -2]

canvas.addEventListener("mousemove", e => {

    if(down) {
        rx += e.movementX / 100
        ry -= e.movementY / 100
		
        all = matrix(rx, ry)
    }
})
canvas.addEventListener("mousedown", () => down = 1)
canvas.addEventListener("mouseup", () => down = 0)
canvas.addEventListener("mouseout", () => down = 0)

// Object

const object = construct(program, parse(obj), {

	scale : 1
})