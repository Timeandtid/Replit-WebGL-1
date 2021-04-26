
/* OBJ_Parser.js */

/**
 * @class
 * Parses .obj files into objects
 */
export class Mesh {

	/**
	 * Parses .obj file
	 * @param {string} .obj file
	 */
	constructor(file) {
	
		this.v = []
		this.vn = []
		this.vt = []
		this.f = []
	
		let object = -1
		let group = -1
	
		/**
		 * Creates object
		 * @param {string} name of object
		 */
		const new_object = name => {
	
			object ++
			group = 0
	
			const group_0 = []
			group_0.name = "Group_0"
	
			const this_object = [group_0]
			this_object.name = name
	
			this.f.push(this_object)
		}
	
		/**
		 * Creates group in object
		 * @param {string} name of group
		 */
		const new_group = name => {
	
			group ++
	
			const this_group = []
			this_group.name = name
	
			this.f[object].push(this_group)
		}

		/**
		 * Creates face in group
		 * @param {string} face data
		 */
		const new_face = face => {

			const split = face.map(i => i.split("/"))

			const tris = []

			const v0 = split[0] - 1
			const p0 = this.v[v0]

			// Convert polygon to triangles

			for(let i = 0; ++i < split.length-1;) {

				const v1 = split[i] - 1
				const v2 = split[i + 1] - 1

				// Calculate normals for flat
				// shading and (future) physics

				const p1 = this.v[v1]
				const p2 = this.v[v2]

				const e1 = p1.map((o, p) => o - p0[p])
				const e2 = p2.map((o, p) => o - p0[p])

				// Cross-products aren't normalized
				// so that smooth shading can be
				// calculated properly if need be

				// Normals get normalized in the 
				// fragment shader anyway

				const cp = e1.map((o, p) => {
					
					const tp = (p + 1) % 3
					const np = (p + 2) % 3

					return e1[tp] * e2[np] - e1[np] * e2[tp]
				})

				const tri = [v0, v1, v2]
				tri.normal = e1

				tris.push(tri)
			}

			this.f[object][group].push(...tris)
		}
	
		/**
		 * Sets shading of current group
		 * @param {string} shading setting
		 */
		const set_shading = setting => {
	
			const enable = setting != "off" && setting != "0"
	
			this.f[object][group].smooth = enable
		}

		// Default object

		new_object("Object_0")
	
		// For each valid line...
	
		file.split(/\n+/).forEach(line => {
	
			// Return if useless
		
			if(line.match(/^[#\smu]/)) return
		
			// Get info and identifier
	
			const info = line.trim().split(/\s+/)
			const iden = info.splice(0, 1)[0]
	
			// Add data based on identifier
		
			switch (iden) {
		
				case "o" : new_object(info.join` `); break
			
				case "g" : new_group(info.join` `); break
			
				case "f" : new_face(info); break
			
				case "s" : set_shading(info[0]); break
			
				default : this[iden].push(info)
			}
		})
	
		// Remove empty object/group arrays
	
		const objects = []
	
		this.f.forEach(object => {
		
			const output = object.filter(group => group.length)
			output.name = object.name
		
			if(output.length) objects.push(output)
		})
	
		this.f = objects
	}
}