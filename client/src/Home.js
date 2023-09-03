import React, { useEffect } from "react";
import Axios from "axios";

export default function Home(props) {
  useEffect(() => {
    Axios.delete("http://localhost:3001/api/logout").then((response) => {
      if (response.status === 200) {
        props.setLoginStatus("");
        localStorage.clear();
      }
    });
  }, [props]);

  return (
    <div className="App">
      <h1> Home </h1>
    </div>
  );
}
