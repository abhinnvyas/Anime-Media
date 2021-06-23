import { Button, Input, Modal } from "@material-ui/core";
import React, { useState } from "react";
import "./ProfileInfo.css";
import { storage } from "./firebase.js";
import firebase from "firebase";
import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import { pink } from "@material-ui/core/colors";
import ReactLoading from "react-loading";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    "& > *": {
      margin: theme.spacing(1),
    },
  },

  large: {
    width: theme.spacing(20),
    height: theme.spacing(20),
  },
  pink: {
    color: theme.palette.getContrastText(pink[500]),
    backgroundColor: pink[500],
  },
  paper: {
    position: "absolute",
    width: 200,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    borderRadius: "10px",
  },
}));

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

function ProfileInfo({ user }) {
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const modalStyle = getModalStyle();
  const [loadingSpinner, setLoadingSpinner] = useState(false);

  const handleChange = (event) => {
    if (event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handlePosts = (event) => {
    event.preventDefault();

    // this automatically creates a folder called "images"
    const uploadTask = storage
      .ref(`${user}/profileImages/${image.name}`)
      .put(image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setLoadingSpinner(true);
        setProgress(progress);
      },
      (error) => {
        alert(error.message);
      },
      () => {
        // complete function
        storage
          .ref(`${user}/profileImages`)
          .child(image.name)
          .getDownloadURL() // getting the url to our file
          .then((url) => {
            firebase.auth().currentUser.updateProfile({
              photoURL: url,
            });

            setImage(null);
            setProgress(0);
            setOpen(false);
            setLoadingSpinner(false);
          });
      }
    );
  };

  return (
    <div className="profileInfo">
      <h1>Profile</h1>

      <div className="profileInfo__profilePic">
        {/* Cureent Profile Pic */}
        {/* upload button */}

        <center>
          <div className="uploadImage">
            <Avatar className={classes.large} src={user?.photoURL}></Avatar>

            <Avatar
              className={`avatar ${classes.pink}`}
              onClick={() => setOpen(true)}
            >
              <AddIcon />
            </Avatar>
          </div>
          <div className="profileInfo__username">
            <h3 className="profileInfo__username__h3">Username</h3>
            <div className="displayName">
              <h4 className="profileInfo__username__h4">{user.displayName}</h4>
            </div>
          </div>

          <div className="profileInfo__email">
            <h3 className="profileInfo__email__h3">Email</h3>
            <div className="email">
              <h4 className="profileInfo__email__h4">{user.email}</h4>
            </div>
          </div>
        </center>

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <div style={modalStyle} className={classes.paper}>
            {loadingSpinner ? (
              <center>
                <ReactLoading type="spin" color="lightgrey" />
                <h2 className="createPostText">Uploading</h2>
                <p>Please wait...</p>
              </center>
            ) : (
              <>
                <center>
                  <Avatar className={classes.large} src={user?.photoURL} />
                </center>
                <form className="app__signup">
                  <center>
                    <h2 className="createPostText">Upload Picture</h2>
                  </center>
                  <center>
                    <progress
                      className="progressBar"
                      value={progress}
                      max="100"
                    />
                  </center>
                  <Input type="file" onChange={handleChange} />
                  <Button onClick={handlePosts}>Upload</Button>
                </form>
              </>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default ProfileInfo;
