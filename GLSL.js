
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

	gl_Position = u_all*vec4(a_position+u_cam, 1.);

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

const vec3 light_source = vec3(70., 80., 200.);
const vec3 diffuse_color = vec3(0.5, 0.5, 0.5);

const float spec_power = 32.;
const float spec_intensity = 1.;

void main() {

	vec3 normal = normalize(v_normal);

	vec3 incident = -normalize(v_position+v_cam);
	vec3 light = -normalize(v_position+light_source);
	vec3 reflected = reflect(light, normal);

	float diffuse = dot(normal, incident);
	float ambient = 0.31830988618;

	float rndot = max(dot(reflected, normal), 0.);
	float specular = pow(rndot,spec_power)*spec_intensity;

	color = vec4(diffuse_color*(diffuse+specular+ambient), 1.);
}
`.trim()