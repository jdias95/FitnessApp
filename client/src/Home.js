import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home(props) {
  const { loginStatus } = props;
  const navigate = useNavigate();

  useEffect(() => {
    if (loginStatus) {
      navigate("/dashboard");
    }
  }, [navigate, loginStatus]);

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
