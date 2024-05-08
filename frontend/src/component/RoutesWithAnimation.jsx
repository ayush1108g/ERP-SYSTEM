import React, { useContext, useEffect } from "react";

import { Route, Routes, useLocation, useNavigate, } from "react-router-dom";
import { useCookies } from "react-cookie";
import { verifyToken, refreshAccessToken } from "../store/utils/auth";
import { backendUrl } from "../constant";
import axios from "axios";
import LoginContext from "../store/context/loginContext";

import SignupPage from "../pages/SignupPage";
import LoginPage from "../pages/LoginPage";
import ForgotPassPage from "../pages/ForgotPass/ForgotPassPage";
import ForgotPassIDPage from "../pages/ForgotPass/ForgotPassIDPage";
import ForgotPassConfirmPage from "../pages/ForgotPass/ForgotPassConfirmPage";
import Errorpage from "../pages/Errorpage";
import HomePage from "../pages/HomePage/HomePage";

import Attendance from "../pages/AttendancePages/Attendance";
import ProfilePage from "./ProfilePage";
import AddCourses from "../pages/CoursePages/Add_courses";
import AddAnnouncement from "./AddAnnouncement";
import AdminDashBoard from "./AdminDashboard";
import ApproveUser from "./ApproveUser";
import AddInventoryItem from "../pages/SACInventoryPages/AddInventoryItem";
import UpdateInventoryItem from "../pages/SACInventoryPages/UpdateInventoryItem";
import FeedbackForm from "./FeedbackForm";

import InventoryForm from "../pages/SACInventoryPages/InventoryForm";
import InventoryPage from "../pages/SACInventoryPages/InventoryPage";

import MyCourses from "../pages/CoursePages/MyCourses";
import MySpecificCourse from "../pages/CoursePages/MySpecificCourse";
import SpecificCourseAssignments from "../pages/CoursePages/SpecificCourseAssignments";
import SpecificAssignment from "../pages/CoursePages/SpecificAssignment";
import AssignmentUpload from "../pages/CoursePages/AssignmentUpload";

import AttendanceAdmin from "../pages/AttendancePages/ViewAttendance";
import CourseRegistration from "./CourseRegistration";

// All Routes with animation and token verification
const RoutesWithAnimation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const authCtx = useContext(LoginContext);
    const [cookie] = useCookies(["AccessToken", "RefreshToken"]);

    // Verify the token and set the user data in the context
    useEffect(() => {
        const asyncFunc = async (AccessToken) => {
            try {
                const token = AccessToken;
                const response = await verifyToken(token);
                console.log(response);
                if (response?.isLoggedin === true) {
                    authCtx.setAccessToken(token);
                    authCtx.setRefreshToken(cookie?.RefreshToken);
                    authCtx.setIsLoggedIn(true);
                    authCtx.setName(response?.name);
                    authCtx.setLoading(false);
                }
            } catch (err) {
                if (
                    err.message === "jwt expired" ||
                    err?.response?.data?.message === "jwt expired"
                ) {
                    console.log("jwt expired");
                    return refreshAccessToken(asyncFunc, authCtx);
                }
                console.log(err);
            }
        };
        console.log(cookie.AccessToken);
        asyncFunc(cookie.AccessToken);
    }, []);

    // Redirect to login page if not logged in
    useEffect(() => {
        setTimeout(() => {
            if (authCtx.isLoggedIn === false) {
                navigate("/login");
            }
        }, 1000);
    }, [authCtx.isLoggedIn]);

    // Update the user data in the context
    useEffect(() => {
        const asyncFunc0 = async () => {
            if (!authCtx.user) {
                try {
                    const resp = await axios.get(`${backendUrl}/api/v1/users/update`, { headers: { Authorization: `Bearer ${cookie.AccessToken}` }, });
                    console.log(resp.data.data);
                    authCtx.setUser(resp.data.data);
                    console.log(resp);
                } catch (err) {
                    console.log(err);
                }
            }
        };
        asyncFunc0();
    }, [authCtx, cookie.AccessToken]);

    return (<Routes location={location} key={location.key}>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/forgotpassword" element={<ForgotPassPage />} />
        <Route path="/login/forgotpassword/:id" element={<ForgotPassIDPage />} />
        <Route path="/login/forgotpassword/:id/confirm" element={<ForgotPassConfirmPage />} />
        <Route path="/login/forgotpassword/:id" element={<ForgotPassIDPage />} />
        <Route path="/login/forgotpassword/:id/confirm" element={<ForgotPassConfirmPage />} />

        <Route path="/my_courses" element={<MyCourses />} />
        <Route path="/my_courses/:courseId" element={<MySpecificCourse />} />
        <Route path="/my_courses/:courseId/feedback" element={<FeedbackForm />} />
        <Route path="/my_courses/:courseId/assignments" element={<SpecificCourseAssignments />} />
        <Route path="/my_courses/:courseId/assignments/:assignmentId" element={<SpecificAssignment />} />
        <Route path="/:courseId/assignment_upload" element={<AssignmentUpload />} />

        <Route path="/registration" element={<CourseRegistration />} />
        <Route path="/inventory/:equipmentId" element={<InventoryForm />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance/admin/:courseId" element={<AttendanceAdmin />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/feedback" element={<FeedbackForm />} />

        {authCtx.role === "admin" && (
            <>
                <Route path="/add_inventory_item" element={<AddInventoryItem />} />
                <Route path="/approve" element={<ApproveUser />} />
                <Route path="/add_courses" element={<AddCourses />} />
                <Route path="/add_announcement" element={<AddAnnouncement />} />
                <Route path="/:equipmentId/update_inventory_item" element={<UpdateInventoryItem />} />
            </>
        )}

        <Route path="/admin" element={<AdminDashBoard />} />
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Errorpage />} />
    </Routes>);
};

export default RoutesWithAnimation;