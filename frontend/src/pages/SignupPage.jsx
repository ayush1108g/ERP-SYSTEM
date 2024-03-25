import React, { useState, useRef, useContext } from "react"
import classes from "./signup.module.css";
import { backendUrl } from "../constant.js";
import axios from "axios";
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri";
import { useAlert } from "../store/context/Alert-context.js";
import LoginContext from "../store/context/loginContext.js";
import { useNavigate } from "react-router";
import { useCookies } from "react-cookie";

const SignupPage = () => {

    const [showPassword, setShowPassword] = useState(false);

    const Loginctx = useContext(LoginContext);
    const Alertctx = useAlert();
    const [cookie, setCookie] = useCookies(["AccessToken", "RefreshToken"]);
    const navigate = useNavigate();

    const [role, setRole] = useState('');
    const passwordInputRef = useRef(null);
    const datepickerRef = useRef('');
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [rollNumber, setRollNumber] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [gender, setGender] = useState("");
    const [dept, setDept] = useState("");
    const [batch, setBatch] = useState("");
    const [semester, setSemester] = useState("");
    const [program, setProgram] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [profile, setProfile] = useState(null);
    const [profileUrl, setProfileUrl] = useState("");
    const [fileuploading, setFileuploading] = useState(false);

    const handleTogglePassword = (e) => {
        e.preventDefault();
        setShowPassword(!showPassword);
    };

    const handleLogin = () => {
        navigate("/login");
    }

    const handleSubmitSignup = async () => {
        if (!role || !email || !name || !phone || !address)
            return Alertctx.showAlert("danger", "Please fill all the fields");
        if (role === 'student' && !rollNumber)
            return Alertctx.showAlert("danger", "Please fill all the fields");
        if (profile !== null && profileUrl === '') {
            await uploadHandler();
        }
        const dob = datepickerRef.current.value;
        const password = passwordInputRef.current.value;

        if (dob === "" || dob === null || dob === undefined || dob.split('-').length !== 3) {
            alert("Please enter a valid date of birth");
            return;
        }
        if (password.length < 8 || !password) {
            alert("Password must be at least 8 characters long");
            return;
        }
        setLoading(true);
        const nprogram = Array.from(program.split(','));
        const ndept = Array.from(dept.split(','));
        const nbatch = Array.from(batch.split(','));
        const nsemester = Array.from(semester.split(','));

        const profile_picture = profileUrl === '' ? null : profileUrl;

        const data = {
            role,
            email,
            password,
            personal_info: {
                name,
                rollNumber,
                phone,
                address,
                date_of_birth: dob,
                gender,
                profile_picture: profile_picture,
            },
            academic_info: {
                program: nprogram,
                department: ndept,
                batch: nbatch,
                semester: nsemester,
            },
        }

        try {
            const res = await axios.post(`${backendUrl}/api/v1/users/signup`, data);
            console.log(res);
            if (role === 'student') {
                Alertctx.showAlert("success", "Signup successful");

                setCookie("AccessToken", res.data.AccessToken, { path: "/", maxAge: 60 * 60 * 24 * 1 * 0.2 });
                setCookie("RefreshToken", res.data.RefreshToken, { path: "/", maxAge: 60 * 60 * 24 * 30 * 0.6 });

                Loginctx.login(res.data.AccessToken, res.data.RefreshToken, res.data.data.user);
                navigate("/");
            } else {
                Alertctx.showAlert("success", "Signup successful please login to continue");
            }
        } catch (err) {
            console.log(err);
            if (err?.response?.data?.message)
                setError(err?.response?.data?.message);
            else
                setError("Something went wrong");
        } finally {
            setLoading(false);
        }

    }

    const uploadHandler = async () => {
        if (fileuploading) {
            alert("File is uploading, please wait");
            return;
        }
        if (!profile) {
            alert("Please select a file");
            return;
        }
        console.log('Selected file:', profile);

        const formData = new FormData();
        formData.append("file", profile);

        console.log(formData);
        setFileuploading(true);
        try {
            const res = await axios.post(`${backendUrl}/api/v1/submitAssignment/upload-file`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log(res);
            const id = res.data.data.id;
            const url = `https://drive.google.com/file/d/${id}/view?usp=sharing`;
            setProfileUrl(url);
        } catch (err) {
            console.log(err);
            setError("Error uploading file");
        } finally {
            setFileuploading(false);
        }
    }
    return (<div style={{
        display: "flex",
        justifyContent: "center",
        // width: "100vw",
        // height: "100vh",
    }}>

        <div className={classes.container}>
            <h1 className={classes.h1}>Sign Up</h1>
            <div class={classes.gridContainer}>

                <div className={`${classes.gridItem} input-group mb-3`}>
                    <span class="input-group-text" id="10">Role</span>
                    <select class="form-control shadow-none" aria-label="Large select example"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option selected>Select Role</option>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className={`${classes.gridItem} input-group mb-3`}>
                    <span class="input-group-text" id="3">Email</span>
                    <input type="text" class="form-control shadow-none " placeholder="xyz@iitbbs.ac.in" aria-label="xyz@gmail.com" aria-describedby="3"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className={`${classes.gridItem} input-group mb-3`}>
                    <span class="input-group-text" id="1">Name</span>
                    <input type="text" class="form-control shadow-none " placeholder="Username" aria-label="Username" aria-describedby="1"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {role === 'student' && <div className={`${classes.gridItem} input-group mb-3`}>
                    <span class="input-group-text" id="2">Roll Number</span>
                    <input type="text" class="form-control shadow-none " placeholder="Roll number" aria-label="Roll number" aria-describedby="2"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                    />
                </div>}

                <div className={`${classes.gridItem} input-group mb-3`}>
                    <span class="input-group-text" id="5">Phone</span>
                    <input type="text" class="form-control shadow-none " aria-label="xyz@gmail.com" aria-describedby="5"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>

                <div className={`${classes.gridItem} input-group mb-3`}>
                    <span class="input-group-text" id="9">Gender</span>
                    <select class="form-control shadow-none" aria-label="Large select example"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                    >
                        <option selected>Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="none">Rather not say</option>
                    </select>
                </div>

                <div className={`${classes.gridItem} input-group mb-3`}>
                    <span class="input-group-text" id="5">DOB</span>
                    <input ref={datepickerRef} type="text" class="form-control shadow-none "
                        placeholder="DD-MM-YYYY"
                        aria-label="01-01-2000" aria-describedby="5" />
                </div>

                {role !== "admin" && <div className={`${classes.gridItem} input-group mb-3`}>
                    <span className="input-group-text">
                        <label for="exampleDataList" class="form-label">Program</label>
                    </span>
                    <input type="text" class="form-control shadow-none" list="datalistOptions"
                        placeholder={role === "teacher" ? "CS,EC,... Enter all programs you are taking" : "Enter your enrolled program "}
                        id="5"
                        value={program}
                        onChange={(e) => setProgram(e.target.value)}
                    />
                    <datalist id="datalistOptions">
                        <option value="CS" />
                        <option value="EC" />
                        <option value="EE" />
                        <option value="ME" />
                        <option value="CE" />
                        <option value="MM" />
                        <option value="PHD" />
                        <option value="MSC" />
                        <option value="MTECH" />
                        <option value="ITEP" />
                    </datalist>
                </div>}

                {role !== "admin" && <div className={`${classes.gridItem} input-group mb-3`}>
                    <span className="input-group-text">
                        <label for="exampleDataList2" class="form-label">Department</label>
                    </span>
                    <input type="text" class="form-control shadow-none" list="datalistOptions2"
                        placeholder={role === "teacher" ? "SBS,SMS,... Enter all department you are taking" : "Enter your enrolled department "}
                        id="6"
                        value={dept}
                        onChange={(e) => setDept(e.target.value)}
                    />
                    <datalist id="datalistOptions2">
                        <option value="SBS" />
                        <option value="SES" />
                        <option value="SMS" />
                        <option value="SIF" />
                        <option value="ITEP" />
                        <option value="SMMME" />
                        <option value="SEOCS" />
                        <option value="SHSSM" />
                    </datalist>
                </div>}

                {role !== "admin" && <div className={`${classes.gridItem} input-group mb-3`}>
                    <span className="input-group-text">
                        <label for="exampleDataList3" class="form-label">Batch</label>
                    </span>
                    <input type="text" class="form-control shadow-none" list="datalistOptions3"
                        placeholder={role === "teacher" ? "2020,2022,... Enter all batch you are taking" : "Enter your batch year"}
                        id="7"
                        value={batch}
                        onChange={(e) => setBatch(e.target.value)}
                    />
                    <datalist id="datalistOptions3">
                        <option value="2018" />
                        <option value="2019" />
                        <option value="2020" />
                        <option value="2021" />
                        <option value="2022" />
                        <option value="2023" />
                    </datalist>
                </div>}

                {role !== "admin" && <div className={`${classes.gridItem} input-group mb-3`}>
                    <span className="input-group-text">
                        <label for="exampleDataList4" class="form-label">Semester</label>
                    </span>
                    <input type="text" class="form-control shadow-none" list="datalistOptions40"
                        placeholder={role === "teacher" ? "1,3,... Enter all sem you are taking" : "Enter your current sem"}
                        id="8"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                    />
                    <datalist id="datalistOptions40">
                        <option value="1" />
                        <option value="2" />
                        <option value="3" />
                        <option value="4" />
                    </datalist>
                </div>
                }
                <div className="input-group mb-3">
                    <span class="input-group-text">Password</span>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        className="form-control shadow-none "
                        placeholder={!showPassword ? " · · · · · · · · " : "password"}
                        ref={passwordInputRef}
                        pattern=".{8,}"
                        title="Password must be at least 8 characters long"
                        required
                    />
                    <span className="input-group-text" onClick={handleTogglePassword}>
                        {showPassword ? <RiEyeOffFill /> : <RiEyeFill />}
                    </span>
                </div>


            </div>
            <div class={`${classes.gridContainer} ${classes.Container2}`}>
                <div className={`${classes.gridItem} input-group mb-3`}>
                    <span class="input-group-text" id="10">Address</span>
                    <input type="text" className="form-control shadow-none w-75"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>

            </div>
            <div className={classes.photo}>
                <h5>Profile Photo</h5>
                <div class={`${classes.gridContainer} ${classes.Container2}`}>

                    <div className={`${classes.gridItem} input-group mb-3`}>
                        <input type="file" class="form-control shadow-none " id="inputGroupFile02"
                            // value={profile}
                            onChange={(e) => setProfile(e.target.files[0])}
                        />
                        <span class="input-group-text" for="inputGroupFile02" onClick={uploadHandler}>

                            {!fileuploading && 'Upload'}
                            {fileuploading && (
                                <div className="spinner-border text-danger" role="status">
                                </div>
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {!loading && <p className={classes.loading}> {error}</p>}
            {loading && <p className={classes.loading}>&nbsp; </p>}
            <div className={classes.button}>
                <button type="button" class={` btn btn-success`}

                    onClick={handleSubmitSignup}
                    disabled={loading}
                >

                    {!loading && "Submit"}
                    {loading && (
                        <div className="spinner-border text-danger" role="status">
                        </div>
                    )}
                </button>
                <div style={{
                    // marginLeft: "25px",
                    marginTop: "20px",
                }}><p onClick={handleLogin}>

                        Already have an account? <span style={{ color: "blue", cursor: "pointer" }}>Login</span>
                    </p>
                </div>

            </div>
        </div>
    </div>
    )
}

export default SignupPage;

