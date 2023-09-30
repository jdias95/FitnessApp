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
        <h1 id="goals">
          "It is a shame for a man to grow old without seeing the beauty and
          strength of which his body is capable."
        </h1>
        <h1 id="socrates">- Socrates</h1>
      </div>
    </div>
  );
}
