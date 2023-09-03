import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Dashboard = (props) => {
  return (
    <div className="App">
      <div className="flex">
        <div className="weight container">
          <div className="dashboard flex">
            <h2>Weight</h2>
            <Link>
              <h2 id="plus">+</h2>
            </Link>
          </div>
        </div>
        <div className="routine container">
          <div className="dashboard flex">
            <h2>Exercise Routines</h2>
            <Link>
              <h2 id="plus">+</h2>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
