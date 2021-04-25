 
/**
* Parses .obj files. Returns data as following:
* v  - Vertex positions
* vt - Texture coordinates
* vn - Vertex normals
* f  - Arrays containing object, group and index data. Objects contain groups, which contain indices.
* @param {string} file - Obj file
*/
parse = file => {
  
    let object = -1
    let group = -1
  
    const data = {
      
        "v"  : [],
        "vt" : [],
        "vn" : [],
        "f"  : []
    };
  
    // Create new object
 
    (new_object = name => {
 
        object ++
        group = 0
 
        const group_0 = []
        group_0.name = "Group_0"
 
        const this_object = [group_0]
        this_object.name = name
 
        data.f.push(this_object)
    })("Object_0")
 
    // Create new group
 
    new_group = name => {
 
        group ++
 
        const this_group = []
        this_group.name = name
 
        data.f[object].push(this_group)
    }
 
    // Set shading for current group
 
    set_shading = setting => {
 
        const enable = setting != "off" && setting != "0"
 
        data.f[object][group].smooth = enable
    }
 
    // For each line...
  
    file.split("\n").forEach(line => {
      
        const char0 = line[0]
 
        // Return if useless
      
        if(char0 == "#" ||
            char0 == " " ||
          
            char0 == "u" ||
            char0 == "m" ||
          
            !line) return
      
        // Get info and identifier
 
        const info = line.trim().split(/\s+/g)
        const iden = info.splice(0, 1)[0]
 
        // Add data based on identifier
      
        switch (iden) {
      
            case "o" : new_object(info.join` `); break
          
            case "g" : new_group(info.join` `); break
          
            case "s" : set_shading(info[0]); break
          
            case "f" : data.f[object][group].push(info); break
          
            default : data[iden].push(info)
        }
    })
 
    // Remove empty object/group arrays
  
    const objects = []
  
    data.f.forEach(object => {
      
        const output = object.filter(group => group.length)
        output.name = object.name
      
        if(output.length) objects.push(output)
    })
  
    data.f = objects
  
    return data
}
 
/**
* Constructs a VAO using data from parser.
* @param {program} program - gl program
* @param {keyed list} data - Data from parser
* @param {keyed list} config - Transforms
*/
construct = (program, data, config) => {
 
    let normcoeff = 1
 
    if(config) {
 
        const scale = config.scale
        const xyz = config.xyz
        const flip_face = config.flip_face
        const flip_normal = config.flip_normal
 
        // Scale model
 
        if(scale) {                  
 
            const scaler = scale.length ? scale : Array(3).fill(scale)
 
            data.v = data.v.map(i => i.map((o, p) => o *= scaler[p]))
        }
 
        // Switch x, y and z's
 
        if(xyz) {                    
 
            data.v = data.v.map(i => {
 
                const rearr = []
                const order = "xyz"
 
                i.forEach((o, p) => {
 
                    rearr[order.indexOf(xyz[p])] = o
                })
 
                return rearr
            })
        }
 
        // Flip faces inside-out
 
        if(flip_face) {              
 
            data.f = data.f.map(i => {
                
                const oname = i.name
                const ooutput = i.map(o => {
 
                    const gname = o.name
                    const gsmooth = o.smooth
                    const goutput = o.map(p => p.reverse())
 
                    goutput.name = gname
                    goutput.smooth = gsmooth
 
                    return goutput
                })
 
                ooutput.name = oname
 
                return ooutput
            })
        }
 
        // Flip normals
 
        if(flip_normal) {            
 
            normcoeff = -1
 
            data.vn = data.vn.map(i => i.map(o => -o))
        }
    }
    
    // Convert keyed list to ordered list
 
    const ordered = [
 
        data.v,
        data.vt,
        data.vn
    ]
 
    // For each object...
 
    return data.f.map(i => {         
 
        // For each group...
 
        return i.map(o => {          
            
            const gdata = [
                
                [],
                [],
                []
            ]
 
            let ix = []
 
            // For each polygon...
 
            o.forEach(p => {         
 
                const pl = p.length
                const v0 = p[0]
                const t = Array(pl - 2)
 
                // Convert polygons into triangles
 
                for(let n = 1; n < pl - 1; n ++) {
 
            	    t[n-1] = [v0, p[n], p[n + 1]]
                }
 
                // For each triangle...
      
                t.forEach(j => {     
 
                    // For each vertex...
                    
                    j.forEach(k => { 
                        
                        // Add vertex data to associated list
                        // in final array
                        
                        k.split("/").forEach((p, l) => {
                            
                            gdata[l].push(...ordered[l][p - 1])
                        })
                    })
                })
 
                ix.push(...t)
            })
 
            let v = gdata[0]
            const len = v.length
            const tlen = len / 3
 
            // Default values
 
            gdata[1] = gdata[1].length ? gdata[1] : Array(tlen * 2).fill(0)
            gdata[2] = gdata[2].length ? gdata[2] : (() => {
 
                // If normals array is empty, calculate
                // normals
 
                const nv = []
 
                if(o.smooth) {
 
                    // Extract vertex position data from
                    // index data recorded previously
 
                    ix = ix.map(w => w.map(b => {
 
                        return [].concat(b.split("/"))[0]
                    }))
 
                    // If group has smoothing enabled
                    // Calculate for smooth normals
 
                    let nn = []
 
                    ix.forEach(b => {
 
                        const b0 = b[0] - 1
                        const b1 = b[1] - 1
                        const b2 = b[2] - 1
                        
                        const p0 = data.v[b0]
                        const p1 = data.v[b1]
                        const p2 = data.v[b2]
 
                        const p0x = p0[0]
                        const p0y = p0[1]
                        const p0z = p0[2]
 
                        const lex = p1[0] - p0x
                        const ley = p1[1] - p0y
                        const lez = p1[2] - p0z
 
                        const nex = p2[0] - p0x
                        const ney = p2[1] - p0y
                        const nez = p2[2] - p0z
 
                        const cpx = ley * nez - lez * ney
                        const cpy = lez * nex - lex * nez
                        const cpz = lex * ney - ley * nex
 
                        nn[b0] ||= [0, 0, 0]
                        nn[b1] ||= [0, 0, 0]
                        nn[b2] ||= [0, 0, 0]
 
                        const nn0 = nn[b0]
                        const nn1 = nn[b1]
                        const nn2 = nn[b2]
 
                        nn0[0] += cpx
                        nn0[1] += cpy
                        nn0[2] += cpz
 
                        nn1[0] += cpx
                        nn1[1] += cpy
                        nn1[2] += cpz
 
                        nn2[0] += cpx
                        nn2[1] += cpy
                        nn2[2] += cpz
                    })
 
                    nn = nn.map(k => {
 
                        if(!k) return
 
                        const kx = k[0]
                        const ky = k[1]
                        const kz = k[2]
 
                        const h = normcoeff / Math.sqrt(kx * kx + ky * ky + kz * kz)
 
                        return [
 
                            kx * h,
                            ky * h,
                            kz * h
                        ]
                    })
 
                    ix.forEach(b => {
 
                        const b0 = b[0] - 1
                        const b1 = b[1] - 1
                        const b2 = b[2] - 1
 
                        const nn0 = nn[b0]
                        const nn1 = nn[b1]
                        const nn2 = nn[b2]
 
                        nv.push(
 
                            nn0[0], nn0[1], nn0[2],
                            nn1[0], nn1[1], nn1[2],
                            nn2[0], nn2[1], nn2[2]
                        )
                    })
                }else{
 
                    // If no smoothing, calculate normal
                    // For each face
 
                    for(let n = 0; n < len; n += 9) {
                        
                        const p0x = v[n]
                        const p0y = v[n + 1]
                        const p0z = v[n + 2]
                        
                        const lex = v[n + 3] - p0x
                        const ley = v[n + 4] - p0y
                        const lez = v[n + 5] - p0z
                        
                        const nex = v[n + 6] - p0x
                        const ney = v[n + 7] - p0y
                        const nez = v[n + 8] - p0z
                        
                        let cpx = ley * nez - lez * ney
                        let cpy = lez * nex - lex * nez
                        let cpz = lex * ney - ley * nex
                        
                        const h = normcoeff / Math.sqrt(cpx * cpx + cpy * cpy + cpz * cpz)
                        
                        cpx *= h
                        cpy *= h
                        cpz *= h
                        
                        nv.push(
                            
                            cpx, cpy, cpz,
                            cpx, cpy, cpz,
                            cpx, cpy, cpz
                        )
                    }
                }
 
                return nv
            })()
 
            // Create and bind vertex array object
            
            const vao = gl.createVertexArray()
            gl.bindVertexArray(vao)
            
            // Set attributes
            
            setAttrib(program, "a_position", new Float32Array(v))
            setAttrib(program, "a_texcoord", new Float32Array(gdata[1]), 2)
            setAttrib(program, "a_normal", new Float32Array(gdata[2]))
            
            // Unbind for safety
            
            gl.bindVertexArray(null)
            
            return () => {
                
                // Draw function
                
                gl.bindVertexArray(vao)
                gl.drawArrays(gl.TRIANGLES, 0, tlen)
                gl.bindVertexArray(null)
            }
        })
    })
}

