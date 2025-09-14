import React, { useState, useEffect, useCallback } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";
import NavbarLoggedIn from "./components/navigation/NavbarLoggedIn";
import NavbarLoggedOut from "./components/navigation/NavbarLoggedOut";
import Dashboard from "./features/dashboard/Dashboard";
import Register from "./features/auth/Register";
import Login from "./features/auth/Login";
import Root from "./components/navigation/Root";
import ProfilePage from "./features/profile/ProfilePage";
import ProfileForm from "./features/profile/ProfileForm";
import Home from "./pages/Home";
import "./styles/App.css";
import Axios from "axios";
import OTPClass from "./features/auth/OTP";
import ResetPassword from "./features/auth/ResetPassword";
import WalkthroughModal from "./features/help/WalkthroughModal";

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
  const [workoutLog, setWorkoutLog] = useState([]);
  const [openMenus, setOpenMenus] = useState({});
  const [showWalkthroughModal, setShowWalkthroughModal] = useState(false);
  const formattedDate = new Date().toISOString().split("T")[0];

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatDateForSQL = (date) => {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const todaySQL = formatDateForSQL(new Date());

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

  const fetchUserData = useCallback(
    async (
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
        const [
          routinesRes,
          exercisesRes,
          trackedExercisesRes,
          profileRes,
          workoutLogRes,
        ] = await Promise.allSettled([
          Axios.get(`${apiURL}/get/routines/${loginStatus.id}`),
          Axios.get(`${apiURL}/get/exercises/${loginStatus.id}`),
          Axios.get(`${apiURL}/get/tracked-exercises/${loginStatus.id}`),
          Axios.get(`${apiURL}/get/profile/${loginStatus.id}`),
          Axios.get(`${apiURL}/get/workout-log/${loginStatus.id}/${todaySQL}`),
        ]);

        // Handle routines and exercises
        setRoutines(
          routinesRes.status === "fulfilled" ? routinesRes.value.data || [] : []
        );
        setExercises(
          exercisesRes.status === "fulfilled"
            ? exercisesRes.value.data || []
            : []
        );
        setTrackedExercises(
          trackedExercisesRes.status === "fulfilled"
            ? trackedExercisesRes.value.data || {}
            : {}
        );

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

        // Handle workout log
        const todaysWorkoutLog = [];
        if (workoutLogRes.status === "fulfilled") {
          const id = workoutLogRes.value.data.id;

          try {
            const logExercisesRes = await Axios.get(
              `${apiURL}/get/log-exercises/${id}`
            );
            const logExercises = logExercisesRes.data || [];

            const logSetsPromises = logExercises.map((logEx) =>
              Axios.get(`${apiURL}/get/log-sets/${logEx.id}`)
                .then((res) => ({ id: logEx.id, sets: res.data || [] }))
                .catch((err) => {
                  console.error(
                    `Failed to fetch sets for logEx ${logEx.id}:`,
                    err
                  );
                  return { id: logEx.id, sets: [] };
                })
            );

            const logSetsResults = await Promise.all(logSetsPromises);

            logSetsResults.forEach(({ id, sets }) => {
              const logEx = logExercises.find((le) => le.id === id);
              todaysWorkoutLog.push({
                name: logEx.exercise_name,
                tracked: logEx.tracked,
                bw: logEx.bw,
                sets,
              });
            });
          } catch (logExError) {
            console.error("Failed to fetch log exercises:", logExError);
          }
        }

        setWorkoutLog(todaysWorkoutLog);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    [todaySQL]
  );

  const fetchWeightData = useCallback(
    async (
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
    },
    []
  );

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

  const safeParseInt = (str) => {
    try {
      const parsedValue = parseInt(str);
      if (!isNaN(parsedValue) && parsedValue >= 1) {
        if (str.length >= 3) {
          return parseInt(str.slice(0, 2));
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
                formatDate={formatDate}
                routines={routines}
                setRoutines={setRoutines}
                exercises={exercises}
                setExercises={setExercises}
                workoutLog={workoutLog}
                setWorkoutLog={setWorkoutLog}
                trackedExercises={trackedExercises}
                setTrackedExercises={setTrackedExercises}
                weightData={weightData}
                setWeightData={setWeightData}
                setUserProfile={setUserProfile}
                convertWeight={convertWeight}
                defaultConvertWeight={defaultConvertWeight}
                safeParseInt={safeParseInt}
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
  }, [loginStatus, apiURL, fetchUserData]);

  useEffect(() => {
    fetchWeightData(
      apiURL,
      loginStatus,
      userProfile,
      setPreviousWeight,
      setWeightData
    );
  }, [loginStatus, userProfile, apiURL, setPreviousWeight, fetchWeightData]);

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
