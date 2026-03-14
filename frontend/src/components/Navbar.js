import React from "react";
import "../styles/main.css";

function Navbar(){

 return(
  <nav className="navbar">

   <h2>Smart City Admin</h2>

   <div>
    <a href="/">Home</a>
    <a href="/submit">Submit</a>
    <a href="/track">Track</a>
   </div>

  </nav>
 );

}

export default Navbar;