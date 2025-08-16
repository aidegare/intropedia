## TODO list:

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
- [x] setup name, framework and variants, then run "cd your_name", "npm install three", "npm run dev" (last command is to get website, so run every subsequent opening)
- [x] setup three.js: import css file and three, add canvas in HTML file using .experience>canvas#your_name, and in js file add scene, camera and renderer
- [x] in css file, general format with *{m0,p0, border-sizing: border-box}
- [x] load object, if too heavy for github use glTF report to compress and import relevant loader for GLTFLOADER
    - when importing relevant loader, copy paste from /nodemodules/libs in own folder (is easier)

- [x] handle the resizing of the web window and set the animate() function
- [x] enable shadow map in renderer and cast shadows from light, tell loader if child is a mesh, then cast shadows
- [x] tweak as wanted: shadow map size and type, tone mapping style and exposure


- [x] interact with mouse button using raycaster, only on specific objects in array
    - [ ] project panels redirect to project websites
    - [x] trees do funsies
    - [x] door opens
    - [ ] directions pop information panel 
    - [ ] what is modal in HTML ?

- [x] make character move using arrow and wasd keys, but also not racistly (event.code instead of event.key)
- [x] make camera follow character from relevant angle
- [x] animate with GSAP
    - [x] fix rotation 
    *- [ ] add collisions*
    - [x] add respawn
        - [x] create spawn position for character
    *- [ ] add ultimate*
    

- [ ] change scene:
    - [x] make paths more visible
    ~~- [ ] add doors~~
    - [x] add door
    - [x] rocks consistent with designs
    - [x] restore tree geometry

- [x] add collisions
    - [x] add 'bounding boxes' for models in Blender, refer to start of checklist !
    - [x] translate animations with GSAP to custom (mainly works if everything is at same height)
    - [x] create Octree and gravity system
    - [x] make collider-named child the octree collider and hide visibility
    - [x] create capsule for character hitbox
    - [x] check if collider and capsule intersect, if normal of the result > 0 then player is on floor and block character
    - [x] update player stats
        - [x] add gravity
        - [x] move player according to new specs
        - [x] make rotation make sense
        - [x] add update in animate()

- [x] handle simultaneous key presses
    - [x] add 'wee' movement

future ideas:
- [ ] add quantum tarot (ideas: https://www.joedoucet.com/index/#/iota/ ; https://www.youtube.com/watch?v=Ru7SeyI8E4Y )
- [ ] web-like structures for quantum info knowledge since main interest
- [ ] electromag, SR and GR could be islands on water, with waves passing by and all 



