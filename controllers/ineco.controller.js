/**
 * This file contains the controller functions related to student operations.
 * Currently, it includes a function to retrieve all students from the database.
 *
 * Add more functions here to handle other student-related operations (e.g., create, update, delete).
 */
import pool from "../config/db.js";
import { logger } from "../utils/index.js";

export const getAllStudents = async (req, res) => {
  try {
    const students = await pool.query("SELECT * FROM students");
    res.status(200).json({
      success: true,
      count: students.rows.length,
      data: students.rows,
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({
      success: false,
      message: `An unexpected error occurred in GET/STUDENTS, ${err?.message}`,
    });
  }
};


 export const getStudent = async (req, res) =>{
  const id = req.params.id
  const fetchId = 'select * from students WHERE id = $1'
try {
  const result = await pool.query(fetchId, [id]);
  
  if(result.rows.length===0){
    return res.status(404).json({success:false,message:`the student with this id ${id} is not found`});
  }
  res.status(200).json(result.rows)
} catch (error) {
  console.error('database error',error)
  res.status(500).send('failed to fetch student')
}
 }

//  EXPORTING FIELDS

export const updateStudent= async(req,res)=>{
  try {
    const {id}=req.params;
    const {first_name,last_name,student_id,email,date_of_birth,contact_number,enrollment_date,profile_picture}=req.body;
      
     
    const updateStudent= `UPDATE students SET first_name='${first_name}',last_name ='${last_name}',
    student_id = '${student_id}',email ='${email}',date_of_birth ='${date_of_birth}',contact_number ='${contact_number}',
    enrollment_date ='${enrollment_date}',profile_picture ='${profile_picture}' WHERE id= ${id}`
    const updatedstudent= await pool.query(updateStudent);

    if(updatedstudent.rowCount === 0){
      return res.status(400).json({
        success:false,
        message:"The new student was not recorded"
      })
    }
    res.status(200).json({
      success:true,
      message:"the students data was updated successfully",
      data:updatedstudent.rows[0]
    })
  } catch (err) {
    res.status(500).json({
      success:false,
      message:`An error happened,${err?.message}`
    })
  }
}
export const deleteStudent = async (req, res) => {
  try {
              const {id} = req.params;

          

            if(isNaN(id)){
              return res.status(404).json({
                MessageStatus:false,
                message:`the id ${id} is invalid`
              })
            };

            const checkquery = "SELECT * FROM students WHERE id = $1";
            const checking = await pool.query(checkquery,[id]);
            if(checking.rows.length===0){
             return res.status(404).json({
                MessageStatus:false,
                message:`the student with this id ${id} not found`});
            }
          
            const deleteqry = "DELETE FROM students WHERE id = $1";
            await pool.query(deleteqry,[id]);
            res.status(200).json({
              MessageStatus:true,
              message:`Deleting a student is done successfully.`
            })
              
  } catch (err) {

          logger.error(err.message);
          res.status(500).json({
            MessageStatus: false,
            message: `Server error occurred. Unable to delete a student, ${err.message}`,
          });
  }
  
};


export const searchbyname =  async(req,res) =>{
 try {
   const{name} = req.query;
  const students =  await pool.query(`SELECT * FROM students WHERE CONCAT(first_name,last_name) ILIKE $1 ORDER BY first_name`,[`%${name.trim()}%`]);
  if(students.rowCount===0){
    return res.status(404).json({message:`no data related to ${name} found`});
  }

  res.status(200).json(students.rows);
 
  
 } catch (error) {
  logger.error(error.message);
  res.status(500).json({
    MessageStatus: false,
    message: `Server error occurred. Unable to search a student, ${error.message}`,
  });
 }

}

