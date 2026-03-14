import React,{useState} from "react";
import API from "../services/api";

function SubmitComplaint(){

 const [description,setDescription]=useState("");

 const submit=async()=>{

  await API.post("/complaints/submit",{

   description,
   category:"Garbage",
   citizen:"USERID"

  });

  alert("Complaint submitted");

 };

 return(

  <div className="form">

   <h2>Submit Complaint</h2>

   <textarea
   onChange={e=>setDescription(e.target.value)}
   />

   <button onClick={submit}>
   Submit
   </button>

  </div>

 );

}

export default SubmitComplaint;