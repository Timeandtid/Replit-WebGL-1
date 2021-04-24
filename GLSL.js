
const vsh = `
#version 300 es

in vec3 a_position;
in vec3 a_normal;

uniform mat4 u_all;
uniform vec3 u_cam;

out vec3 v_position;
out vec3 v_normal;
out vec3 v_cam;

void main() {

	gl_Position = u_all*vec4(a_position+u_cam,1.);

	v_position = a_position;
	v_normal = a_normal;
	v_cam = u_cam;
}
`.trim()

const fsh = `
#version 300 es
    
precision lowp float;

in vec3 v_position;
in vec3 v_normal;
in vec3 v_cam;

out vec4 color;

void main() {

	float light = dot(v_normal,-normalize(v_position+v_cam+vec3(9.,-6.,1.)));

	color = vec4(vec3(light*0.5+0.5),1.);
}
`.trim()