import Notes from "../models/NotesModel.js"

// GET (Mengambil Data)
async function getNotes(req, res){
    try {

        const result = await Notes.findAll()
        res.status(200).json(result)
    } catch (error) {
        console.log(error.message)
    }
    
}
 
// POST
async function createNotes(req, res) {
    try {
      const inputResult = req.body;
      const newNotes = await Notes.create(inputResult);
      res.status(201).json(newNotes);
    } catch (error) {
      console.log(error.message)
    }
  }
  
  // PUT/PATCH
  async function updateNotes(req, res) {
    try {
      const {id} = req.params;
      const updateInput = req.body;
      const notes = await Notes.findByPk(id);
  
      if (!notes){
        return res.status(404).json({message: "Notes not found"});
      }
  
      await Notes.update(updateInput, { where: {id} });
      res.status(200).json({message: "Notes update successfully"});
    } catch (error) {
      console.log(error.message)
    }
  }
  // DELETE
  async function deleteNotes(req, res){
    try {
      const {id} = req.params;
      const notes = await Notes.findByPk(id);
  
      if (!notes){
        return res.status(404).json({message: "Notes not found"});
      }
  
      await Notes.destroy({ where: {id} });
      res.status(200).json({message: "Notes deleted successfully"});
    } catch (error) {
      console.log(error.message)
    }
  }

export {getNotes, createNotes, updateNotes, deleteNotes};