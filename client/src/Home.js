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
      <h1> Home </h1>
    </div>
  );
}
