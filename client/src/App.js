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

  const fetchLoginStatus = async (apiURL, setLoginStatus) => {
    try {
      const response = await Axios.get(`${apiURL}/login`);
      if (response.data.loggedIn) {
        setLoginStatus(response.data.user);
      } else {
        localStorage.clear();
        setLoginStatus("");
      }
    } catch (error) {
      console.error("Error fetching login status:", error);
    }
  };

  const fetchUserData = async (
    apiURL,
    loginStatus,
    setUserProfile,
    setRoutines,
    setExercises,
    setTrackedExercises
  ) => {
    if (!loginStatus) {
      setUserProfile(null);
      setRoutines([]);
      setExercises([]);
      setTrackedExercises({});
      return;
    }

    try {
      // Fetch all data concurrently
      const [routinesRes, exercisesRes, trackedExercisesRes, profileRes] =
        await Promise.allSettled([
          Axios.get(`${apiURL}/get/routines/${loginStatus.id}`),
          Axios.get(`${apiURL}/get/exercises/${loginStatus.id}`),
          Axios.get(`${apiURL}/get/tracked-exercises/${loginStatus.id}`),
          Axios.get(`${apiURL}/get/profile/${loginStatus.id}`),
        ]);

      // Handle routines and exercises
      setRoutines(
        routinesRes.status === "fulfilled" ? routinesRes.value.data || [] : []
      );
      setExercises(
        exercisesRes.status === "fulfilled" ? exercisesRes.value.data || [] : []
      );

      // Handle tracked exercises
      if (
        trackedExercisesRes.status === "fulfilled" &&
        trackedExercisesRes.value.data.length > 0
      ) {
        let groupedExercises = trackedExercisesRes.value.data.reduce(
          (acc, exercise) => {
            acc[exercise.name] = acc[exercise.name] || [];
            acc[exercise.name].push(exercise);
            return acc;
          },
          {}
        );

        try {
          const trackedOrderRes = await Axios.get(
            `${apiURL}/get/tracked-exercise-order/${loginStatus.id}`
          );
          if (trackedOrderRes.data.length > 0) {
            groupedExercises["sortOrder"] = trackedOrderRes.data.map(
              (exercise) => ({
                id: exercise.id,
                user_id: exercise.user_id,
                name: exercise.name,
                sort_order: exercise.sort_order,
              })
            );
          }
        } catch (orderError) {
          console.error("Error fetching tracked exercise order:", orderError);
        }

        setTrackedExercises(groupedExercises);
      } else {
        setTrackedExercises({});
      }

      // Handle profile (create if not found)
      if (profileRes.status === "fulfilled") {
        setUserProfile(profileRes.value.data);
      } else if (
        profileRes.reason.response &&
        profileRes.reason.response.status === 404
      ) {
        // Profile not found, create new one
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

        // Fetch and set the newly created profile
        try {
          const newProfileRes = await Axios.get(
            `${apiURL}/get/profile/${loginStatus.id}`
          );
          setUserProfile(newProfileRes.data);
        } catch (fetchError) {
          console.error("Error fetching newly created profile:", fetchError);
          setUserProfile(newProfile); // Fallback: set default profile if fetch fails
        }
      } else {
        console.error("Error fetching profile data:", profileRes.reason);
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchWeightData = async (
    apiURL,
    loginStatus,
    userProfile,
    setPreviousWeight,
    setWeightData
  ) => {
    if (!loginStatus) {
      setPreviousWeight({});
      setWeightData([]);
      return;
    }

    try {
      const response = await Axios.get(
        `${apiURL}/get/weight/${loginStatus.id}`
      );
      const weightData = response.data;
      setPreviousWeight(weightData[weightData.length - 1]);

      if (userProfile && userProfile.measurement_type !== "imperial") {
        setWeightData(
          weightData.map((item) => ({
            ...item,
            weight: defaultConvertWeight(item.weight),
          }))
        );
      } else {
        setWeightData(weightData);
      }
    } catch (error) {
      console.error("Error fetching weight data:", error);
    }
  };

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
    fetchLoginStatus(apiURL, setLoginStatus);
  }, [setLoginStatus, apiURL]);

  useEffect(() => {
    fetchUserData(
      apiURL,
      loginStatus,
      setUserProfile,
      setRoutines,
      setExercises,
      setTrackedExercises
    );
  }, [loginStatus, apiURL]);

  useEffect(() => {
    fetchWeightData(
      apiURL,
      loginStatus,
      userProfile,
      setPreviousWeight,
      setWeightData
    );
  }, [loginStatus, userProfile, apiURL, setPreviousWeight]);

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
