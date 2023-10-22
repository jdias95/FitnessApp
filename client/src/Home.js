import React, { useEffect } from "react";
import Axios from "axios";

export default function Home(props) {
  const { loginStatus, setLoginStatus } = props;
  useEffect(() => {
    if (loginStatus) {
      Axios.delete("http://localhost:3001/api/logout").then((response) => {
        if (response.status === 200) {
          setLoginStatus("");
          localStorage.clear();
        }
      });
    }
  }, [setLoginStatus]);

  return (
    <div className="App home-container">
      <div className="background-container">
        <div className="home">
          <h1 id="quote">
            "It is a shame for a man to grow old without seeing the beauty and
            strength of which his body is capable."
          </h1>
          <h1 id="socrates">- Socrates</h1>
        </div>
      </div>
    </div>
  );
}
