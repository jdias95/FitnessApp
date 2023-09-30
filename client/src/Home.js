import React, { useEffect } from "react";
import Axios from "axios";

export default function Home(props) {
  const { setLoginStatus } = props;
  useEffect(() => {
    Axios.delete("http://localhost:3001/api/logout").then((response) => {
      if (response.status === 200) {
        setLoginStatus("");
        localStorage.clear();
      }
    });
  }, [setLoginStatus]);

  return (
    <div className="App">
      <div className="home container">
        <h1 id="goals">Set Goals</h1>
        <img
          className="img"
          id="dumbbell"
          src={process.env.PUBLIC_URL + "/dumbbell.png"}
          alt="dumbbell"
        />
        <h1 id="progress">Track Progress</h1>
      </div>
    </div>
  );
}
