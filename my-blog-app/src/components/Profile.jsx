import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import FormData from "form-data";
import { FaArrowCircleLeft } from "react-icons/fa";
import "../style/profile.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { FaPencilAlt } from "react-icons/fa"; // Import the pencil icon from react-icons

const Profile = () => {
  const [user, setUser] = useState({
    avatar: "",
    display_name: "",
    bio: "",
    email: "",
    password: null,
    googleId: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordFormData, setChangePasswordFormData] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  const [editFormData, setEditFormData] = useState({
    display_name: "",
    bio: "",
  });
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const navigate = useNavigate();

  const fileInputRef = React.createRef();

  // Define fetchUserData function using useCallback
  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:4000/check-auth", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("User data fetch failed");
      }
      const userData = await response.json();
      setUser({ ...userData });
      if (userData.password === null) {
        setIsSettingPassword(true);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      navigate("/login");
    }
  }, [navigate]); // navigate is a dependency

  // Initial useEffect to fetch user data
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]); // fetchUserData is now a dependency

  // Fetch user data again when password is updated
  useEffect(() => {
    if (passwordUpdated) {
      fetchUserData();
      setPasswordUpdated(false); // Reset the flag
    }
  }, [passwordUpdated, fetchUserData]); // fetchUserData is now a dependency

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleEditProfileClick = () => {
    // Handle profile edit logic
    setEditFormData({
      display_name: user.display_name,
      bio: user.bio,
    });
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleEditFormSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error("Profile update failed");
      }

      const updatedUser = await response.json();
      setUser({ ...user, ...updatedUser });
      handleCloseModal();
    } catch (error) {
      console.error("Updated error:", error);
    }
  };

  const handleChangeAvatarClick = () => {
    // When the change avartar button is clicked, trigger the file input
    fileInputRef.current.click();
  };

  const handleChangeAvatar = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file); // Append the file to the form data

    try {
      const response = await fetch(
        "http://localhost:4000/user/profile/avatar",
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      const updatedUser = await response.json();
      setUser({ ...user, avatar_path: updatedUser.avatar_path }); // Update user state with new avatar path
    } catch (error) {
      console.error("Upload error", error);
    }
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@#$%^&*]{8,}$/;
    return re.test(password);
  };

  const handleSetPasswordModal = () => {
    setIsSettingPassword(!isSettingPassword);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword(passwordFormData.password)) {
      alert(
        "Password must be at least 8 characters long and include 1 lowercase letter, 1 uppercase letter, and 1 digit."
      );
      return;
    }
    if (passwordFormData.password !== passwordFormData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    try {
      const response = await fetch("http://localhost:4000/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ password: passwordFormData.password }),
      });
      if (!response.ok) {
        throw new Error("Failed to set password.");
      }
      alert("Password set successfully.");
      handleSetPasswordModal();
      setPasswordUpdated(true); // Update the passwordUpdated state
    } catch (error) {
      console.error("Password set error", error);
    }
  };

  const handleSetChangePasswordModal = () => {
    setIsChangingPassword(!isChangingPassword);
  };

  const handleNewPasswordChange = (e) => {
    const { name, value } = e.target;
    setChangePasswordFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword(changePasswordFormData.newPassword)) {
      alert(
        "Password must be at least 8 characters long and include 1 lowercase letter, 1 uppercase letter, and 1 digit and cannot contain special characters other than @#$%^&*."
      );
      return;
    }
    if (
      changePasswordFormData.newPassword !==
      changePasswordFormData.confirmNewPassword
    ) {
      alert("Passwords do not match.");
      return;
    }
    try {
      // Submit new password to the backend
      const response = await fetch("http://localhost:4000/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ password: changePasswordFormData.newPassword }),
      });
      if (!response.ok) {
        throw new Error("Failed to change password.");
      }
      alert("Password changed successfully.");
      handleSetChangePasswordModal();
      setPasswordUpdated(true);
    } catch (error) {
      console.error("Password change error", error);
    }
  };

  return (
    <div className="profile-container container">
      <FaArrowCircleLeft
        className="single-go-back-icon"
        onClick={handleGoBack}
      />
      <div className="row">
        <div className="col-12 col-md-4">
          <div className="profile-avatar-wrapper">
            <div className="avatar-and-button">
              <img
                src={
                  `http://localhost:4000/${user.avatar_path}` ||
                  "default-avatar.png"
                }
                alt="Avatar"
                className="profile-avatar img-thumbnail rounded-circle"
              />
              <button
                onClick={handleChangeAvatarClick}
                className="btn change-avatar-btn"
              >
                <FaPencilAlt />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleChangeAvatar}
                style={{ display: "none" }}
                accept="image/*" // Accept only image files
              ></input>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-8" id="profile-right-part">
          <div className="profile-info text-center text-md-left">
            <h2>{user.display_name}</h2>
            <p>{user.bio || "No bio available"}</p>
            <p>Email: {user.email}</p>
            <div id="profile-edit-and-set-pswd">
              <button
                onClick={handleEditProfileClick}
                className="btn btn-outline-secondary"
              >
                Edit Profile
              </button>
              {/* Conditionally render Set or Change Password button */}
              {user.password === null ? (
                <button
                  onClick={handleSetPasswordModal}
                  className="btn btn-primary profile-set-password-btn"
                >
                  Set Password
                </button>
              ) : (
                <button
                  onClick={handleSetChangePasswordModal}
                  className="btn btn-warning profile-change-password-btn"
                >
                  Change Password
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* React Bootstrap Edit Profile Modal */}
      <Modal show={isEditing} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleEditFormSubmit}>
            <div className="form-group">
              <label htmlFor="display_name">Display Name:</label>
              <input
                type="text"
                className="form-control"
                id="display_name"
                name="display_name"
                maxLength="50"
                placeholder="max 50 characters"
                value={editFormData.display_name}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="bio">Bio:</label>
              <textarea
                className="form-control"
                id="bio"
                name="bio"
                maxLength="200"
                placeholder="max 200 characters"
                value={editFormData.bio}
                onChange={handleEditFormChange}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditFormSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modal for setting password */}
      <Modal show={isSettingPassword} onHide={handleSetPasswordModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Set Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmitPassword}>
            <div className="form-group">
              <label htmlFor="password">New Password:</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={passwordFormData.password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordFormData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="profile-submit-pswd-btn"
            >
              Set Password
            </Button>
          </form>
        </Modal.Body>
      </Modal>
      {/* Modal for changing password */}
      <Modal
        show={isChangingPassword}
        onHide={handleSetChangePasswordModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleChangePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="newPassword">New Password:</label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                name="newPassword"
                value={changePasswordFormData.newPassword}
                onChange={handleNewPasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmNewPassword">Confirm New Password:</label>
              <input
                type="password"
                className="form-control"
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={changePasswordFormData.confirmNewPassword}
                onChange={handleNewPasswordChange}
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="profile-submit-pswd-btn"
            >
              Change Password
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Profile;
