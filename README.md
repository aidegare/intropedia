TODO list:
- [x] use low complexity models
- [x] try geometry nodes instances
- [x] realize instances !!
- [x] delete *blue* hidden faces, e.g. faces pointing down if camera is locked (red will not show anyways)
- [x] check normals with Face Orientation (Alt+N to flip)
procedural materials (**does not apply to this project**):
visualize everything in solid view using "Texture" option to see grid texture
    - [ ] create new UV map for baking -> **higlight it when creating all the seams**
    - [ ] UV unwrap with min. seams possible -> think of everything as a cube, cylinder/ring
    - [ ] turn on UV stretch in overlays to see and minimize stretch (distortion/stretch is fine for uniform colors)
    - [ ] try smart UV project 
objects having similar geometries can copy UV maps from the well unwrapped one (e.g. subdivided geometry)

    - [ ] create image texture (4K, full white, no alpha if nothing transparent, 32-bit float) and save as Radiance HDR
    - [ ] ...
- [x] adapt image textures on UV map, not in nodes 
- [x] duplicate models with modifiers and hide them in other collection (allows for tweaks later on in .blend file)
- [x] apply all modifiers before exporting, (F3 -> convert to mesh)  
- [x] join all non interacting meshes (saves GPU power)
- [x] export as glb (selected objects, data -> mesh -> UV + Normals and create WebP for images)

creating web page:
- [x] open folder, run in terminal "npm create vite@latest" or any newer command
- [x] setup name, framework and variants, then run "cd your_name", "npm install three", "npm run dev" (last command is to get website, so run every opening)
- [x]  