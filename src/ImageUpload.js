import { Button, Input, makeStyles, Modal } from "@material-ui/core";
import React, { useState } from "react";
import { db, storage } from "./firebase.js";
import firebase from "firebase";
import Avatar from "@material-ui/core/Avatar";
import AddIcon from "@material-ui/icons/Add";
import { pink } from "@material-ui/core/colors";
import ReactLoading from "react-loading";
import "./ImageUpload.css";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  pink: {
    color: theme.palette.getContrastText(pink[500]),
    backgroundColor: pink[500],
  },
  paper: {
    position: "absolute",
    width: 200,
    backgroundColor: theme.palette.background.paper,
    // border: "1px solid #000",
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

function ImageUpload({ username, photoURL }) {
  const [caption, setCaption] = useState("");
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

  const handlePost = (event) => {
    event.preventDefault();

    // this automatically creates a folder called "images"
    const uploadTask = storage.ref(`images/${image.name}`).put(image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // progress function
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
        setLoadingSpinner(true);
      },
      (error) => {
        //error function
        alert(error.message);
      },
      () => {
        // complete function
        storage
          .ref("images")
          .child(image.name)
          .getDownloadURL() // getting the url to our file
          .then((url) => {
            //adding to the firestore db
            db.collection("posts").add({
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              caption: caption,
              imageURL: url,
              username: username,
              avatarURL: photoURL,
            });

            setProgress(0);
            setCaption("");
            setImage(null);
            setOpen(false);
            setLoadingSpinner(false);
          });
      }
    );
  };

  return (
    <div>
      <Avatar
        className={`avatar ${classes.pink}`}
        onClick={() => setOpen(true)}
      >
        <AddIcon />
      </Avatar>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
            {loadingSpinner ? (
              <center>
                <ReactLoading type="spin" color="lightgrey" />
                <h2 className="createPostText">Uploading</h2>
                <p>Please wait...</p>
              </center>
            ) : (
              <>
                <center>
                  <h2 className="createPostText">Create a Post</h2>
                </center>
                <center>
                  <progress
                    className="progressBar"
                    value={progress}
                    max="100"
                  />
                </center>
                <Input
                  type="text"
                  placeholder="Caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
                <Input type="file" onChange={handleChange} />
                <Button onClick={handlePost}>Post</Button>
              </>
            )}
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default ImageUpload;
