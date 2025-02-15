import React, { useState, useEffect } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";
import NavbarLoggedIn from "./NavbarLoggedIn";
import NavbarLoggedOut from "./NavbarLoggedOut";
import Dashboard from "./Dashboard";
import Register from "./Register";
import Login from "./Login";
import Root from "./Root";
import ProfilePage from "./ProfilePage";
import ProfileForm from "./ProfileForm";
import Home from "./Home";
import "./App.css";
import Axios from "axios";
import OTPClass from "./OTP";
import ResetPassword from "./ResetPassword";
import WalkthroughModal from "./WalkthroughModal";

function App() {
  const [email, setEmail] = useState("");
  const [OTP, setOTP] = useState(0);
  const [loginStatus, setLoginStatus] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [previousWeight, setPreviousWeight] = useState({});
  const [weightData, setWeightData] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [trackedExercises, setTrackedExercises] = useState({});
  const [routineExercises, setRoutineExercises] = useState({});
  const [openMenus, setOpenMenus] = useState({});
  const [showWalkthroughModal, setShowWalkthroughModal] = useState(false);
  const formattedDate = new Date().toISOString().slice(0, -5);

  const apiURL =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_PROD_API_URL
      : process.env.REACT_APP_DEV_API_URL;

  const convertWeight = (kgs) => {
    const lbs = kgs * 2.20462262185;
    return Number(lbs.toFixed(1));
  };

  const defaultConvertWeight = (lbs) => {
    const kgs = lbs / 2.20462262185;
    return Number(kgs.toFixed(1));
  };

  const defaultConvertHeightMetric = (inches) => {
    const cm = inches / 0.3937008;
    return Number(cm.toFixed(0));
  };

  const safeParseFloat = (str) => {
    try {
      const parsedValue = parseFloat(str);
      const hasMultipleDigitsAfterDecimal = /(\.\d*)\d{2,}/.test(str);
      if (!isNaN(parsedValue) && parsedValue >= 0) {
        if (str.length >= 6 || hasMultipleDigitsAfterDecimal) {
          return parseFloat(str.slice(0, str.length - 1));
        }
        return parsedValue;
      } else {
        throw new Error("Value is not a valid number.");
      }
    } catch (error) {
      return "";
    }
  };

  Axios.defaults.withCredentials = true;

  const RerouteOTP = ({ children }) => {
    if (!email) {
      localStorage.clear();
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  const RerouteHome = ({ children }) => {
    if (localStorage.getItem("authToken")) {
      return <Navigate to="/dashboard" replace />;
    }

    localStorage.clear();
    return children;
  };

  const RerouteDashboard = ({ children }) => {
    if (
      userProfile &&
      userProfile.weight === 0 &&
      userProfile.height === 0 &&
      userProfile.age === 0 &&
      userProfile.activity_level === "" &&
      userProfile.gender === ""
    ) {
      return <Navigate to="/profile" replace />;
    }

    return children;
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        path="/"
        element={
          <Root
            setLoginStatus={setLoginStatus}
            apiURL={apiURL}
            setShowWalkthroughModal={setShowWalkthroughModal}
          />
        }
      >
        <Route
          index
          element={
            <RerouteHome>
              <Home />
            </RerouteHome>
          }
        />
        <Route
          path="register"
          element={
            <Register
              loginStatus={loginStatus}
              setLoginStatus={setLoginStatus}
              apiURL={apiURL}
            />
          }
        />
        <Route
          path="login"
          element={
            <Login
              loginStatus={loginStatus}
              setLoginStatus={setLoginStatus}
              setOTP={setOTP}
              email={email}
              setEmail={setEmail}
              apiURL={apiURL}
            />
          }
        />
        <Route
          path="otp"
          element={
            <RerouteOTP>
              <OTPClass OTP={OTP} email={email} apiURL={apiURL} />
            </RerouteOTP>
          }
        />
        <Route
          path="password-reset"
          element={
            <RerouteOTP>
              <ResetPassword email={email} apiURL={apiURL} />
            </RerouteOTP>
          }
        />
        <Route
          path="dashboard"
          element={
            <RerouteDashboard>
              <Dashboard
                loginStatus={loginStatus}
                userProfile={userProfile}
                previousWeight={previousWeight}
                setPreviousWeight={setPreviousWeight}
                formattedDate={formattedDate}
                routines={routines}
                setRoutines={setRoutines}
                exercises={exercises}
                setExercises={setExercises}
                trackedExercises={trackedExercises}
                setTrackedExercises={setTrackedExercises}
                weightData={weightData}
                setWeightData={setWeightData}
                setUserProfile={setUserProfile}
                convertWeight={convertWeight}
                defaultConvertWeight={defaultConvertWeight}
                safeParseFloat={safeParseFloat}
                openMenus={openMenus}
                setOpenMenus={setOpenMenus}
                routineExercises={routineExercises}
                setRoutineExercises={setRoutineExercises}
                apiURL={apiURL}
              />
            </RerouteDashboard>
          }
        />
        <Route
          path="profile"
          element={
            <ProfilePage
              setUserProfile={setUserProfile}
              userProfile={userProfile}
              defaultConvertWeight={defaultConvertWeight}
              defaultConvertHeightMetric={defaultConvertHeightMetric}
            />
          }
        />
        <Route
          path="profile-form"
          element={
            <ProfileForm
              loginStatus={loginStatus}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              previousWeight={previousWeight}
              setPreviousWeight={setPreviousWeight}
              formattedDate={formattedDate}
              setWeightData={setWeightData}
              weightData={weightData}
              convertWeight={convertWeight}
              defaultConvertWeight={defaultConvertWeight}
              safeParseFloat={safeParseFloat}
              defaultConvertHeightMetric={defaultConvertHeightMetric}
              apiURL={apiURL}
            />
          }
        />
        <Route path="logout" apiURL={apiURL} />
      </Route>
    )
  );

  useEffect(() => {
    Axios.get(`${apiURL}/login`)
      .then((response) => {
        if (response.data.loggedIn === true) {
          setLoginStatus(response.data.user);
        } else {
          localStorage.clear();
          setLoginStatus("");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [setLoginStatus, apiURL]);

  useEffect(() => {
    if (!loginStatus) {
      // Reset states when there's no login
      setUserProfile(null);
      setRoutines([]);
      setExercises([]);
      setTrackedExercises({});
      setPreviousWeight({});
      setWeightData([]);
      return;
    }

    // Helper function for error handling
    const handleError = (error, message) => {
      console.error(message, error);
    };

    const fetchData = async () => {
      try {
        // Run multiple API calls concurrently
        const [
          routinesResponse,
          trackedExercisesResponse,
          exerciseOrderResponse,
          exercisesResponse,
          profileResponse,
          weightResponse,
        ] = await Promise.all([
          Axios.get(`${apiURL}/get/routines/${loginStatus.id}`),
          Axios.get(`${apiURL}/get/tracked-exercises/${loginStatus.id}`),
          Axios.get(`${apiURL}/get/tracked-exercise-order/${loginStatus.id}`),
          Axios.get(`${apiURL}/get/exercises/${loginStatus.id}`),
          Axios.get(`${apiURL}/get/profile/${loginStatus.id}`),
          Axios.get(`${apiURL}/get/weight/${loginStatus.id}`),
        ]);

        // Handle routines
        if (routinesResponse.data.length > 0) {
          setRoutines(routinesResponse.data);
        }

        // Handle tracked exercises and order
        if (trackedExercisesResponse.data.length > 0) {
          const groupedExercises = trackedExercisesResponse.data.reduce(
            (acc, exercise) => {
              const exerciseName = exercise.name;
              if (!acc[exerciseName]) acc[exerciseName] = [];
              acc[exerciseName].push(exercise);
              return acc;
            },
            {}
          );

          if (exerciseOrderResponse.data.length > 0) {
            groupedExercises["sortOrder"] = exerciseOrderResponse.data;
          }

          setTrackedExercises(groupedExercises);
        }

        // Handle exercises
        if (exercisesResponse.data.length > 0) {
          setExercises(exercisesResponse.data);
        }

        // Handle profile
        if (profileResponse.data) {
          setUserProfile(profileResponse.data);
        } else {
          const newProfile = {
            weight: 0,
            height: 0,
            age: 0,
            activityLevel: "",
            gender: "",
            measurementType: "imperial",
            weightGoal: 0,
            targetWeight: 0,
          };

          await Axios.post(`${apiURL}/insert/profile`, {
            userId: loginStatus.id,
            ...newProfile,
          });

          const updatedProfile = await Axios.get(
            `${apiURL}/get/profile/${loginStatus.id}`
          );
          setUserProfile(updatedProfile.data);
        }

        // Handle weight data
        if (weightResponse.data.length > 0) {
          const latestWeight =
            weightResponse.data[weightResponse.data.length - 1];
          setPreviousWeight(latestWeight);

          if (userProfile?.measurement_type !== "imperial") {
            const convertedWeightData = weightResponse.data.map((item) => ({
              ...item,
              weight: defaultConvertWeight(item.weight),
            }));
            setWeightData(convertedWeightData);
          } else {
            setWeightData(weightResponse.data);
          }
        }
      } catch (error) {
        handleError(error, "Error fetching data");
      }
    };

    fetchData();
  }, [loginStatus, apiURL, userProfile?.measurement_type]);

  return (
    <div className="App">
      <RouterProvider router={router}>
        {localStorage.getItem("authToken") ? (
          <NavbarLoggedIn />
        ) : (
          <NavbarLoggedOut />
        )}
      </RouterProvider>

      {showWalkthroughModal && (
        <WalkthroughModal
          onClose={() => {
            setShowWalkthroughModal(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
