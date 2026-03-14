import React from "react";

function ComplaintCard({complaint}){

 return(

  <div className="card">

   <h3>{complaint.category}</h3>

   <p>{complaint.description}</p>

   <p>Status: {complaint.status}</p>

  </div>

 );

}

export default ComplaintCard;